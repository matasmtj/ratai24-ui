import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { resolveApiBaseUrl } from './lib/resolveApiBaseUrl'
import { configureApiBaseUrl } from './lib/api'
import { getCachedHeroImageUrl, preloadImage } from './lib/heroImageCache'

async function bootstrap() {
  const baseUrl = await resolveApiBaseUrl()
  configureApiBaseUrl(baseUrl)

  const cachedHero = getCachedHeroImageUrl()
  if (cachedHero) {
    void preloadImage(cachedHero)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StrictMode>,
  )
}

bootstrap()
