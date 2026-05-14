import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Key } from 'lucide-react';
import { supabase } from '../supabase';
import './Register.css'; // Emprestando os estilos do registro

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message;
      setError(msg);
      console.error(err);
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    if (!formData.email) {
      setError('Por favor, preencha o campo de "E-mail" acima primeiro para enviarmos o link.');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSuccess('E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setError('Falha ao enviar e-mail. Verifique se o e-mail digitado está correto.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card glass-panel animate-fade-in">
        <div className="register-header">
          <h2>Bem-vindo de volta</h2>
          <p>Acesse seu painel para continuar.</p>
        </div>

        {error && <div className="error-message" style={{ color: 'var(--error)', background: 'rgba(255,0,0,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>E-mail</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="input-field with-icon" 
                placeholder="contato@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="input-field with-icon" 
                placeholder="Sua senha secreta"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button type="submit" disabled={loading} className="cyan-btn submit-btn pulse-border">
              {loading ? 'Um momento...' : <>Fazer Login <ArrowRight size={18} /></>}
            </button>
            <button 
              type="button" 
              onClick={handleResetPassword} 
              disabled={loading} 
              className="secondary-btn" 
              style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <Key size={16}/> Esqueci minha senha
            </button>
          </div>
        </form>

        <p className="login-link">
          Ainda não tem conta? <Link to="/register" className="text-cyan">Cadastre-se grátis</Link>
        </p>
      </div>
    </div>
  );
}
