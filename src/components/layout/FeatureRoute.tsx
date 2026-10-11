import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useFeatures } from '@/features/access-management/hooks/useFeatures'

interface FeatureRouteProps {
  children: ReactNode
  isAdmin: boolean
  path: string
}

export function FeatureRoute({ children, isAdmin, path }: FeatureRouteProps) {
  const { isRouteAllowed, isLoading } = useFeatures()

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const allowed = isRouteAllowed(path, isAdmin)

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
