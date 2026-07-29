import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PlayerProfileProvider } from './player-profile/PlayerProfileContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlayerProfileProvider>
      <App />
    </PlayerProfileProvider>
  </StrictMode>,
)
