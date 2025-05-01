import axios from 'axios';

// Cache for storing the access token and its expiration time
let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Gets a valid access token for GoFormz API
 * Caches the token and reuses it until it expires
 */
export async function getAccessToken(): Promise<string> {
  // If we have a cached token that hasn't expired, return it
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  // Create basic auth token
  const basicAuth = Buffer.from(
    `${process.env.GOFORMZ_USERNAME}:${process.env.GOFORMZ_PW}`
  ).toString('base64');

  // Get new token from GoFormz using basic auth
  const response = await axios.post(
    'https://api.goformz.com/oauth/token',
    {
      grant_type: 'password',
      username: process.env.GOFORMZ_USERNAME,
      password: process.env.GOFORMZ_PW
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Cache the new token
  tokenCache = {
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in * 1000) // Convert seconds to milliseconds
  };

  return tokenCache.token;
} 