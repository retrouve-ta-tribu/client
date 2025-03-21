import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/Home'
import GroupDetails from './pages/GroupDetails'
import Login from './pages/Login'
import Friends from './pages/Friends'
import { useAuthState } from './hooks/useAuthState'
import CreateGroup from './pages/CreateGroup'
import EditGroup from './pages/EditGroup'

function App() {
    const { profile, isLoading } = useAuthState();

    if (isLoading) {
        return <div>Changement...</div>;
    }

    return (
        <>
            <Routes>
                <Route
                    path="/login"
                    element={profile ? <Navigate to="/" /> : <Login />}
                />
                <Route
                    path="/group/:id"
                    element={profile ? <GroupDetails /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/group/:id/edit"
                    element={profile ? <EditGroup /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/friends"
                    element={profile ? <Friends /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/"
                    element={profile ? <Home /> : <Navigate to="/login" />}
                />
                <Route path="/create-group" element={<CreateGroup />} />
            </Routes>
        </>
    )
}

// Wrapper component to provide router context
function AppWrapper() {
    return (
        <Router>
            <App/>
        </Router>
    )
}

export default AppWrapper
