// src/routes/_authed/api/media/events.ts
import { createFileRoute } from '@tanstack/react-router'
// import { getAuth } from '@clerk/tanstack-react-start/server'
// import { getWebRequest } from '@tanstack/react-start/server'

export const Route = createFileRoute('/_authed/api/media/events')({
  async loader() {
  //   const request = getWebRequest()
  //   if (!request) {
  //     throw new Error('No request found')
  //   }

  //   // Get the token from the Authorization header
  //   const authHeader = request.headers.get('Authorization')
  //   if (!authHeader?.startsWith('Bearer ')) {
  //     throw new Error('No valid token provided')
  //   }

  //   // Verify the token with Clerk
  //   const { userId } = await getAuth(request)
  //   if (!userId) {
  //     throw new Error('Unauthorized')
  //   }

  //   const stream = new ReadableStream({
  //     start(controller) {
  //       // Send initial connection message
  //       controller.enqueue('data: {"type":"connected"}\n\n')

  //       // Keep connection alive
  //       const interval = setInterval(() => {
  //         controller.enqueue('data: {"type":"ping"}\n\n')
  //       }, 30000)

  //       // Cleanup on close
  //       request.signal.addEventListener('abort', () => {
  //         clearInterval(interval)
  //       })
  //     }
  //   })

  //   return new Response(stream, {
  //     headers: {
  //       'Content-Type': 'text/event-stream',
  //       'Cache-Control': 'no-cache',
  //       'Connection': 'keep-alive',
  //       'Access-Control-Allow-Origin': '*',
  //       'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  //     },
  //   })
    // return 404 for now
    return new Response('Not Found', { status: 404 })
  }
})
