import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, FileText, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../supabase';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    cpf: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Criar username (slug da url) sem números
      const baseUsername = formData.fullName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // 2. Verificar se o username já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', baseUsername)
        .single();
      
      if (existingUser) {
        setError('Este nome já está em uso na plataforma. Por favor, adicione um segundo sobrenome ao "Nome Completo" para criarmos um link único para você.');
        setLoading(false);
        return;
      }

      // 3. Criar usuário no Supabase Auth com metadados
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            username: baseUsername,
            phone: formData.phone,
            cpf: formData.cpf
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Redireciona para o dashboard
      // O Supabase Auth vai retornar o usuário e a sessão (se confirmação de email estiver off)
      // O trigger no banco vai criar o registro na tabela 'users' automaticamente
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(`Ocorreu um erro ao criar a conta. Tente novamente. Detalhes: ${err.message || err.error_description}`);
    }
    setLoading(false);
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <div className="register-container">
      <div className="register-card glass-panel animate-fade-in">
        <div className="register-header">
          <h2>Crie sua conta</h2>
          <p>Dê o próximo passo na sua carreira de TI em menos de 1 minuto.</p>
        </div>

        {error && <div className="error-message" style={{ color: 'var(--error)', background: 'rgba(255,0,0,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Nome Completo</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="Ex: Henrique Alves"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
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
                  placeholder="Mín. 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone / WhatsApp</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>CPF</label>
              <div className="input-wrapper">
                <FileText size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="cyan-btn submit-btn pulse-border mt-4">
            {loading ? 'Criando Conta...' : <>Finalizar Cadastro <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="login-link">
          Já tem uma conta? <Link to="/login" className="text-cyan">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
