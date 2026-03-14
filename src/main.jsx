import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { StudentAuthProvider } from './context/StudentAuthContext.jsx'
import { BatchProvider } from './context/BatchContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <BatchProvider>
            <StudentAuthProvider>
              <App />
            </StudentAuthProvider>
          </BatchProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
