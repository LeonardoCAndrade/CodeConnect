import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './components/pages/LoginPage'
import SignupPage from './components/pages/SignupPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
