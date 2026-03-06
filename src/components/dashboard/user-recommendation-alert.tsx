import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { approveRecommendation, rejectRecommendation } from '@/actions/recommendations'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@tanstack/react-router'
import React from 'react'

export function UserRecommendationAlert() {
  const { t } = useTranslation('translation', { keyPrefix: 'dashboard' })
  const { toast } = useToast()
  const router = useRouter()
  const [pendingRecs, setPendingRecs] = React.useState<any[]>([])
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null)

  // This would ideally be in a loader, but for now we'll keep it here if it's dynamic
  // or pass it as props from DashboardClient

  const handleApprove = async (id: string) => {
    setIsProcessing(id)
    try {
      const result = await approveRecommendation({ data: id })
      if (result.success) {
        toast({ title: t('recommendation_approved') })
        router.invalidate()
      }
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setIsProcessing(id)
    try {
      const result = await rejectRecommendation({ data: id })
      if (result.success) {
        toast({ title: t('recommendation_rejected') })
        router.invalidate()
      }
    } finally {
      setIsProcessing(null)
    }
  }

  if (pendingRecs.length === 0) return null

  return (
    <div className="mb-6 space-y-4">
      {pendingRecs.map((rec) => (
        <div key={rec.id} className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-primary">Nova indicação de material!</p>
            <p className="text-sm text-muted-foreground">A AI identificou que você mencionou "{rec.materialName}" no seu testemunho. Deseja adicionar este link ao seu perfil?</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button size="sm" onClick={() => handleApprove(rec.id)} disabled={!!isProcessing}>
              {isProcessing === rec.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Aprovar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleReject(rec.id)} disabled={!!isProcessing}>
              <X className="h-4 w-4 mr-1" />
              Recusar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
