import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { waitForDefer, setConfig } from 'deferrals'

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is not set')
}

console.log("Setting config to waitForUndefined: true");
setConfig({
  waitForUndefined: true,
  recreateOnMake: false,
})

interface SessionData {
  sessionToken: string;
  userId: string;
  sessionId: string;
}

export const APIRoute = createAPIFileRoute('/api/gettoken')({
  GET: async ({ request, params }) => {
    const url = new URL(request.url)
    const defcode = url.searchParams.get('defcode')

    if (!defcode) {
      console.log("No defcode found");
      return json({ error: 'Missing defcode parameter' }, { status: 400 })
    }

    try {
      const sessionData = await waitForDefer(defcode) as SessionData
      
      // Get user profile data from Clerk API
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${sessionData.userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!clerkResponse.ok) {
        console.error('Failed to fetch user profile from Clerk', clerkResponse)
        throw new Error('Failed to fetch user profile from Clerk')
      }
      
      const userData = await clerkResponse.json()
      // console.log('User data:', userData)
      // Combine session data with user profile
      const finalResponse = {
        ...sessionData,
        profile: {
          firstName: userData.first_name,
          lastName: userData.last_name,
          imageUrl: userData.image_url,
          emailAddresses: userData.email_addresses.map((email: any) => email.email_address),
          username: userData.username,
        }
      }
      console.log('Final response:', finalResponse)
      
      return json(finalResponse)
    } catch (error) {
      console.error('Error getting token or user profile:', error)
      return json({ error: 'Failed to get token' }, { status: 500 })
    }
  },
})
