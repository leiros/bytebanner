import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { currentUser } = useAuth();
  return (
    <nav className="navbar glass-panel">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <Terminal className="brand-icon" size={28} />
          <span className="brand-name">Byte<span className="text-cyan">Banner</span></span>
        </Link>
        <div className="nav-links">
          {currentUser ? (
            <>
              {currentUser.email === 'leiroos@hotmail.com' && (
                <Link to="/admin" className="nav-link" style={{color: 'var(--premium-gold)', fontWeight: 'bold'}}>Painel Admin</Link>
              )}
              <Link to="/dashboard" className="cyan-btn nav-btn">
                Meu Painel
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="cyan-btn nav-btn">
                Criar Perfil
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
