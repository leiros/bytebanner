import './PremiumUpsellModal.css';
import { Crown, CheckCircle } from 'lucide-react';

export default function PremiumUpsellModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in premium-border">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <div className="premium-icon">
            <Crown size={40} className="text-gold pulse-border radius-full" />
          </div>
          <h2 className="modal-title">Limite de Serviços Atingido!</h2>
          <p className="modal-subtitle">
            Você atingiu o limite de 6 serviços do plano gratuito. Faça o upgrade para o Premium e libere todo o potencial do seu negócio.
          </p>
        </div>

        <div className="premium-features">
          <div className="feature-item">
            <CheckCircle className="text-gold" size={20} />
            <span>Serviços <strong>Ilimitados</strong></span>
          </div>
          <div className="feature-item">
            <CheckCircle className="text-gold" size={20} />
            <span>Remoção da marca "Feito com ByteBanner"</span>
          </div>
          <div className="feature-item">
            <CheckCircle className="text-gold" size={20} />
            <span>Hospedagem de domínio personalizado (.com.br)</span>
          </div>
          <div className="feature-item">
            <CheckCircle className="text-gold" size={20} />
            <span>Seção de depoimentos de clientes</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="premium-btn w-full">Fazer Upgrade agora</button>
          <button className="secondary-btn w-full mt-3" onClick={onClose}>Talvez mais tarde</button>
        </div>
      </div>
    </div>
  );
}
