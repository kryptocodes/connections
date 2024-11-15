import { z } from "zod";
import { nullToUndefined } from "@types";
import { TwitterDataSchema } from "./twitterData";
import { TelegramDataSchema } from "./telegramData";
import { SignalDataSchema } from "./signalData";
import { InstagramDataSchema } from "./instagramData";
import { FarcasterDataSchema } from "./farcasterData";
import { LannaDataSchema, TensionsRatingSchema } from "./lannaData";
import { StravaDataSchema } from "./stravaData";
import { GithubDataSchema } from "./githubData";
import { LannaHalloweenDataSchema } from "./lannaHalloweenData";
import { DevconSchema } from "./devconData";

export const UserDataSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  bio: z.string(),
  signaturePublicKey: z.string(),
  encryptionPublicKey: z.string(),
  psiPublicKeyLink: nullToUndefined(z.string()),
  twitter: nullToUndefined(TwitterDataSchema),
  telegram: nullToUndefined(TelegramDataSchema),
  signal: nullToUndefined(SignalDataSchema),
  instagram: nullToUndefined(InstagramDataSchema),
  farcaster: nullToUndefined(FarcasterDataSchema),
  pronouns: nullToUndefined(z.string()),
  lanna: nullToUndefined(LannaDataSchema),
  tensionsRating: nullToUndefined(TensionsRatingSchema),
  strava: nullToUndefined(StravaDataSchema),
  github: nullToUndefined(GithubDataSchema),
  lannaHalloween: nullToUndefined(LannaHalloweenDataSchema),
  devcon: nullToUndefined(DevconSchema),
});

export type UserData = z.infer<typeof UserDataSchema>;

export const UnregisteredUserDataSchema = z.object({
  signaturePublicKey: z.string(),
  encryptionPublicKey: z.string(),
});

export type UnregisteredUserData = z.infer<typeof UnregisteredUserDataSchema>;

export { type TwitterData, TwitterDataSchema } from "./twitterData";
export { type TelegramData, TelegramDataSchema } from "./telegramData";
export { type SignalData, SignalDataSchema } from "./signalData";
export { type InstagramData, InstagramDataSchema } from "./instagramData";
export { type FarcasterData, FarcasterDataSchema } from "./farcasterData";

export {
  type LannaDesiredConnections,
  LannaDesiredConnectionsSchema,
  type LannaData,
  LannaDataSchema,
} from "./lannaData";
export { type GithubData, GithubDataSchema } from "./githubData";
export { type StravaData, StravaDataSchema } from "./stravaData";