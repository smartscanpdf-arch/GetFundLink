import { isValidEmail } from "@/lib/utils";

export interface PasswordStrength {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("At least 8 characters");
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Add numbers");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Add special characters");
  }

  const labels: ("Weak" | "Fair" | "Good" | "Strong")[] = ["Weak", "Fair", "Fair", "Good", "Good", "Strong"];
  
  return {
    score,
    label: labels[score] || "Weak",
    feedback: feedback.slice(0, 2),
  };
}

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: false, message: "Email is required" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true };
}
