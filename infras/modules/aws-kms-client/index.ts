import crypto from "node:crypto";

import {
  DecryptCommand,
  GenerateDataKeyCommand,
  KMSClient as AwsKmsClient,
} from "@aws-sdk/client-kms";

export { AwsKmsClient };

export type KMSClient = ReturnType<typeof createKmsClient>;

export type EncryptedPayload = {
  ciphertext: string;     // base64
  iv: string;             // base64
  authTag: string;        // base64
  encryptedDataKey: string; // base64 (KMS-encrypted)
  aad?: string;           // optional AAD if used
};

export const createKmsClient = (
  KeyId: string,
  kms: AwsKmsClient,
) => ({
  encrypt: async (plaintext: string, aad?: string) => {
    // 1) Generate a 256-bit data key from KMS
    const { CiphertextBlob, Plaintext } = await kms.send(
      new GenerateDataKeyCommand({
        KeyId,
        KeySpec: "AES_256",
      })
    );
    if (!CiphertextBlob || !Plaintext) throw new Error("Failed to generate data key");

    const dataKey = Buffer.from(Plaintext as Uint8Array);
    const encDataKey = Buffer.from(CiphertextBlob as Uint8Array).toString("base64");

    // 2) Encrypt with AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", dataKey, iv);

    if (aad) cipher.setAAD(Buffer.from(aad));

    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // 3) Zeroize plaintext key
    dataKey.fill(0);

    return {
      ciphertext: ciphertext.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      encryptedDataKey: encDataKey,
      aad,
    };
  },

  decrypt: async (payload: EncryptedPayload) => {
    // 1) Ask KMS to decrypt the encrypted data key
    const { Plaintext } = await kms.send(
      new DecryptCommand({
        CiphertextBlob: Buffer.from(payload.encryptedDataKey, "base64"),
      })
    );
    if (!Plaintext) throw new Error("Failed to decrypt data key");

    const dataKey = Buffer.from(Plaintext as Uint8Array);

    // 2) Decrypt with AES-256-GCM
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      dataKey,
      Buffer.from(payload.iv, "base64")
    );
    if (payload.aad) decipher.setAAD(Buffer.from(payload.aad));
    decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");

    // 3) Zeroize key
    dataKey.fill(0);

    return plaintext;
  },
});