import {
  AccessToken,
  AccessTokenSchema,
  OAuthAppDetails,
  mapResponseToAccessToken,
  errorToString,
  DataImportSource,
} from "@types";
import { BASE_API_URL, OAUTH_APP_DETAILS } from "@/config";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

async function stravaFetchToken(
  mapping: OAuthAppDetails,
  code: string
): Promise<Response> {
  const { id, secret, token_url } = mapping;

  return fetch(token_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: id,
      client_secret: secret,
      code: code,
      grant_type: "authorization_code",
    }),
  });
}

async function fetchToken(
  app: DataImportSource,
  mapping: OAuthAppDetails,
  code: string
): Promise<Response | null> {
  // Apps that use client-side fetching
  switch (app) {
    case DataImportSource.STRAVA:
      return await stravaFetchToken(mapping, code);
    default:
      return null;
  }
}

async function stravaRefreshToken(
  mapping: OAuthAppDetails,
  refreshToken: string
): Promise<Response> {
  const { id, secret, token_url } = mapping;

  return fetch(token_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: id,
      client_secret: secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
}

export async function refreshToken(
  app: DataImportSource,
  mapping: OAuthAppDetails,
  refreshToken: string
): Promise<Response | null> {
  switch (app) {
    case DataImportSource.STRAVA:
      return await stravaRefreshToken(mapping, refreshToken);
    default:
      return null;
  }
}

export async function refreshAndSaveToken(
  app: DataImportSource,
  details: OAuthAppDetails,
  currentAccessToken: AccessToken): Promise<AccessToken> {
  const response = await refreshToken(app, details, currentAccessToken.refresh_token);
  if (!response) {
    throw new Error(
      `HTTP error! empty response.`
    );
  }

  if (!response.ok || response.type == "error") {
    const errorResponse = await response.json();
    console.error(
      `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
    );
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
    );
  }

  const data = await response.json();
  if (data && data.error) {
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${data.error}, consider checking environment variables or redirect_uri`
    );
  }

  const token: AccessToken | null = await mapResponseToAccessToken(app, currentAccessToken, data);
  if (token) {
    // Successful refresh. Save token and continue with data import.
    await storage.saveOAuthAccessToken(app, token);
    return token;
  } else {
    throw new Error("Token refresh did not succeed, delete token.")
  }
}

export async function getOAuthTokenViaClient(
  app: DataImportSource,
  code: string
): Promise<AccessToken | null> {
  try {
    if (!OAUTH_APP_DETAILS[app]) {
      throw new Error("OAuth app integration details are not available");
    }

    const mapping: OAuthAppDetails = OAUTH_APP_DETAILS[app];

    const response = await fetchToken(app, mapping, code);
    if (!response) {
      throw new Error("OAuth access token response is null");
    }

    if (!response.ok || response.type == "error") {
      const errorResponse = await response.json();
      console.error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
    }

    const data = await response.json();
    if (data && data.error) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${data.error}, consider checking environment variables or redirect_uri`
      );
    }

    // Convert app-specific token format into generic AccessToken
    return await mapResponseToAccessToken(app, null, data);
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}

export async function getOAuthTokenViaServer(
  app: DataImportSource,
  code: string
): Promise<AccessToken> {
  try {
    const response = await fetch(
      `${BASE_API_URL}/oauth/access_token?state=${app}&code=${code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorResponse.error}`
      );
    }

    const data = await response.json();
    return AccessTokenSchema.parse(data);
  } catch (error) {
    console.error("Error getting oauth access:", error);
    throw error;
  }
}

export async function getOAuthAccessToken(
  app: DataImportSource,
  code: string,
  details: OAuthAppDetails
): Promise<AccessToken | null> {
  let token: AccessToken | undefined | null;

  // First check if access token already exists and is active in local storage
  token = await storage.getOAuthAccessToken(app);
  if (token) {
    // NOTE: when there are more scopes, check token scope, XOR save token by $app_$scope

    if (app === DataImportSource.GITHUB) {
      // Github OAuth tokens do not expire, unless they have not been used for a year
      return token;
    }

    if (token.expires_at && token.expires_at * 1000 > Date.now()) {
      // Strava expires_at is in seconds. Data.now() is in milliseconds.
      return token;
    }
    // NOTE: Add refresh_token support
  }

  // Client-side access token fetching is preferred -- it prevents server (which is run by Cursive) from seeing access token in plaintext.
  // Server-side fetching will only use public scope to s
  try {
    if (details.client_side_fetching) {
      token = await getOAuthTokenViaClient(app, code);
    } else {
      token = await getOAuthTokenViaServer(app, code);
    }
  } catch (error) {
    console.error(
      "Minting OAuth token failed, check if code has expired",
      errorToString(error)
    );
    return null;
  }

  if (!token) {
    toast.error("Unable to get OAuth access token");
    console.error("Minting OAuth token failed, check if code has expired");
    return null;
  }

  // Save access token and continue
  await storage.saveOAuthAccessToken(app, token);
  return token;
}
