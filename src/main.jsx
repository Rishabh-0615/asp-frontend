import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { StudentAuthProvider } from './context/StudentAuthContext.jsx'
import { BatchProvider } from './context/BatchContext.jsx'
import { AssignmentProvider } from './context/AssignmentContext.jsx'
import { PasswordRecoveryProvider } from './context/PasswordRecoveryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <BatchProvider>
              <AssignmentProvider>
                <StudentAuthProvider>
                  <PasswordRecoveryProvider>
                    <App />
                  </PasswordRecoveryProvider>
                </StudentAuthProvider>
              </AssignmentProvider>
            </BatchProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
