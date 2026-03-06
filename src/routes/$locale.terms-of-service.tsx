import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import pt from '../messages/pt.json'

export const Route = createFileRoute('/$locale/terms-of-service')({
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  const { t } = useTranslation()
  
  const termsMessages = pt.terms_of_service || {}
  
  const sectionKeys = Object.keys(termsMessages)
    .filter(key => key.startsWith('section') && key.endsWith('_title'))
    .map(key => parseInt(key.replace('section', '').replace('_title', ''), 10))
    .sort((a, b) => a - b)

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('terms_of_service.title')}</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
          {t('terms_of_service.intro')}
        </p>

        {sectionKeys.map((num) => (
          <section key={num} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              {t(`terms_of_service.section${num}_title`)}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
              {t(`terms_of_service.section${num}_content`)}
            </p>
          </section>
        ))}

        <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
          {t('terms_of_service.last_updated')}
        </p>
      </div>
    </div>
  )
}
