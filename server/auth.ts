import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../src/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'mess-finding-system-college-project-secret-2026';

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  name: string;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(keyHex, 'hex');
  if (derivedBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  let padded = input.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4 !== 0) {
    padded += '=';
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signAuthToken(payload: Omit<TokenPayload, 'exp'>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const body = base64UrlEncode(JSON.stringify({ ...payload, exp }));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${body}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(body)) as TokenPayload;
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (decoded.role !== 'admin' && decoded.role !== 'owner') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  authUser?: TokenPayload;
}

export function extractOptionalUser(req: AuthenticatedRequest): TokenPayload | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  return verifyAuthToken(token);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractOptionalUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in to continue.' });
    return;
  }
  req.authUser = user;
  next();
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractOptionalUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in as a Mess Owner.' });
    return;
  }
  if (user.role !== 'owner' && user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Mess Owner or Admin privileges required.' });
    return;
  }
  req.authUser = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractOptionalUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in as Administrator.' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  req.authUser = user;
  next();
}
