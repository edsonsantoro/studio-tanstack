import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ShieldAlert, LineChart, BookOpen, GraduationCap, Languages, MessageSquare } from "lucide-react"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/')({
  loader: async () => {
    const approvedCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isApproved, true))

    const pendingCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, 'pending'))

    const totalUsers = Number(approvedCountResult[0]?.count || 0)
    const pendingUsersCount = Number(pendingCountResult[0]?.count || 0)

    return {
      totalUsers,
      pendingUsersCount,
    }
  },
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { totalUsers, pendingUsersCount } = Route.useLoaderData()
  const { locale } = Route.useParams()

  return (
    <div className="p-4 md:p-8 space-y-8">
      <p className="text-muted-foreground">
        Bem-vindo ao seu painel. Gerencie a comunidade e monitore as atividades.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Membros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Membros ativos na plataforma.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cadastros Pendentes
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsersCount}</div>
            <Button asChild variant="link" className="px-0">
              <Link to="/$locale/admin/moderation" params={{ locale }}>
                Ver perfis para moderação
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crescimento
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0%</div>
            <p className="text-xs text-muted-foreground">
              (Dados simulados por enquanto)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as áreas de gerenciamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/$locale/admin/moderation" params={{ locale }}>
                  Ir para a moderação de perfis
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/$locale/admin/recommendations" params={{ locale }}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Revisar Indicações de Cursos
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/$locale/admin/courses" params={{ locale }}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Gerenciar Links de Cursos Hotmart
                </Link>
              </Button>

              <Button asChild variant="secondary">
                <Link to="/$locale/admin/translations" params={{ locale }}>
                  <Languages className="mr-2 h-4 w-4" />
                  Gerenciar Traduções
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/$locale/admin/feedback" params={{ locale }}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Gerenciar Feedback
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link to="/$locale/admin/add-member" params={{ locale }}>
                  Adicionar Membro Manualmente
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
