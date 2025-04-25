import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { sendWebSocketCommand } from '~/lib/websocket'

export const Route = createFileRoute('/_authed/user')({
  component: RouteComponent,
})

function RouteComponent() {
  const sendCommand = useServerFn(sendWebSocketCommand)

  const handleSendCommand = async () => {
    const formData = new FormData()
    formData.append('command', 'VK_MEDIA_PLAY_PAUSE')
    formData.append('peerId', '93aeeb81-240a-47f2-88f6-b93b241acdb8')
    
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
      <div className="space-y-4">
        <button
          onClick={handleSendCommand}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Play/Pause Command
        </button>
      </div>
    </div>
  )
}
