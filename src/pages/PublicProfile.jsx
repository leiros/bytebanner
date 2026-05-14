import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { Mail, Phone, MapPin, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { supabase } from '../supabase';
import './PublicProfile.css';

export default function PublicProfile() {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error || !data) {
          setError('Perfil não encontrado.');
        } else {
          setProfileData(data);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setError('Ocorreu um erro ao carregar este perfil.');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  // Atualiza SEO dinamicamente
  useEffect(() => {
    if (profileData) {
      const numServices = profileData.services ? profileData.services.length : 0;
      const dynamicTitle = `${profileData.name} - ByteBanner`;
      const dynamicDesc = `Confira o perfil de ${profileData.name}. ${numServices} serviço(s) oferecido(s).`;
      
      document.title = dynamicTitle;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', dynamicDesc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', dynamicTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', dynamicDesc);
    }
  }, [profileData]);

  if (loading) {
    return <div className="public-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><p>Carregando perfil de {username}...</p></div>;
  }

  if (error || !profileData) {
    return (
      <div className="public-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <h2 style={{ marginBottom: '16px' }}>{error}</h2>
        <Link to="/" className="cyan-btn"><ArrowLeft size={18}/> Voltar para o início</Link>
      </div>
    );
  }

  const themeVars = {
    '--profile-bg': profileData.theme_config?.bg || '#050A1F',
    '--profile-accent': profileData.theme_config?.color || '#00F0FF',
    '--profile-text': profileData.theme_config?.isLight ? '#1A1A1A' : '#FFFFFF',
    '--profile-text-sec': profileData.theme_config?.isLight ? '#555555' : '#A3AED0',
    '--profile-card-bg': profileData.theme_config?.isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(11, 20, 55, 0.6)'
  };

  const getWhatsappLink = (phoneStr) => {
    if (!phoneStr) return '#';
    const numbers = phoneStr.replace(/\D/g, '');
    const finalNumber = numbers.startsWith('55') ? numbers : '55' + numbers;
    return `https://wa.me/${finalNumber}`;
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contato de ${contactForm.name} via Portfólio`);
    const bodyText = `Nome: ${contactForm.name}\nTelefone: ${contactForm.phone}\n\nMensagem:\n${contactForm.message}`;
    const body = encodeURIComponent(bodyText);
    window.open(`mailto:${profileData.email}?subject=${subject}&body=${body}`);
    setIsModalOpen(false);
    setContactForm({ name: '', phone: '', message: '' });
  };


  return (
    <div className="public-profile" style={themeVars}>
      {/* Banner Area */}
      <div 
        className="profile-banner animate-fade-in"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 70%, var(--profile-bg) 100%), url(${profileData.banner_url})`,
          borderBottom: `2px solid var(--profile-accent)`
        }}
      >
        <div className="container banner-content">
          <img src={profileData.avatar_url} alt="Avatar" className="profile-avatar" style={{ borderColor: 'var(--profile-accent)' }} />
        </div>
      </div>

      <div className="container profile-content">
        <div className="profile-info text-center animate-fade-in">
          <h1 className="profile-name">
            {profileData.name} <CheckCircle className="verified-icon" size={24} style={{ color: 'var(--profile-accent)' }} />
          </h1>
          <p className="profile-title">{profileData.title || 'Profissional de TI'}</p>
          
          <div className="profile-contacts">
            <span className="contact-badge"><MapPin size={16} /> {profileData.city && profileData.state ? `${profileData.city}, ${profileData.state} - Brasil` : profileData.location || 'Atendimento Local e Remoto'}</span>
            <a href={getWhatsappLink(profileData.phone)} target="_blank" rel="noreferrer" className="contact-badge"><Phone size={16} /> {profileData.phone}</a>
            <a href={`mailto:${profileData.email}`} className="contact-badge"><Mail size={16} /> {profileData.email}</a>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="contact-btn pulse-border" style={{ backgroundColor: 'var(--profile-accent)', color: profileData.theme_config?.isLight ? '#fff' : '#000', boxShadow: `0 0 15px var(--profile-accent)` }}>
            Solicitar Orçamento
          </button>
        </div>

        <div className="profile-services mt-5">
          <h2 className="section-title">Serviços Oferecidos</h2>
          
          {!profileData.services || profileData.services.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--profile-text-sec)', marginTop: '32px' }}>Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="services-grid">
              {profileData.services.map(service => (
                <ServiceCard 
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  imageUrl={service.imageUrl}
                  iconColor="var(--profile-accent)"
                />
              ))}
            </div>
          )}
        </div>
        
        <footer className="profile-footer">
          <p>Criado com <span style={{ color: 'var(--cyan-main)', fontWeight: 'bold' }}>ByteBanner</span>. Hospede seu portfólio de TI hoje mesmo.</p>
        </footer>
      </div>

      {/* Modal de Orçamento */}
      {isModalOpen && (
        <div className="contact-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="contact-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            <h2>Solicitar Orçamento</h2>
            <form onSubmit={handleContactSubmit}>
              <input 
                type="text" 
                placeholder="Seu Nome" 
                required 
                value={contactForm.name}
                onChange={e => setContactForm({...contactForm, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Seu WhatsApp" 
                required 
                value={contactForm.phone}
                onChange={e => setContactForm({...contactForm, phone: e.target.value})}
              />
              <textarea 
                placeholder="Como posso te ajudar?" 
                required
                value={contactForm.message}
                onChange={e => setContactForm({...contactForm, message: e.target.value})}
              ></textarea>
              <button type="submit" className="cyan-btn" style={{ width: '100%', justifyContent: 'center' }}>Enviar Mensagem</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
