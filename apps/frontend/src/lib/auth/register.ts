import { BASE_API_URL } from "@/constants";
import { generateEncryptionKeyPair } from "@/lib/crypto/encrypt";
import { generateSignatureKeyPair } from "@/lib/crypto/sign";
import { generateSalt, hashPassword } from "@/lib/crypto/backup";
import {
  ErrorResponse,
  UserRegisterResponse,
  UserRegisterResponseSchema,
  errorToString,
} from "@types";

export async function registerUser(
  email: string,
  password: string
): Promise<UserRegisterResponse> {
  const { publicKey: encryptionPublicKey } = await generateEncryptionKeyPair();
  const { verifyingKey: signaturePublicKey } = generateSignatureKeyPair();

  const passwordSalt = generateSalt();
  const passwordHash = await hashPassword(password, passwordSalt);

  const response = await fetch(`${BASE_API_URL}/api/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      signaturePublicKey,
      encryptionPublicKey,
      passwordSalt,
      passwordHash,
    }),
  });

  if (!response.ok) {
    const { error }: ErrorResponse = await response.json();
    throw new Error(error);
  }

  const rawData = await response.json();
  try {
    const validatedData = UserRegisterResponseSchema.parse(rawData);
    return validatedData;
  } catch (error) {
    throw new Error(errorToString(error));
  }
}