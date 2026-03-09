// Client-side auth exports
export type { SignUpOptions, SignInOptions, PasswordResetOptions, PasswordUpdateOptions, OAuthOptions, AuthError, AuthResponse } from "./client";
export { signUp, signIn, signInWithOAuth, resetPassword, updatePassword, signOut, getSession, refreshSession } from "./client";

// Server-side auth exports
export { getServerSession } from "./server";

// Validation exports
export type { PasswordStrength } from "./validation";
export { validatePasswordStrength, validateEmail } from "./validation";
