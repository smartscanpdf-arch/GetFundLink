import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "noreply@fundlink.in";
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Welcome email ────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Welcome to FundLink, ${name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
          <div style="width:36px;height:36px;border-radius:10px;background:#1FA3A3;display:flex;align-items:center;justify-content:center">
            <span style="color:#fff;font-weight:800;font-size:16px">F</span>
          </div>
          <span style="font-weight:800;font-size:20px;color:#0F172A">Fund<span style="color:#1FA3A3">Link</span></span>
        </div>
        <h1 style="font-size:24px;font-weight:800;color:#0F172A;margin-bottom:12px">Welcome, ${name}! 🎉</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.6;margin-bottom:24px">
          You've joined FundLink as a <strong>${role}</strong>. India's most curated startup–investor network is now open to you.
        </p>
        <a href="${APP}/dashboard/${role}" style="display:inline-block;background:#1FA3A3;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
          Go to Dashboard →
        </a>
        <p style="color:#94A3B8;font-size:13px;margin-top:32px">
          Need help? Reply to this email or visit <a href="${APP}/support" style="color:#1FA3A3">our support page</a>.
        </p>
      </div>
    `,
  });
}

// ─── Intro request (to founder) ───────────────────────────────────────────────
export async function sendIntroRequestEmail(opts: {
  founderEmail: string;
  founderName:  string;
  investorName: string;
  investorFirm: string;
  message:      string;
  introId:      string;
}) {
  return resend.emails.send({
    from:    FROM,
    to:      opts.founderEmail,
    subject: `${opts.investorName} wants to connect with you on FundLink`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#0F172A;font-size:20px;font-weight:800;margin-bottom:8px">New Introduction Request</h2>
        <p style="color:#64748B;font-size:15px;line-height:1.6;margin-bottom:20px">
          <strong>${opts.investorName}</strong>${opts.investorFirm ? ` (${opts.investorFirm})` : ''} is interested in connecting with you.
        </p>
        ${opts.message ? `
        <div style="background:#F8FAFC;border-radius:10px;padding:16px;margin-bottom:20px;border-left:3px solid #1FA3A3">
          <p style="color:#475569;font-size:14px;line-height:1.65;margin:0">"${opts.message}"</p>
        </div>` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="${APP}/dashboard/founder?intro=${opts.introId}&action=accept"
            style="background:#1FA3A3;color:#fff;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">
            Accept Introduction
          </a>
          <a href="${APP}/dashboard/founder?intro=${opts.introId}&action=decline"
            style="background:#F1F5F9;color:#64748B;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:600;font-size:14px">
            Decline
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Intro accepted (to investor) ─────────────────────────────────────────────
export async function sendIntroAcceptedEmail(opts: {
  investorEmail: string;
  investorName:  string;
  founderName:   string;
  startupName:   string;
  founderEmail:  string;
}) {
  return resend.emails.send({
    from:    FROM,
    to:      opts.investorEmail,
    subject: `${opts.founderName} accepted your intro request on FundLink`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#10B981;font-size:20px;font-weight:800;margin-bottom:8px">Introduction Accepted! 🎉</h2>
        <p style="color:#64748B;font-size:15px;line-height:1.6;margin-bottom:20px">
          <strong>${opts.founderName}</strong> of <strong>${opts.startupName}</strong> has accepted your introduction request.
          You can now reach them directly at <a href="mailto:${opts.founderEmail}" style="color:#1FA3A3">${opts.founderEmail}</a>.
        </p>
        <a href="${APP}/dashboard/investor/messages"
          style="background:#1FA3A3;color:#fff;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">
          Send a Message →
        </a>
      </div>
    `,
  });
}

// ─── KYC status update ────────────────────────────────────────────────────────
export async function sendKycStatusEmail(opts: {
  to:     string;
  name:   string;
  status: "approved" | "rejected";
  note?:  string;
}) {
  const isApproved = opts.status === "approved";
  return resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Your FundLink KYC verification ${isApproved ? "was approved ✅" : "needs attention"}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:${isApproved?"#10B981":"#EF4444"};font-size:20px;font-weight:800;margin-bottom:8px">
          KYC ${isApproved ? "Approved" : "Rejected"}
        </h2>
        <p style="color:#64748B;font-size:15px;line-height:1.6;margin-bottom:20px">
          Hi ${opts.name}, your identity verification has been <strong>${opts.status}</strong>.
          ${opts.note ? `<br/><br/>Note from our team: ${opts.note}` : ""}
        </p>
        <a href="${APP}/dashboard/${isApproved ? "" : "kyc"}"
          style="background:#1FA3A3;color:#fff;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">
          ${isApproved ? "Go to Dashboard →" : "Re-submit Documents →"}
        </a>
      </div>
    `,
  });
}

// ─── Support ticket reply ─────────────────────────────────────────────────────
export async function sendSupportReplyEmail(opts: {
  to:        string;
  name:      string;
  ticketId:  string;
  subject:   string;
  replyBody: string;
}) {
  return resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Re: [${opts.ticketId}] ${opts.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#0F172A;font-size:18px;font-weight:800;margin-bottom:8px">Support Reply</h2>
        <p style="color:#94A3B8;font-size:12px;margin-bottom:20px">Ticket: ${opts.ticketId} · ${opts.subject}</p>
        <div style="background:#F8FAFC;border-radius:10px;padding:16px;margin-bottom:20px;border-left:3px solid #6366F1">
          <p style="color:#334155;font-size:14px;line-height:1.7;margin:0">${opts.replyBody}</p>
        </div>
        <a href="${APP}/support?ticket=${opts.ticketId}"
          style="background:#6366F1;color:#fff;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">
          View Full Thread →
        </a>
      </div>
    `,
  });
}

// ─── Password reset ───────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: "Reset your FundLink password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#0F172A;font-size:20px;font-weight:800;margin-bottom:12px">Password Reset</h2>
        <p style="color:#64748B;font-size:15px;line-height:1.6;margin-bottom:24px">
          Click the button below to reset your password. This link expires in 30 minutes.
        </p>
        <a href="${resetUrl}"
          style="background:#1FA3A3;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
          Reset Password →
        </a>
        <p style="color:#94A3B8;font-size:13px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
