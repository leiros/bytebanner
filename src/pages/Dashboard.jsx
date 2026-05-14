import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import PremiumUpsellModal from '../components/PremiumUpsellModal';
import { Plus, Palette, Image as ImageIcon, Eye, LogOut, Zap, User, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const THEMES = [
  { id: 'win11', name: 'Windows 11 Fluent (Padrão)', color: '#0078D4', bg: '#F3F2F1', isLight: true },
  { id: 'hacker', name: 'Hacker Terminal', color: '#00FF00', bg: '#2D333B' }
];

export default function Dashboard() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', username: '', city: '', state: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ title: '', description: '', price: '', imageUrl: '', category: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["Reparos em placas", "Infraestrutura", "Cabeamento", "Venda de peças"]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (user) {
          setUserData(user);
          setProfileData({
            name: user.name || '',
            username: user.username || '',
            city: user.city || '',
            state: user.state || ''
          });
          if (user.theme_config) setActiveTheme(user.theme_config);
          if (user.services) setServices(user.services);
        }

        const { data: settings } = await supabase
          .from('settings')
          .select('categories')
          .eq('id', 'platform')
          .single();

        if (settings && settings.categories) {
          setCategories(settings.categories);
        }
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleUpdateSupabase = async (updates) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id);
      
      if (error) throw error;
    } catch (e) {
      console.error("Erro ao atualizar banco", e);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!editingServiceId && services.length >= 6) {
      setIsModalOpen(true);
      return;
    }
    
    if (newService.title && newService.description) {
      let updatedServices;
      if (editingServiceId) {
        updatedServices = services.map(s => s.id === editingServiceId ? { ...newService, id: editingServiceId } : s);
      } else {
        updatedServices = [...services, { ...newService, id: Date.now() }];
      }
      setServices(updatedServices);
      setEditingServiceId(null);
      setNewService({ title: '', description: '', price: '', imageUrl: '', category: '' });
      await handleUpdateSupabase({ services: updatedServices });
    }
  };

  const handleDeleteService = async (id) => {
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    await handleUpdateSupabase({ services: updatedServices });
  };

  const handleThemeChange = async (theme) => {
    setActiveTheme(theme);
    await handleUpdateSupabase({ theme_config: theme });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleHighlight = async (type) => {
    alert('Funcionalidade de impulsionamento em manutenção (migração de sistema).');
    /*
    try {
      setLoading(true);
      const createPref = httpsCallable(cloudFunctions, 'createPreference');
      const result = await createPref({ type });
      
      if (result.data && result.data.init_point) {
        // Redireciona o usuário para pagar no Mercado Pago
        window.location.href = result.data.init_point;
      }
    } catch(err) {
      console.error(err);
      alert('Erro ao gerar pagamento. Tente novamente mais tarde.');
      setLoading(false);
    }
    */
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("TEM CERTEZA? Isso apagará permanentemente seu perfil, seus serviços e seu acesso. Esta ação não pode ser desfeita.");
    if (!confirm) return;

    try {
      setLoading(true);
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      
      await signOut();
      navigate('/');
      alert("Sua conta foi excluída com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir conta. Tente novamente mais tarde.");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container dashboard-container"><p style={{textAlign:'center', marginTop:'100px'}}>Carregando seu painel...</p></div>;
  }

  return (
    <div className="container dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h1>Meu Painel, {userData?.name?.split(' ')[0] || 'Técnico'}</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to={`/p/${userData?.username}`} className="secondary-btn">
            <Eye size={18} style={{ marginRight: '8px' }} />
            Ver Perfil Público
          </Link>
          <button onClick={handleLogout} className="secondary-btn" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-sidebar">
          <div className="glass-panel sidebar-card" style={{ marginBottom: '24px' }}>
            <h3><User size={20} className="text-cyan inline-icon"/> Dados do Perfil</h3>
            <div className="form-group mb-3">
              <label>Nome Visível</label>
              <input type="text" className="input-field" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} onBlur={() => handleUpdateSupabase({name: profileData.name})} />
            </div>
            <div className="form-group mb-3">
              <label>Nome de Usuário (URL)</label>
              <input type="text" className="input-field" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} onBlur={() => handleUpdateSupabase({username: profileData.username})} />
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="form-group">
                <label>Cidade</label>
                <input type="text" className="input-field" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} onBlur={() => handleUpdateSupabase({city: profileData.city})} />
              </div>
              <div className="form-group">
                <label>Estado (Sigla)</label>
                <input type="text" className="input-field" value={profileData.state} onChange={(e) => setProfileData({...profileData, state: e.target.value.toUpperCase()})} onBlur={() => handleUpdateSupabase({state: profileData.state})} maxLength="2" />
              </div>
            </div>
          </div>

          <div className="glass-panel sidebar-card">
            <h3><Palette size={20} className="text-cyan inline-icon"/> Temas & Cores</h3>
            <p className="sm-text">Selecione o tema principal do seu perfil</p>
            
            <div className="theme-list">
              {THEMES.map(theme => (
                <button 
                  key={theme.id}
                  className={`theme-btn ${activeTheme.id === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(theme)}
                >
                  <div className="theme-preview" style={{ background: theme.bg }}>
                    <div className="theme-accent" style={{ background: theme.color }}></div>
                  </div>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>

            <div className="divider" />
            
            <h3><ImageIcon size={20} className="text-cyan inline-icon"/> Banner Customizado</h3>
            <p className="sm-text">Faça upload de uma imagem de fundo (URL por enquanto)</p>
            <input 
              type="text" 
              className="input-field mb-2" 
              placeholder="https://..." 
              value={userData?.banner_url || ''}
              onChange={(e) => {
                setUserData({...userData, banner_url: e.target.value});
              }}
              onBlur={() => handleUpdateSupabase({ banner_url: userData.banner_url })}
            />
            <p className="sm-text" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Cole a URL e clique fora do campo para salvar.</p>
          </div>

          <div className="glass-panel sidebar-card" style={{ marginTop: '24px' }}>
            <h3><Zap size={20} className="text-gold inline-icon" style={{ fill: 'var(--gold)' }}/> Impulsionar</h3>
            <p className="sm-text" style={{ marginBottom: '16px' }}>Destaque-se na página inicial e atraia mais clientes.</p>
            <button className="cyan-btn" style={{ width: '100%', marginBottom: '12px', fontSize: '0.9rem' }} onClick={() => handleHighlight('profile')}>
              Destacar Perfil - R$ 4,99 <small>/ 7 dias</small>
            </button>
            <button className="secondary-btn" style={{ width: '100%', fontSize: '0.9rem' }} onClick={() => handleHighlight('services')}>
              Destacar Serviços - R$ 1,99 <small>/ 7 dias</small>
            </button>
          </div>

          <div className="glass-panel sidebar-card" style={{ marginTop: '24px', borderColor: 'rgba(255, 71, 87, 0.3)' }}>
            <h3 style={{ color: 'var(--error)' }}><Trash2 size={20} className="inline-icon"/> Zona de Perigo</h3>
            <p className="sm-text" style={{ marginBottom: '16px' }}>Deseja encerrar suas atividades e apagar todos os seus dados?</p>
            <button 
              className="secondary-btn" 
              style={{ width: '100%', fontSize: '0.9rem', color: 'var(--error)', borderColor: 'var(--error)' }} 
              onClick={handleDeleteAccount}
            >
              Excluir Minha Conta Permanentemente
            </button>
          </div>
        </div>

        <div className="dashboard-main">
          <div className="glass-panel form-card">
            <h3>{editingServiceId ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h3>
            <div className="service-count">
              {services.length}/6 serviços utilizados no plano grátis
            </div>
            
            <form onSubmit={handleAddService} className="add-service-form">
              <div className="form-group">
                <label>Título do Serviço</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Formatação de Notebook" 
                  value={newService.title}
                  onChange={(e) => setNewService({...newService, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea 
                  className="input-field textarea" 
                  placeholder="Descreva o que está incluso no serviço..." 
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria (Opcional)</label>
                <select 
                  className="input-field" 
                  value={newService.category || ''}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Preço Base (Opcional)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: A partir de R$ 100" 
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>URL da Imagem (Opcional)</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    placeholder="https://sua-imagem.com/foto.jpg" 
                    value={newService.imageUrl}
                    onChange={(e) => setNewService({...newService, imageUrl: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" className="cyan-btn mt-2">
                  <Plus size={18} /> {editingServiceId ? 'Salvar Alterações' : 'Adicionar Serviço'}
                </button>
                {editingServiceId && (
                  <button type="button" className="secondary-btn mt-2" onClick={() => {
                    setEditingServiceId(null);
                    setNewService({ title: '', description: '', price: '', imageUrl: '', category: '' });
                  }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="services-list-container mt-4">
            <h3>Seus Serviços Cadastrados</h3>
            {services.length === 0 ? (
              <p className="empty-state">Nenhum serviço cadastrado ainda.</p>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <ServiceCard 
                    key={service.id}
                    title={service.title}
                    description={service.description}
                    price={service.price}
                    imageUrl={service.imageUrl}
                    category={service.category}
                    iconColor={activeTheme.color}
                    onDelete={() => handleDeleteService(service.id)}
                    onEdit={() => {
                      setEditingServiceId(service.id);
                      setNewService({ 
                        title: service.title, 
                        description: service.description, 
                        price: service.price || '', 
                        imageUrl: service.imageUrl || '', 
                        category: service.category || '' 
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PremiumUpsellModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
