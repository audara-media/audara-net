import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { join } from 'path'

interface ClerkJwtPayload extends jwt.JwtPayload {
  sub: string;
  sid: string;
  azp?: string;
}

interface SessionTokenPayload extends jwt.JwtPayload {
  userId: string;
  sessionId: string;
  type: 'session';
}

const publicKey = readFileSync(join(process.cwd(), 'src/keys/clerk.pem'), 'utf-8')
const permittedOrigins = ['http://localhost:3000']

export function verifyClerkJWT(token: string): ClerkJwtPayload {
  const options: jwt.VerifyOptions = { algorithms: ['RS256'] }
  const decoded = jwt.verify(token, publicKey, options) as unknown as ClerkJwtPayload

  const currentTime = Math.floor(Date.now() / 1000)
  if (decoded.exp && decoded.exp < currentTime || decoded.nbf && decoded.nbf > currentTime) {
    throw new Error('Token is expired or not yet valid')
  }

  if (decoded.azp && !permittedOrigins.includes(decoded.azp)) {
    throw new Error("Invalid 'azp' claim")
  }

  return decoded
}

export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid auth header format')
  }
  return authHeader.replace('Bearer ', '')
}

export function verifySessionToken(token: string): SessionTokenPayload | false {
  try {
    const sessionSecret = process.env.SESSION_SECRET || 'your-session-secret-key'
    const options: jwt.VerifyOptions = { algorithms: ['HS256'] }
    const decoded = jwt.verify(token, sessionSecret, options) as SessionTokenPayload
    return decoded
  } catch (error) {
    return false
  }
} 
