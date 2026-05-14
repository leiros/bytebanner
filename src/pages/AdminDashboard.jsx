import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, DollarSign, Tag, Trash2, Plus, Edit2, Check, X, Star, Zap } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    highlightedProfiles: 0,
    highlightedServices: 0,
    totalRevenue: 0
  });

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.email !== 'leiroos@hotmail.com') {
      navigate('/');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      // Users & Metrics
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;

      let tUsers = 0;
      let hp = 0;
      let hs = 0;

      allUsers?.forEach(user => {
        tUsers++;
        if (user.is_highlighted) {
          if (user.highlight_type === 'profile') hp++;
          else if (user.highlight_type === 'services') hs++;
        }
      });
      
      const rev = (hp * 4.99) + (hs * 1.99);

      setMetrics({
        totalUsers: tUsers,
        highlightedProfiles: hp,
        highlightedServices: hs,
        totalRevenue: rev
      });
      setUsers(allUsers || []);

      // Categories
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('categories')
        .eq('id', 'platform')
        .single();

      if (settings && settings.categories) {
        setCategories(settings.categories);
      } else {
        // Fallback default
        const defaultCats = ["Reparos em placas", "Infraestrutura", "Cabeamento", "Venda de peças"];
        await supabase.from('settings').upsert({ id: 'platform', categories: defaultCats });
        setCategories(defaultCats);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const updated = [...categories, newCategory.trim()];
    setCategories(updated);
    setNewCategory('');
    await supabase.from('settings').update({ categories: updated }).eq('id', 'platform');
  };

  const handleDeleteCategory = async (idx) => {
    const updated = categories.filter((_, i) => i !== idx);
    setCategories(updated);
    await supabase.from('settings').update({ categories: updated }).eq('id', 'platform');
  };

  const handleSaveEditCategory = async (idx) => {
    if (!editValue.trim()) return;
    const updated = [...categories];
    updated[idx] = editValue.trim();
    setCategories(updated);
    setEditingIndex(null);
    await supabase.from('settings').update({ categories: updated }).eq('id', 'platform');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Certeza que deseja remover este perfil permanentemente? O usuário perderá acesso ao painel de gerenciamento e página pública sumirá.")) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        
        setUsers(users.filter(u => u.id !== userId));
        setMetrics(prev => ({...prev, totalUsers: prev.totalUsers - 1}));
      } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        alert("Erro ao remover usuário");
      }
    }
  };

  if (loading) return <div className="admin-container"><p style={{textAlign: 'center', marginTop: '100px'}}>Carregando sistema restrito...</p></div>;

  return (
    <div className="container admin-container animate-fade-in">
      <div className="admin-header">
        <h1>Painel do Administrador</h1>
        <p className="text-secondary">Visão geral da plataforma e controle de dados</p>
      </div>

      <div className="admin-metrics-grid mt-4">
        <div className="metric-card glass-panel">
          <Users size={32} className="text-cyan" />
          <div className="metric-info">
            <h3>{metrics.totalUsers}</h3>
            <p>Profissionais</p>
          </div>
        </div>
        <div className="metric-card glass-panel">
          <Star size={32} className="text-cyan" />
          <div className="metric-info">
            <h3>{metrics.highlightedProfiles}</h3>
            <p>Perfis Alavancados</p>
          </div>
        </div>
        <div className="metric-card glass-panel">
          <Zap size={32} className="text-cyan" />
          <div className="metric-info">
            <h3>{metrics.highlightedServices}</h3>
            <p>Serviços Alavancados</p>
          </div>
        </div>
        <div className="metric-card glass-panel highlight-metric">
          <DollarSign size={32} style={{ color: '#F59E0B' }} />
          <div className="metric-info">
            <h3 style={{ color: '#F59E0B' }}>R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}</h3>
            <p>Receita Estimada</p>
          </div>
        </div>
      </div>

      <div className="admin-content-grid mt-5">
        <div className="admin-section glass-panel">
          <h2><Tag className="inline-icon" size={24}/> Gerenciar Categorias</h2>
          
          <div className="add-category-form">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nova Categoria..." 
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <button className="cyan-btn" onClick={handleAddCategory}><Plus size={18} /></button>
          </div>

          <ul className="category-list mt-3">
            {categories.map((cat, idx) => (
              <li key={idx} className="category-item">
                {editingIndex === idx ? (
                  <div className="edit-cat-row">
                    <input 
                      type="text" 
                      className="input-field" 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)} 
                    />
                    <button className="icon-btn success" onClick={() => handleSaveEditCategory(idx)}><Check size={16} /></button>
                    <button className="icon-btn danger" onClick={() => setEditingIndex(null)}><X size={16} /></button>
                  </div>
                ) : (
                  <div className="view-cat-row">
                    <span>{cat}</span>
                    <div className="cat-actions">
                      <button className="icon-btn text-cyan" onClick={() => { setEditingIndex(idx); setEditValue(cat); }}><Edit2 size={16} /></button>
                      <button className="icon-btn danger" onClick={() => handleDeleteCategory(idx)}><Trash2 size={16}/></button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-section glass-panel">
          <h2><Users className="inline-icon" size={24}/> Usuários da Plataforma</h2>
          <div className="users-list-wrapper mt-3">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Username</th>
                  <th>Destaque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-secondary">Nenhum usuário cadastrado.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>@{u.username}</td>
                      <td>
                        {u.is_highlighted ? (
                          <span className="badge highlight-badge">{u.highlight_type}</span>
                        ) : (
                          <span className="badge normal-badge">Livre</span>
                        )}
                      </td>
                      <td>
                        <button className="icon-btn danger" title="Remover Usuário" onClick={() => handleDeleteUser(u.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
