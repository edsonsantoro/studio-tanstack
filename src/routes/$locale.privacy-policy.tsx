import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import pt from '../messages/pt.json'

export const Route = createFileRoute('/$locale/privacy-policy')({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  const { t } = useTranslation()
  
  // Usamos as chaves do pt.json como referência para as seções dinâmicas
  const privacyMessages = pt.privacy_policy || {}
  
  const sectionKeys = Object.keys(privacyMessages)
    .filter(key => key.startsWith('section') && key.endsWith('_title'))
    .map(key => parseInt(key.replace('section', '').replace('_title', ''), 10))
    .sort((a, b) => a - b)

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('privacy_policy.title')}</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
          {t('privacy_policy.intro')}
        </p>

        {sectionKeys.map((num) => (
          <section key={num} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              {t(`privacy_policy.section${num}_title`)}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
              {t(`privacy_policy.section${num}_content`)}
            </p>
          </section>
        ))}

        <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
          {t('privacy_policy.last_updated')}
        </p>
      </div>
    </div>
  )
}
