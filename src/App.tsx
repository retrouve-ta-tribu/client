import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import GroupDetails from './pages/GroupDetails.jsx'
import UserDetails from './pages/UserDetails.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:id" element={<GroupDetails />} />
        <Route path="/user/:id" element={<UserDetails />} />
      </Routes>
    </Router>
  )
}

export default App
