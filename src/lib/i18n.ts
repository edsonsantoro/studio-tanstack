import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Importando diretamente os JSONs para garantir que estejam disponíveis no bundle SSR/Client
import pt from '../messages/pt.json'
import en from '../messages/en.json'
import es from '../messages/es.json'
import de from '../messages/de.json'

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // idioma padrão
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Desativar suspense para evitar problemas iniciais no SSR
    },
  })

export default i18n
