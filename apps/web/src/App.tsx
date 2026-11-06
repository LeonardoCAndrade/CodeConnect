import { Navigate, Outlet, Route, Routes } from 'react-router'
import RequireAuth from './auth/RequireAuth'
import FeedPage from './components/pages/FeedPage'
import LoginPage from './components/pages/LoginPage'
import NewPostPage from './components/pages/NewPostPage'
import PostDetailPage from './components/pages/PostDetailPage'
import SignupPage from './components/pages/SignupPage'
import { AppTemplate } from './components/templates/AppTemplate'

function App() {
  return (
    <Routes>
      {/* Feed, detalhe e publicação compartilham o mesmo layout com o menu lateral. */}
      <Route
        element={
          <AppTemplate>
            <Outlet />
          </AppTemplate>
        }
      >
        <Route index element={<FeedPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
        <Route
          path="publicar"
          element={
            <RequireAuth>
              <NewPostPage />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
