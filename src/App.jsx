import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import FounderPage from './pages/FounderPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import JobApplicationPage from './pages/JobApplicationPage'
import LoginPage from './pages/LoginPage'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ScrollToTop from './components/ScrollToTop'
import ThemeToggle from './components/ThemeToggle'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ShiftProvider } from './context/ShiftContext'

// ...existing code...

// Protected Route component
function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRole && user?.role !== allowedRole) return <Navigate to={`/dashboard/${user.role}`} replace />
  return children
}

function AppRoutes() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <>
      <ScrollToTop />
      <div className="relative min-h-screen z-10">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/founder" element={<FounderPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/apply-job" element={<JobApplicationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/employee" element={<ProtectedRoute allowedRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/client" element={<ProtectedRoute allowedRole="client"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
        {/* ...existing code... */}
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ShiftProvider>
            <AppRoutes />
          </ShiftProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
