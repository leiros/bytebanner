import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, ShieldCheck, Zap, Star } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

export default function Home() {
  const [featuredProfiles, setFeaturedProfiles] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState(["Reparos em placas", "Infraestrutura", "Cabeamento", "Venda de peças"]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Busca perfis destacados (profile)
        const { data: profiles } = await supabase
          .from('users')
          .select('*')
          .eq('is_highlighted', true)
          .eq('highlight_type', 'profile')
          .limit(6);
        
        if (profiles) setFeaturedProfiles(profiles);

        // Busca serviços destacados (users com destaque de services)
        try {
          const { data: serviceUsers } = await supabase
            .from('users')
            .select('*')
            .eq('is_highlighted', true)
            .eq('highlight_type', 'services')
            .limit(3);

          if (serviceUsers) {
            const allServices = [];
            serviceUsers.forEach(user => {
              if (user.services && Array.isArray(user.services)) {
                user.services.forEach(s => {
                  allServices.push({ 
                    ...s, 
                    username: user.username,
                    themeColor: user.theme_config?.color || 'var(--cyan-main)' 
                  });
                });
              }
            });
            setFeaturedServices(allServices.slice(0, 3));
          }
        } catch (err) {
          console.error("Aviso: Falha ao carregar serviços destacados.", err);
        }

        // Buscar categorias
        const { data: settings } = await supabase
          .from('settings')
          .select('categories')
          .eq('id', 'platform')
          .single();

        if (settings && settings.categories) {
          setCategories(settings.categories);
        }

        // Busca serviços recentes
        try {
          const { data: recentUsers } = await supabase
            .from('users')
            .select('*')
            .limit(10);

          if (recentUsers) {
            const rServices = [];
            recentUsers.forEach(user => {
              if (user.services && Array.isArray(user.services)) {
                user.services.forEach(s => {
                  rServices.push({ 
                    ...s, 
                    username: user.username,
                    themeColor: user.theme_config?.color || 'var(--cyan-main)',
                    profileName: user.name
                  });
                });
              }
            });
            setRecentServices(rServices.slice(0, 3));
          }
        } catch(err) {}

      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
      }
      setLoading(false);
    };

    fetchHomeData();
  }, []);

  return (
    <div className="home-container">
      <section className="hero container animate-fade-in">
        <div className="hero-content">
          <div className="badge pulse-border">🚀 Mais de 10.000 profissionais já usam</div>
          <h1 className="hero-title">
            O seu portfólio de <br />
            <span className="text-cyan text-glow">Assistência Técnica</span>
          </h1>
          <p className="hero-subtitle">
            Crie sua página profissional em minutos. Mostre seus serviços, atraia mais clientes e passe mais credibilidade. Tudo isso com um design premium e focado em conversão.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to="/dashboard" className="cyan-btn btn-large pulse-border">
                Acessar Meu Painel
              </Link>
            ) : (
              <Link to="/login" className="cyan-btn btn-large pulse-border">
                Criar meu Perfil Grátis
              </Link>
            )}
            <a href="#buscar-categoria" className="secondary-btn btn-large">
              Buscar Serviços
            </a>
          </div>
        </div>
      </section>

      {/* Categorias Section */}
      <section id="buscar-categoria" className="categories-section container mt-5">
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '2rem' }}>Encontre por Categoria</h2>
          <p className="text-secondary mt-2">Filtre os perfis de acordo com o serviço que você precisa hoje.</p>
        </div>
        <div className="categories-list" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`category-btn animate-fade-in`}
              onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid var(--cyan-main)',
                background: 'rgba(0, 120, 212, 0.05)',
                color: 'var(--cyan-main)',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="features container" style={{ marginTop: '80px' }}>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Monitor size={32} /></div>
          <h3>Design Moderno</h3>
          <p>Personalize suas cores e banner. Seu perfil vai parecer o site de uma startup do Vale do Silício.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Zap size={32} /></div>
          <h3>Alta Conversão</h3>
          <p>Layout projetado para que seus clientes entendam rapidamente o que você faz e entrem em contato.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><ShieldCheck size={32} /></div>
          <h3>Confiabilidade</h3>
          <p>Profissionais com página própria têm 78% mais chances de fechar orçamentos de alto valor.</p>
        </div>
      </section>

      <section className="featured-profiles container">
        <div className="featured-header text-center">
          <h2><Star className="text-cyan inline-icon" size={28}/> Destaques da Semana</h2>
          <p className="text-secondary mt-2">Conheça os técnicos em destaque na nossa plataforma essa semana.</p>
        </div>
        
        <div className="profiles-grid mt-4">
          {loading ? (
            <p className="text-center w-full" style={{ color: 'var(--text-secondary)' }}>Carregando perfis...</p>
          ) : featuredProfiles.length > 0 ? (
            featuredProfiles.map((profile, i) => {
              const themeColor = profile.theme_config?.color || 'var(--cyan-main)';
              return (
                <Link to={`/p/${profile.username}`} className="profile-card glass-panel" key={i}>
                  <div className="profile-card-bg" style={{ backgroundImage: `url(${profile.banner_url})`, borderBottomColor: themeColor }}></div>
                  <img src={profile.avatar_url} alt="Avatar" className="profile-card-avatar" style={{ borderColor: themeColor }} />
                  <div className="profile-card-info" style={{ borderColor: themeColor }}>
                    <h4 style={{ color: themeColor }}>{profile.name}</h4>
                    <p>{profile.title || 'Técnico Especialista'}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-center w-full" style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
              Ainda não temos perfis suficientes. <Link to="/register" className="text-cyan">Seja o primeiro!</Link>
            </p>
          )}
        </div>
        
        <div className="text-center mt-4 mb-5">
          {currentUser ? (
            <Link to="/dashboard" className="cyan-btn">Junte-se aos destaques também!</Link>
          ) : (
             <Link to="/login" className="cyan-btn">Junte-se aos destaques também!</Link>
          )}
        </div>
      </section>

      {featuredServices.length > 0 && (
        <section className="featured-services container mb-5">
          <div className="featured-header text-center">
            <h2><Star className="text-gold inline-icon" size={28}/> Serviços em Destaque</h2>
            <p className="text-secondary mt-2">Serviços premium de profissionais verificados.</p>
          </div>
          
          <div className="profiles-grid mt-4">
               {featuredServices.map((service, idx) => (
                 <Link to={`/p/${service.username}`} key={`feat-${idx}`} className="profile-card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', textAlign: 'left', textDecoration: 'none', border: `1px solid ${service.themeColor}`, boxShadow: `0 0 10px ${service.themeColor}33` }} >
                    <h3 style={{ color: service.themeColor, marginBottom: '4px' }}>{service.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>por {service.username}</p>
                    <p style={{ color: 'var(--text-primary)', marginBottom: '16px', flexGrow: 1 }}>{service.description?.substring(0, 80)}...</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                       <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                         {service.price ? `R$ ${parseFloat(service.price).toFixed(2)}` : 'Sob Consulta'}
                       </span>
                    </div>
                 </Link>
               ))}
          </div>
        </section>
      )}

      {recentServices.length > 0 && (
        <section className="recent-services container mb-5" style={{ paddingBottom: '80px' }}>
          <div className="featured-header text-center">
            <h2>Serviços Cadastrados Recentemente</h2>
            <p className="text-secondary mt-2">Últimos serviços publicados na plataforma pelas nossas assistências.</p>
          </div>
          
          <div className="profiles-grid mt-4">
               {recentServices.map((service, idx) => (
                 <Link to={`/p/${service.username}`} key={`recent-${idx}`} className="profile-card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', textAlign: 'left', textDecoration: 'none' }} >
                    <h3 style={{ color: service.themeColor, marginBottom: '4px' }}>{service.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Assistência: {service.profileName}</p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1 }}>{service.description?.substring(0, 80)}...</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                       <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                         {service.price ? `R$ ${parseFloat(service.price).toFixed(2)}` : 'Sob Consulta'}
                       </span>
                    </div>
                 </Link>
               ))}
          </div>
        </section>
      )}

    </div>
  );
}
