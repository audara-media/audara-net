import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { sendWebSocketCommand } from '~/lib/websocket'

export const Route = createFileRoute('/_authed/user')({
  component: RouteComponent,
})

function RouteComponent() {
  const sendCommand = useServerFn(sendWebSocketCommand)

  const handleSendCommand = async (command: string) => {
    const formData = new FormData()
    formData.append('command', 'keyCode')
    formData.append('keyCode', command)
    
    try {
      const response = await sendCommand({ data: formData } as any)
      console.log('Command sent successfully:', response)
    } catch (error) {
      console.error('Error sending command:', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Media Control</h1>
      <div className="flex flex-row space-x-4">
        <button
          onClick={() => handleSendCommand('VK_MEDIA_PREV_TRACK')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
        <button
          onClick={() => handleSendCommand('VK_MEDIA_PLAY_PAUSE')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Play/Pause
        </button>
        <button
          onClick={() => handleSendCommand('VK_MEDIA_NEXT_TRACK')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next
        </button>
        
      </div>
    </div>
  )
}
