import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const navigate = useNavigate()
  React.useEffect(() => {
    navigate({ to: '/$locale', params: { locale: 'pt' }, replace: true })
  }, [navigate])
  return <div>Redirecting...</div>
}
