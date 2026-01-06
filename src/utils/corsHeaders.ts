/**
 * CORS utility for API routes
 * Required for mobile app (Capacitor) to make cross-origin requests to the API
 */

import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Set CORS headers on a response
 */
export function setCorsHeaders(res: NextApiResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

/**
 * Handle CORS preflight request
 * @returns true if this was an OPTIONS request (preflight), false otherwise
 */
export function handleCors(req: NextApiRequest, res: NextApiResponse): boolean {
  setCorsHeaders(res);
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * Wrapper to add CORS support to an API handler
 */
export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (handleCors(req, res)) return;
    return handler(req, res);
  };
}
