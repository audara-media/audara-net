import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import jwt from 'jsonwebtoken'
import { verifyClerkJWT, extractTokenFromHeader } from '~/lib/verifyJWT'
import { resolveDefer } from 'deferrals'

const sessionSecret = process.env.SESSION_SECRET || 'your-session-secret-key'

export const APIRoute = createAPIFileRoute('/api/createsession')({
  POST: async ({ request }) => {
    try {
      const { defcode } = await request.json()
      const token = extractTokenFromHeader(request.headers.get('Authorization'))

      const decoded = verifyClerkJWT(token)

      // Create a new session token that lasts for 24 hours
      const sessionToken = jwt.sign(
        {
          userId: decoded.sub,
          sessionId: decoded.sid,
          type: 'session'
        },
        sessionSecret,
        { expiresIn: '24h' }
      )

      resolveDefer(defcode, {
        sessionToken,
        userId: decoded.sub,
        sessionId: decoded.sid,
      });

      const response = { 
        sessionToken,
        userId: decoded.sub,
        sessionId: decoded.sid,
      };
      return json(response);
    } catch (error) {
      console.error('Error in createsession:', error);
      return new Response('Unauthorized', { status: 403 })
    }
  },
}) 
