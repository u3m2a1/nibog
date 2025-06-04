"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if superadmin data exists in localStorage
        const superadminData = localStorage.getItem('superadmin')
        if (!superadminData) {
          router.push('/superadmin/login')
          return
        }

        const user = JSON.parse(superadminData)
        if (!user.is_superadmin) {
          router.push('/superadmin/login')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/superadmin/login')
      }
    }

    checkAuth()
  }, [router])

  // Show nothing while checking authentication
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
