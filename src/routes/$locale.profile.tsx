import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/$locale/profile')({
  component: () => <div className='p-8'><h1>Página de Perfil (Simplificada)</h1></div>,
})
