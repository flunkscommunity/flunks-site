import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Image proxy to avoid CORS issues with Google Cloud Storage images
 * Usage: /api/image-proxy?url=https://storage.googleapis.com/...
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Only allow proxying from trusted domains
  const allowedDomains = [
    'storage.googleapis.com',
    'flunks_public',
  ];

  try {
    const parsedUrl = new URL(url);
    
    if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain) || url.includes(domain))) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();

    // Set caching headers (cache for 1 day)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image proxy error:', error);
    return res.status(500).json({ error: 'Failed to proxy image' });
  }
}
