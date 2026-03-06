import { createFileRoute } from '@tanstack/react-router'
import { getRoadmapItems } from '@/actions/roadmap'
import { RoadmapStatusSelect } from '@/components/roadmap/RoadmapStatusSelect'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/roadmap')({
  loader: async () => {
    const items = await getRoadmapItems()
    return { items }
  },
  component: AdminRoadmapPage,
})

function AdminRoadmapPage() {
  const { items } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Gerenciar Roadmap</h1>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Votos</TableHead>
              <TableHead>Comentários</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead className="text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Nenhum item no roadmap.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoadmapStatusSelect itemId={item.id} currentStatus={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      {item.voteCount > 0 ? '+' : ''}{item.voteCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.commentCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.authorName || 'Anônimo'}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(item.createdAt || '').toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
