import { useState } from 'react';
import { useGame } from '../context/GameContext';

const Features = () => {
  const { character, addFeature, updateFeature, deleteFeature, restoreFeatures } = useGame();
  const [showForm, setShowForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    usesMax: null,
    usesCurrent: null,
    restoreOn: 'long' // 'short', 'long', 'both', 'none'
  });

  const handleAddFeature = () => {
    if (newFeature.name) {
      addFeature({
        ...newFeature,
        usesCurrent: newFeature.usesMax !== null ? newFeature.usesMax : null
      });
      setNewFeature({
        name: '',
        description: '',
        usesMax: null,
        usesCurrent: null,
        restoreOn: 'long'
      });
      setShowForm(false);
    }
  };

  const useFeature = (id) => {
    const feature = character.features.find(f => f.id === id);
    if (feature && feature.usesCurrent > 0) {
      updateFeature(id, { usesCurrent: feature.usesCurrent - 1 });
    }
  };

  return (
    <div className="card">
      <h2>Особенности и Черты (Features & Traits)</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Добавить способность'}
        </button>
        <button className="btn btn-secondary" onClick={restoreFeatures}>
          🔄 Восстановить после отдыха
        </button>
      </div>

      {showForm && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1a2e', borderRadius: '4px' }}>
          <div className="form-group">
            <label>Название способности</label>
            <input
              type="text"
              value={newFeature.name}
              onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Например: Дыхание дракона, Второе дыхание"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Максимальное использование</label>
              <input
                type="number"
                min="1"
                value={newFeature.usesMax || ''}
                onChange={(e) => setNewFeature(prev => ({
                  ...prev,
                  usesMax: parseInt(e.target.value) || null,
                  usesCurrent: parseInt(e.target.value) || null
                }))}
                placeholder="Оставьте пустым для неограниченного"
              />
            </div>
            <div className="form-group">
              <label>Восстановление</label>
              <select
                value={newFeature.restoreOn}
                onChange={(e) => setNewFeature(prev => ({ ...prev, restoreOn: e.target.value }))}
              >
                <option value="long">Долгий отдых</option>
                <option value="short">Короткий отдых</option>
                <option value="both">Короткий или долгий</option>
                <option value="none">Не восстанавливается</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={newFeature.description}
              onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
              rows="4"
              placeholder="Описание способности и её эффектов"
            />
          </div>

          <button className="btn" onClick={handleAddFeature} style={{ marginTop: '1rem' }}>
            Сохранить
          </button>
        </div>
      )}

      <div className="feature-list" style={{ marginTop: '1rem' }}>
        {character.features.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-header">
              <span className="feature-name">{feature.name}</span>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => deleteFeature(feature.id)}
              >
                Удалить
              </button>
            </div>
            
            <p style={{ color: '#aaa', margin: '0.5rem 0' }}>{feature.description}</p>
            
            {feature.usesMax !== null && (
              <div className="resource-tracker">
                <span className="resource-display">
                  Использований: {feature.usesCurrent} / {feature.usesMax}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-small"
                    onClick={() => useFeature(feature.id)}
                    disabled={feature.usesCurrent <= 0}
                  >
                    Использовать
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => updateFeature(feature.id, { usesCurrent: feature.usesMax })}
                  >
                    Сброс
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
              Восстановление: 
              {feature.restoreOn === 'short' && ' Короткий отдых'}
              {feature.restoreOn === 'long' && ' Долгий отдых'}
              {feature.restoreOn === 'both' && ' Короткий или долгий отдых'}
              {feature.restoreOn === 'none' && ' Не восстанавливается'}
            </div>
          </div>
        ))}
        {character.features.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center' }}>Нет добавленных способностей</p>
        )}
      </div>
    </div>
  );
};

export default Features;
