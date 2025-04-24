import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/user"!</div>
}
