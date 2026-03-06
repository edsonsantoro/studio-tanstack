import { createFileRoute, redirect } from '@tanstack/react-router'
import { getRoadmapItemsFn as getRoadmapItems } from '@/actions/roadmap'
import { CreateRoadmapItem } from '@/components/roadmap/CreateRoadmapItem'
import { RoadmapItem } from '@/components/roadmap/RoadmapItem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import * as React from 'react'

export const Route = createFileRoute('/$locale/roadmap')({
  loader: async ({ params, context }) => {
    const { user: session } = context
    const { locale } = params

    if (!session) {
      throw redirect({
        to: '/$locale/login',
        params: { locale },
      })
    }

    const items = await getRoadmapItems()
    return { items, session }
  },
  component: RoadmapPage,
})

function RoadmapPage() {
    const { items, session } = Route.useLoaderData()

    const suggestions = items.filter(i => i.status === 'suggestion')
    const planned = items.filter(i => i.status === 'planned')
    const inProgress = items.filter(i => i.status === 'in_progress')
    const completed = items.filter(i => i.status === 'completed')
    const declined = items.filter(i => i.status === 'declined')

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Roadmap do Produto</h1>
                    <p className="text-muted-foreground mt-2">
                        Ajude-nos a decidir o futuro da plataforma. Vote nas features que você mais quer!
                    </p>
                </div>
                <CreateRoadmapItem />
            </div>

            <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0 mb-6">
                    <TabsTrigger value="suggestions" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground border border-transparent data-[state=active]:border-border rounded-full px-4 py-2">
                        Sugestões <span className="ml-2 text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">{suggestions.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="planned" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 border border-transparent rounded-full px-4 py-2">
                        Planejado <span className="ml-2 text-xs bg-blue-200/50 px-2 py-0.5 rounded-full">{planned.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="in_progress" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700 border border-transparent rounded-full px-4 py-2">
                        Em Progresso <span className="ml-2 text-xs bg-yellow-200/50 px-2 py-0.5 rounded-full">{inProgress.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 border border-transparent rounded-full px-4 py-2">
                        Concluído <span className="ml-2 text-xs bg-green-200/50 px-2 py-0.5 rounded-full">{completed.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="declined" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 border border-transparent rounded-full px-4 py-2">
                        Recusado <span className="ml-2 text-xs bg-red-200/50 px-2 py-0.5 rounded-full">{declined.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="suggestions" className="space-y-4">
                    <RoadmapGrid items={suggestions} userId={session?.id} emptyMessage="Nenhuma sugestão enviada ainda. Seja o primeiro!" />
                </TabsContent>
                <TabsContent value="planned" className="space-y-4">
                    <RoadmapGrid items={planned} userId={session?.id} emptyMessage="Nada planejado no momento." />
                </TabsContent>
                <TabsContent value="in_progress" className="space-y-4">
                    <RoadmapGrid items={inProgress} userId={session?.id} emptyMessage="Nada sendo desenvolvido agora." />
                </TabsContent>
                <TabsContent value="completed" className="space-y-4">
                    <RoadmapGrid items={completed} userId={session?.id} emptyMessage="Nenhuma feature concluída recentemente." />
                </TabsContent>
                <TabsContent value="declined" className="space-y-4">
                    <RoadmapGrid items={declined} userId={session?.id} emptyMessage="Nenhuma sugestão recusada." />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function RoadmapGrid({ items, userId, emptyMessage }: { items: any[], userId?: string, emptyMessage: string }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <RoadmapItem key={item.id} item={item} userId={userId} />
            ))}
        </div>
    )
}
