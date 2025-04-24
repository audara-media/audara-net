import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    const [redirectUrl, setRedirectUrl] = useState('')
    
    useEffect(() => {
      setRedirectUrl(window.location.href)
    }, [])

    if (error.message === 'Not authenticated') {
      return (
        <div className="flex items-center justify-center p-12">
          <SignIn routing="hash" forceRedirectUrl={redirectUrl} />
        </div>
      )
    }

    throw error
  },
})
