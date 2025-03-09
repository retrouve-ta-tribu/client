import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import GroupDetails from './pages/GroupDetails.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:id" element={<GroupDetails />} />
      </Routes>
    </Router>
  )
}

export default App
