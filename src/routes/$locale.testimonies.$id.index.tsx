import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTestimony } from '@/actions/testimonies'
import { TestimonyActions } from '@/components/testimonies/testimony-actions'
import { getVideoEmbedUrl } from '@/lib/video-utils'
import { getApprovedRecommendations } from '@/actions/recommendations'
import { RecommendationCard } from '@/components/testimonies/recommendation-card'
import * as React from 'react'

export const Route = createFileRoute('/$locale/testimonies/$id/')({
  loader: async ({ params, context }) => {
    const { id } = params
    const { user: session } = context
    const testimony = await getTestimony({ data: id })

    if (!testimony) {
      return { testimony: null, session, recommendations: [] }
    }

    // Check visibility
    if (!testimony.isPublic && !session) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      })
    }

    const recommendations = await getApprovedRecommendations({ data: id })
    return { testimony, session, recommendations }
  },
  component: TestimonyDetailPage,
})

function TestimonyDetailPage() {
  const { testimony, session, recommendations } = Route.useLoaderData()
  const { locale } = Route.useParams()

  if (!testimony) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold">Testemunho não encontrado</h2>
        <p className="text-muted-foreground">Este testemunho pode ter sido removido ou o link está incorreto.</p>
        <Button asChild className="mt-4">
          <Link to="/$locale/testimonies" params={{ locale }}>Voltar ao Mural</Link>
        </Button>
      </div>
    )
  }

  const isAuthor = session?.id === testimony.authorId || session?.role === 'admin'
  const formattedDate = testimony.createdAt ? format(new Date(testimony.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''
  const embedUrl = getVideoEmbedUrl((testimony as any).videoUrl)

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="space-y-6">
        <div className='border-b pb-6'>
          <h1 className="text-4xl font-bold font-headline">{testimony.title}</h1>
          <div className="flex items-center justify-between mt-4 text-muted-foreground">
            <div className='flex items-center gap-4'>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={testimony.authorAvatarUrl || ''} alt={testimony.authorName || ''} />
                  <AvatarFallback>{testimony.authorName?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{testimony.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
            {isAuthor && (
              <TestimonyActions testimonyId={testimony.id} />
            )}
          </div>
        </div>

        {embedUrl && (
          <div className="aspect-video w-full mb-8">
            <iframe
              src={embedUrl}
              title={testimony.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg shadow-lg"
            ></iframe>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed whitespace-pre-wrap">
          <p>{testimony.content}</p>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-xl font-bold font-headline mb-4">Materiais Citados e Recomendados</h3>
            <div className="grid gap-4">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
