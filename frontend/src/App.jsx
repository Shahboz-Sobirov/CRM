import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Groups from './pages/Groups'
import Attendance from './pages/Attendance'
import Payments from './pages/Payments'
import UsersPage from './pages/Users'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route path="/groups" element={<Groups />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/payments" element={<Payments />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
