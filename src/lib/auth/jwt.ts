import { AUTH_COOKIE_NAME, getJwtSecret, JWT_EXPIRY } from "@/lib/auth/config";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

function base64UrlEncode(bytes: Uint8Array | string) {
  const buffer =
    typeof bytes === "string"
      ? new TextEncoder().encode(bytes)
      : bytes;
  let binary = "";
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(content: string, secret: string) {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(content),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(content: string, signature: string, secret: string) {
  const key = await importKey(secret);
  const signatureBytes = Uint8Array.from(
    atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
    (char) => char.charCodeAt(0),
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(content),
  );
}

function getExpirySeconds() {
  const hours = Number.parseInt(JWT_EXPIRY.replace("h", ""), 10);
  return Math.floor(Date.now() / 1000) + hours * 60 * 60;
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  const secret = getJwtSecret();
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(
    JSON.stringify({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      iat: Math.floor(Date.now() / 1000),
      exp: getExpirySeconds(),
    }),
  );
  const signature = await sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }

  const [header, body, signature] = parts;
  const valid = await verify(`${header}.${body}`, signature, getJwtSecret());

  if (!valid) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(base64UrlDecode(body)) as {
    sub?: string;
    email?: string;
    name?: string;
    role?: string;
    exp?: number;
  };

  if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Invalid or expired token");
  }

  return {
    sub: payload.sub,
    email: String(payload.email ?? ""),
    name: String(payload.name ?? ""),
    role: String(payload.role ?? ""),
  };
}

export { AUTH_COOKIE_NAME };
