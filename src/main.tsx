import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="299352643706-dfdb3ocngstgcaljg13pf05siun873mg.apps.googleusercontent.com" >
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>,
)
