import { createHash } from "crypto";

const HASH_PREFIX = "sha256:";

const toSha256 = (raw: string) => {
  return createHash("sha256").update(raw).digest("hex");
};

export const hashPassword = (raw: string) => {
  return `${HASH_PREFIX}${toSha256(raw)}`;
};

export const verifyPassword = (raw: string, hashed: string) => {
  if (!hashed) return false;
  if (hashed.startsWith(HASH_PREFIX)) {
    return hashPassword(raw) === hashed;
  }

  // Backward compatibility for legacy/plain values.
  return raw === hashed;
};
