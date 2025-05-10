import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { getAuth } from '@clerk/tanstack-react-start/server'

export const sendWebSocketCommand = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  const { queue, ch2 } = await import('./queueManager');
  console.log('Received context:', ctx);
  
  
  if (!ctx.data) {
    throw new Error('No data received in request');
  }

  const formData = ctx.data as FormData;
  const command = formData.get('command') as string;
  const keyCode = formData.get('keyCode') as string | null;

  if (!command && !keyCode) {
    throw new Error('No command or keyCode specified in request');
  }

  const { userId } = await getAuth(getWebRequest()!)
  console.log("User ID:", userId);
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const message = keyCode 
    ? { type: 'keyCode', keyCode, userId }
    : { type: 'command', command };

  ch2.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  
  return { 
    success: true, 
    command: command || 'keyCode',
    keyCode: keyCode || undefined
  }
}) 
