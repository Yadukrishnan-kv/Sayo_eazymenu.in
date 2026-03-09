import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { MenuProvider } from './contexts/MenuContext'
import App from './App'
import './styles/global.css'
import './styles/ios-theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LanguageProvider>
          <MenuProvider>
            <App />
          </MenuProvider>
        </LanguageProvider>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>,
)
