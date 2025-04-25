import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import jwt from 'jsonwebtoken'
import { verifyClerkJWT, extractTokenFromHeader } from '~/lib/verifyJWT'

interface SessionPayload extends jwt.JwtPayload {
  userId: string;
  sessionId: string;
  type: 'session';
}

const sessionSecret = process.env.SESSION_SECRET || 'your-session-secret-key'

export const APIRoute = createAPIFileRoute('/api/checktoken')({
  GET: async ({ request }) => {
    try {
      const token = extractTokenFromHeader(request.headers.get('Authorization'))

      try {
        const decoded = jwt.verify(token, sessionSecret) as SessionPayload
        if (decoded.type === 'session') {
          return json({ 
            userId: decoded.userId,
            sessionId: decoded.sessionId,
          })
        }
      } catch (sessionError) {
        // Not doing anything - we'll try Clerk JWT verification below
      }

      const decoded = verifyClerkJWT(token)
      return json({ 
        userId: decoded.sub,
        sessionId: decoded.sid,
      })
    } catch (error) {
      return new Response('Unauthorized', { status: 403 })
    }
  },
})
