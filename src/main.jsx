import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { StudentAuthProvider } from './context/StudentAuthContext.jsx'
import { BatchProvider } from './context/BatchContext.jsx'
import { AssignmentProvider } from './context/AssignmentContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <BatchProvider>
            <AssignmentProvider>
              <StudentAuthProvider>
                <App />
              </StudentAuthProvider>
            </AssignmentProvider>
          </BatchProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
