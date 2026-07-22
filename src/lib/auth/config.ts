export const AUTH_COOKIE_NAME = "auth_token";

export const JWT_EXPIRY = "8h";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be set in environment and be at least 32 characters",
    );
  }
  return secret;
}

export const DEFAULT_SEED_PASSWORD = "Password123!";
