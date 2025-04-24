import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { join } from 'path'

interface ClerkJwtPayload extends jwt.JwtPayload {
  sub: string;
  sid: string;
  azp?: string;
}

interface SessionPayload extends jwt.JwtPayload {
  userId: string;
  sessionId: string;
  type: 'session';
}

const publicKey = readFileSync(join(process.cwd(), 'src/keys/clerk.pem'), 'utf-8')
const sessionSecret = process.env.SESSION_SECRET || 'your-session-secret-key'

export const APIRoute = createAPIFileRoute('/api/checktoken')({
  GET: async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 403 })
    }

    const token = authHeader.replace('Bearer ', '')

    try {
      // First try to verify as a session token
      try {
        const decoded = jwt.verify(token, sessionSecret) as SessionPayload
        if (decoded.type === 'session') {
          return json({ 
            userId: decoded.userId,
            sessionId: decoded.sessionId,
          })
        }
      } catch (sessionError) {
        // If session verification fails, try Clerk JWT
      }

      // Try Clerk JWT verification
      const options: jwt.VerifyOptions = { algorithms: ['RS256'] }
      const permittedOrigins = ['http://localhost:3000']

      const decoded = jwt.verify(token, publicKey, options) as unknown as ClerkJwtPayload

      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < currentTime || decoded.nbf && decoded.nbf > currentTime) {
        throw new Error('Token is expired or not yet valid')
      }

      if (decoded.azp && !permittedOrigins.includes(decoded.azp)) {
        throw new Error("Invalid 'azp' claim")
      }

      return json({ 
        userId: decoded.sub,
        sessionId: decoded.sid,
      })
    } catch (error) {
      return new Response('Unauthorized', { status: 403 })
    }
  },
})
