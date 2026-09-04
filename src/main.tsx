import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import './index.css'
import App from './App.tsx'

// Robotoフォントのインポート
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import RootContext from './contexts/RootContext.ts'

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ""

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootContext.Provider value={{
      GOOGLE_API_KEY
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </RootContext.Provider>
  </StrictMode>,
)
