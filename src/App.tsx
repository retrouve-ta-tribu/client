import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import GroupDetails from './pages/GroupDetails.jsx'
import Login from './pages/Login.tsx'
import { useAuth } from './hooks/useAuth'
import { useEffect } from 'react'

function App() {
  const { profile, isLoading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (profile) {
      console.log('User logged in:', profile.name)
    } else {
      console.log('User logged out')
    }
  }, [profile])

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/group/:id"
          element={
            isLoading ? <div>Loading...</div> :
            profile ? <GroupDetails /> : <Navigate to="/login" replace />
          }
        />

        <Route
            path="/"
            element={profile == null ? <Navigate to="/login"/> : <Home/>}
        />
      </Routes>
    </>
  )
}

// Wrapper component to provide router context
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper
