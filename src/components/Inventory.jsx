import { useState } from 'react';
import { useGame } from '../context/GameContext';

const Inventory = () => {
  const { character, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useGame();
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    weight: 0,
    attuned: false,
    description: '',
    bonuses: {
      ac: 0,
      savingThrows: '',
      skills: ''
    }
  });

  const handleAddItem = () => {
    if (newItem.name) {
      addInventoryItem(newItem);
      setNewItem({
        name: '',
        quantity: 1,
        weight: 0,
        attuned: false,
        description: '',
        bonuses: {
          ac: 0,
          savingThrows: '',
          skills: ''
        }
      });
      setShowForm(false);
    }
  };

  const totalWeight = character.inventory.reduce(
    (sum, item) => sum + (item.weight || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="card">
      <h2>Инвентарь (Inventory)</h2>
      
      <div style={{ marginBottom: '1rem', color: '#aaa' }}>
        Общий вес: <span style={{ color: '#4ecca3' }}>{totalWeight.toFixed(1)} фунтов</span>
      </div>

      <button className="btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Отмена' : '+ Добавить предмет'}
      </button>

      {showForm && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1a2e', borderRadius: '4px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Название предмета</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Например: Длинный меч"
              />
            </div>
            <div className="form-group">
              <label>Количество</label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="form-group">
              <label>Вес (фунты)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={newItem.weight}
                onChange={(e) => setNewItem(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newItem.attuned}
                onChange={(e) => setNewItem(prev => ({ ...prev, attuned: e.target.checked }))}
              />
              Требуется настройка (Attunement)
            </label>
          </div>

          <h4 style={{ color: '#4ecca3', margin: '1rem 0 0.5rem' }}>Бонусы от предмета</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Бонус к КД (AC)</label>
              <input
                type="number"
                value={newItem.bonuses.ac}
                onChange={(e) => setNewItem(prev => ({
                  ...prev,
                  bonuses: { ...prev.bonuses, ac: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div className="form-group">
              <label>Бонусы к спасброскам</label>
              <input
                type="text"
                value={newItem.bonuses.savingThrows}
                onChange={(e) => setNewItem(prev => ({
                  ...prev,
                  bonuses: { ...prev.bonuses, savingThrows: e.target.value }
                }))}
                placeholder="Например: +2 к спасброскам Мудрости"
              />
            </div>
            <div className="form-group">
              <label>Бонусы к навыкам</label>
              <input
                type="text"
                value={newItem.bonuses.skills}
                onChange={(e) => setNewItem(prev => ({
                  ...prev,
                  bonuses: { ...prev.bonuses, skills: e.target.value }
                }))}
                placeholder="Например: Преимущество на Проверки Восприятия"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Описание/Эффекты</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              placeholder="Особые свойства предмета"
            />
          </div>

          <button className="btn" onClick={handleAddItem} style={{ marginTop: '1rem' }}>
            Сохранить
          </button>
        </div>
      )}

      <div className="item-list" style={{ marginTop: '1rem' }}>
        {character.inventory.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <div>
                <span className="item-name">{item.name}</span>
                {item.attuned && (
                  <span style={{ marginLeft: '0.5rem', color: '#e94560', fontSize: '0.8rem' }}>
                    ⚡ Требуется настройка
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#888' }}>x{item.quantity}</span>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => deleteInventoryItem(item.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
              Вес: {item.weight} фн | 
              {item.bonuses?.ac !== 0 && ` КД: ${item.bonuses.ac >= 0 ? '+' : ''}${item.bonuses.ac}`}
            </div>
            {(item.bonuses?.savingThrows || item.bonuses?.skills) && (
              <div style={{ fontSize: '0.85rem', color: '#4ecca3', marginTop: '0.25rem' }}>
                {item.bonuses.savingThrows && <div>{item.bonuses.savingThrows}</div>}
                {item.bonuses.skills && <div>{item.bonuses.skills}</div>}
              </div>
            )}
            {item.description && (
              <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#888' }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
        {character.inventory.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center' }}>Инвентарь пуст</p>
        )}
      </div>
    </div>
  );
};

export default Inventory;
