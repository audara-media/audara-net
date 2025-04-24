// src/routes/_authed/auth.callback.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authed/auth/callback")({
  component: AuthCallback,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      defcode: search.defcode as string | undefined,
    }
  },
});

function AuthCallback() {
  const { getToken } = useAuth();
  const search = Route.useSearch();
  const defcode = search.defcode;
  if(!defcode) {
    console.log("No defcode found");
  }

  useEffect(() => {
    console.log("useEffect starting. defining handleCallback");
    const handleCallback = async () => {
      const token = await getToken();
      if (token) {
        try {
          const response = await fetch('/api/createsession', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ defcode })
          });
          if (!response.ok) {
            throw new Error('Failed to create session');
          }
          console.log("Session created");
        } catch (error) {
          console.error('Error creating session:', error);
        }
      }
    };

    handleCallback();
  }, [getToken, defcode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Successful!</h1>
      <p>You can now return to the Audara app.</p>
    </div>
  );
}
