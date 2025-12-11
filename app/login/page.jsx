"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/profile");
    }
  }, [session, router]);

  const handleGoogleLogin = () => {
    // This triggers the NextAuth flow
    signIn("google", { callbackUrl: "/profile" });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl dark:bg-slate-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {/* Google Icon SVG */}
              <svg
                className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M21.35 11.1H12v2.8h5.305c-.225 1.1-.88 2.025-1.875 2.685v2.235h3.03c1.77-1.635 2.79-4.035 2.79-6.93 0-.675-.06-1.335-.15-1.99z"
                  fill="#fff"
                />
                <path
                  d="M12 21c2.43 0 4.47-.81 5.955-2.19l-3.03-2.235c-.81.54-1.845.855-2.925.855-2.25 0-4.155-1.515-4.845-3.57H4.035v2.265C5.52 19.08 9.555 21 12 21z"
                  fill="#fff"
                />
                <path
                  d="M7.155 13.845c-.18-.54-.285-1.11-.285-1.71 0-.6.105-1.17.285-1.71V8.16H4.035C3.39 9.435 3 10.92 3 12.48c0 1.56.39 3.045 1.035 4.32l3.12-2.955z"
                  fill="#fff"
                />
                <path
                  d="M12 6.6c1.32 0 2.505.45 3.435 1.35l2.58-2.58C16.47 3.9 14.43 3 12 3 9.555 3 5.52 4.92 4.035 7.89l3.12 2.955c.69-2.055 2.595-3.57 4.845-3.57z"
                  fill="#fff"
                />
              </svg>
            </span>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}