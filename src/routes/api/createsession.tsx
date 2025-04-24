import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { join } from 'path'
import { resolveDefer } from 'deferrals'

interface ClerkJwtPayload extends jwt.JwtPayload {
  sub: string;
  sid: string;
  azp?: string;
}

const publicKey = readFileSync(join(process.cwd(), 'src/keys/clerk.pem'), 'utf-8')
const sessionSecret = process.env.SESSION_SECRET || 'your-session-secret-key' // Should be set in env

export const APIRoute = createAPIFileRoute('/api/createsession')({
  POST: async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    const { defcode } = await request.json()
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Invalid auth header format');
      return new Response('Unauthorized', { status: 403 })
    }

    const token = authHeader.replace('Bearer ', '')

    try {
      const options: jwt.VerifyOptions = { algorithms: ['RS256'] }
      const permittedOrigins = ['http://localhost:3000']

      const decoded = jwt.verify(token, publicKey, options) as unknown as ClerkJwtPayload

      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < currentTime || decoded.nbf && decoded.nbf > currentTime) {
        console.error('Token validation failed:', { 
          exp: decoded.exp,
          nbf: decoded.nbf,
          currentTime
        });
        throw new Error('Token is expired or not yet valid')
      }

      if (decoded.azp && !permittedOrigins.includes(decoded.azp)) {
        console.error('Invalid azp claim:', decoded.azp);
        throw new Error("Invalid 'azp' claim")
      }

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
