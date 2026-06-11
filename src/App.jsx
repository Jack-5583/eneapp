import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ExamsPage from './pages/ExamsPage'
import ControlPage from './pages/ControlPage'
import MonitoringPage from './pages/MonitoringPage'
import RoomPage from './pages/RoomPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/exams" replace />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="control" element={<ControlPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/exams" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
