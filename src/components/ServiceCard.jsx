import './ServiceCard.css';
import { Tag, Edit2 } from 'lucide-react';

export default function ServiceCard({ title, description, price, imageUrl, category, iconColor = 'var(--cyan-main)', onDelete, onEdit }) {
  return (
    <div className="service-card glass-panel animate-fade-in">
      {imageUrl && (
        <div className="service-image-container">
          <img src={imageUrl} alt={title} className="service-image" />
        </div>
      )}
      
      <div className="service-content">
        <div className="service-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 className="service-title" style={{ color: iconColor, margin: 0 }}>{title}</h4>
          <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button className="icon-btn text-cyan" onClick={onEdit} title="Editar serviço" style={{ padding: '4px' }}>
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button className="delete-btn" onClick={onDelete} title="Remover serviço" style={{ padding: '4px' }}>
                &times;
              </button>
            )}
          </div>
        </div>
        <p className="service-desc">{description}</p>
        
        {price && (
          <div className="service-price">
            <Tag size={16} />
            <span>{price}</span>
          </div>
        )}
        
        {category && (
          <div className="service-category-badge" style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            Categoria: <strong>{category}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
