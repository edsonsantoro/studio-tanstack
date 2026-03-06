import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAllUsers } from '@/actions/users'
import { UserSearch, UsersTable } from '@/components/admin/user-client'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/users')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || undefined,
    }
  },
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps: { q } }) => {
    const users = await getAllUsers({ data: q || '' })
    return { users }
  },
  component: ManageUsersPage,
})

function ManageUsersPage() {
  const { users } = Route.useLoaderData()

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Gerenciar Usuários</CardTitle>
          <CardDescription>
            Visualize, edite ou remova membros da comunidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSearch />
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
