import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import GroupDetails from './pages/GroupDetails.jsx'
import Login from './pages/Login.tsx'
import authService from './services/authService'
import { useEffect } from 'react'

function App() {
  const location = useLocation()

  useEffect(() => {
    if (authService.profile) {
      console.log('User logged in:', authService.profile.name)
    } else {
      console.log('User logged out')
    }
  }, [authService.profile])

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/group/:id"
          element={
            authService.isLoading ? <div>Loading...</div> :
            authService.profile ? <GroupDetails /> : <Navigate to="/login" replace />
          }
        />

        <Route
            path="/"
            element={authService.profile == null ? <Navigate to="/login"/> : <Home/>}
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
