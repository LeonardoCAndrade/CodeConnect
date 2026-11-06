import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { buttonClasses } from '../atoms/buttonStyles'
import NavItem from '../molecules/NavItem'

/**
 * Menu lateral (desktop) que vira cabeçalho com barra de navegação inferior em telas
 * pequenas. O último item alterna entre Login e Sair conforme a sessão.
 */
export default function SideMenu() {
  const { isAuthenticated, signOut } = useAuth()

  return (
    <aside className="flex w-full flex-col items-center gap-6 rounded-lg bg-surface px-4 py-6 lg:w-[177px] lg:shrink-0 lg:gap-20 lg:self-stretch lg:py-10">
      <Link to="/" className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <img src="/logo.svg" alt="CodeConnect" width={127.258} height={40} />
      </Link>
      <div className="flex w-full max-w-xs flex-col items-center gap-10">
        <Link to="/publicar" className={buttonClasses('outline', 'lg')}>
          Publicar
        </Link>
        <nav
          aria-label="Menu principal"
          className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-background bg-surface px-2 py-2 lg:static lg:flex-col lg:items-center lg:gap-10 lg:border-0 lg:bg-transparent lg:p-0"
        >
          <NavItem icon="feed" label="Feed" to="/" />
          <NavItem icon="accountCircle" label="Perfil" disabled />
          <NavItem icon="info" label="Sobre nós" disabled />
          {isAuthenticated ? (
            <NavItem icon="logout" label="Sair" onClick={signOut} />
          ) : (
            <NavItem icon="login" label="Login" to="/login" />
          )}
        </nav>
      </div>
    </aside>
  )
}
