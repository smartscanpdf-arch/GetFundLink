import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_KYC_TYPES   = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const ALLOWED_DECK_TYPES  = ["application/pdf", "application/vnd.ms-powerpoint",
                             "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
const MAX_SIZE_BYTES       = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData  = await request.formData();
  const file      = formData.get("file") as File | null;
  const uploadType = formData.get("type") as string; // 'kyc' | 'deck' | 'avatar' | 'document' | 'event_cover'
  const docType    = formData.get("doc_type") as string | null; // for KYC: 'aadhaar' | 'pan' etc

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  // Validate file type
  if (uploadType === "kyc" && !ALLOWED_KYC_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. PDF or image required." }, { status: 400 });
  }
  if (uploadType === "deck" && !ALLOWED_DECK_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. PDF or PowerPoint required." }, { status: 400 });
  }

  const ext      = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bucketMap: Record<string, string> = {
    kyc:         "kyc-docs",
    deck:        "pitch-decks",
    avatar:      "avatars",
    document:    "documents",
    event_cover: "event-covers",
  };

  const bucket = bucketMap[uploadType];
  if (!bucket) return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

  // Post-upload actions
  if (uploadType === "kyc" && docType) {
    await supabase.from("kyc_documents").insert({
      user_id:   user.id,
      doc_type:  docType,
      file_path: uploadData.path,
      file_name: file.name,
      status:    "pending",
    });

    // Update profile KYC status to pending
    await supabase.from("profiles")
      .update({ kyc_status: "pending" })
      .eq("id", user.id);
  }

  if (uploadType === "deck") {
    await supabase.from("founder_profiles")
      .update({ deck_url: uploadData.path, deck_name: file.name })
      .eq("user_id", user.id);
  }

  if (uploadType === "avatar") {
    await supabase.from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);
  }

  return NextResponse.json({
    path:      uploadData.path,
    publicUrl: uploadType === "avatar" || uploadType === "event_cover" ? publicUrl : null,
    fileName:  file.name,
  });
}
