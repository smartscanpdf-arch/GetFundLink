"use client";
import Image from "next/image";
import { getInitials, avatarColor } from "@/lib/utils";

interface AvatarProps {
  name?:      string | null;
  src?:       string | null;
  size?:      number;
  className?: string;
}

export function Avatar({ name, src, size = 40, className = "" }: AvatarProps) {
  const initials = getInitials(name);
  const color    = avatarColor(name);

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "Avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold ${className}`}
      style={{
        width:      size,
        height:     size,
        background: color,
        fontSize:   size * 0.36,
        color:      "#fff",
      }}
    >
      {initials}
    </div>
  );
}
