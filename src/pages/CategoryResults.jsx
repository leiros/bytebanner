import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import './CategoryResults.css';

export default function CategoryResults() {
  const { categoryId } = useParams();
  const decodedCategory = decodeURIComponent(categoryId);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryServices = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*');
        
        if (users) {
          let matchingServices = [];

          users.forEach(user => {
            if (user.services && user.services.length > 0) {
              user.services.forEach(svc => {
                if (svc.category === decodedCategory) {
                  matchingServices.push({
                    ...svc,
                    provider: {
                      name: user.name,
                      username: user.username,
                      avatarUrl: user.avatar_url,
                      themeColor: user.theme_config?.color || 'var(--cyan-main)'
                    }
                  });
                }
              });
            }
          });

          setServices(matchingServices);
        }
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
      }
      setLoading(false);
    };

    fetchCategoryServices();
  }, [decodedCategory]);

  return (
    <div className="category-results-page container animate-fade-in">
      <div className="category-header">
        <Link to="/" className="back-link"><ArrowLeft size={20} /> Voltar</Link>
        <div className="title-wrapper">
          <Tag size={32} className="text-cyan inline-icon" />
          <h1>Serviços: <span className="text-cyan">{decodedCategory}</span></h1>
        </div>
        <p className="text-secondary mt-2">Profissionais que oferecem este serviço</p>
      </div>

      <div className="results-grid mt-4">
        {loading ? (
          <p className="text-center w-full text-secondary">Buscando profissionais...</p>
        ) : services.length > 0 ? (
          services.map((svc, idx) => (
            <div key={idx} className="glass-panel service-result-card">
              <div className="svc-card-header">
                <img src={svc.provider.avatarUrl} alt={svc.provider.name} className="provider-avatar" style={{ borderColor: svc.provider.themeColor }} />
                <div>
                  <h4 style={{ color: svc.provider.themeColor }}>{svc.provider.name}</h4>
                  <Link to={`/p/${svc.provider.username}`} className="view-profile-link">Ver Perfil <ExternalLink size={14} /></Link>
                </div>
              </div>
              <div className="svc-info mt-2">
                <h3 className="svc-title">{svc.title}</h3>
                <p className="svc-desc">{svc.description}</p>
                {svc.price && <p className="svc-price mt-2"><strong>Preço Base:</strong> {svc.price}</p>}
                {svc.imageUrl && <img src={svc.imageUrl} alt={svc.title} className="svc-image mt-2" />}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p className="text-secondary text-center w-full">Nenhum serviço encontrado nesta categoria.</p>
            <Link to="/" className="cyan-btn mt-4">Voltar ao Início</Link>
          </div>
        )}
      </div>
    </div>
  );
}
