import { useState } from 'react';
import { useGame } from '../context/GameContext';

const Attacks = () => {
  const { character, addAttack, updateAttack, deleteAttack, rollAttack } = useGame();
  const [showForm, setShowForm] = useState(false);
  const [newAttack, setNewAttack] = useState({
    name: '',
    ability: 'str',
    proficient: true,
    bonus: 0,
    damage: [{ dice: '1d8', type: 'slashing', modifier: 0 }],
    description: ''
  });

  const handleAddAttack = () => {
    if (newAttack.name) {
      addAttack(newAttack);
      setNewAttack({
        name: '',
        ability: 'str',
        proficient: true,
        bonus: 0,
        damage: [{ dice: '1d8', type: 'slashing', modifier: 0 }],
        description: ''
      });
      setShowForm(false);
    }
  };

  const addDamageEntry = () => {
    setNewAttack(prev => ({
      ...prev,
      damage: [...prev.damage, { dice: '1d6', type: 'bludgeoning', modifier: 0 }]
    }));
  };

  const updateDamageEntry = (index, field, value) => {
    setNewAttack(prev => ({
      ...prev,
      damage: prev.damage.map((d, i) => i === index ? { ...d, [field]: value } : d)
    }));
  };

  const removeDamageEntry = (index) => {
    setNewAttack(prev => ({
      ...prev,
      damage: prev.damage.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="card">
      <h2>Атаки и Заклинания (Attacks & Spellcasting)</h2>
      
      <button className="btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Отмена' : '+ Добавить атаку'}
      </button>

      {showForm && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1a2e', borderRadius: '4px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                value={newAttack.name}
                onChange={(e) => setNewAttack(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Например: Длинный меч"
              />
            </div>
            <div className="form-group">
              <label>Характеристика</label>
              <select
                value={newAttack.ability}
                onChange={(e) => setNewAttack(prev => ({ ...prev, ability: e.target.value }))}
              >
                <option value="str">Сила</option>
                <option value="dex">Ловкость</option>
                <option value="con">Телосложение</option>
                <option value="int">Интеллект</option>
                <option value="wis">Мудрость</option>
                <option value="cha">Харизма</option>
              </select>
            </div>
            <div className="form-group">
              <label>Бонус атаки</label>
              <input
                type="number"
                value={newAttack.bonus}
                onChange={(e) => setNewAttack(prev => ({ ...prev, bonus: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Владение</label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newAttack.proficient}
                onChange={(e) => setNewAttack(prev => ({ ...prev, proficient: e.target.checked }))}
              />
              Владею этим оружием
            </label>
          </div>

          <h4 style={{ color: '#4ecca3', margin: '1rem 0' }}>Урон</h4>
          {newAttack.damage.map((dmg, index) => (
            <div key={index} className="form-row" style={{ marginBottom: '0.5rem', alignItems: 'end' }}>
              <div className="form-group">
                <label>Кости урона</label>
                <input
                  type="text"
                  value={dmg.dice}
                  onChange={(e) => updateDamageEntry(index, 'dice', e.target.value)}
                  placeholder="1d8"
                />
              </div>
              <div className="form-group">
                <label>Тип урона</label>
                <select
                  value={dmg.type}
                  onChange={(e) => updateDamageEntry(index, 'type', e.target.value)}
                >
                  <option value="slashing">Рубящий</option>
                  <option value="piercing">Колющий</option>
                  <option value="bludgeoning">Дробящий</option>
                  <option value="fire">Огненный</option>
                  <option value="cold">Холодный</option>
                  <option value="lightning">Электрический</option>
                  <option value="acid">Кислотный</option>
                  <option value="poison">Яд</option>
                  <option value="psychic">Психический</option>
                  <option value="necrotic">Некротический</option>
                  <option value="radiant">Сияющий</option>
                  <option value="thunder">Громовой</option>
                  <option value="force">Силовой</option>
                </select>
              </div>
              <div className="form-group">
                <label>Модификатор</label>
                <input
                  type="number"
                  value={dmg.modifier}
                  onChange={(e) => updateDamageEntry(index, 'modifier', parseInt(e.target.value) || 0)}
                />
              </div>
              {newAttack.damage.length > 1 && (
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => removeDamageEntry(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button className="btn btn-small btn-secondary" onClick={addDamageEntry}>
            + Добавить тип урона
          </button>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Описание/Эффекты</label>
            <textarea
              value={newAttack.description}
              onChange={(e) => setNewAttack(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              placeholder="Особые эффекты, которые будут отображаться в чате"
            />
          </div>

          <button className="btn" onClick={handleAddAttack} style={{ marginTop: '1rem' }}>
            Сохранить
          </button>
        </div>
      )}

      <div className="attack-list" style={{ marginTop: '1rem' }}>
        {character.attacks.map((attack) => {
          const abilityMod = attack.ability ? Math.floor((character.stats[attack.ability] - 10) / 2) : 0;
          const profBonus = attack.proficient ? character.proficiencyBonus : 0;
          const totalBonus = attack.bonus + abilityMod + profBonus;

          return (
            <div key={attack.id} className="attack-card">
              <div className="attack-header">
                <span className="attack-name">{attack.name}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-small"
                    onClick={() => rollAttack(attack)}
                  >
                    Бросок атаки
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => deleteAttack(attack.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                Бонус атаки: <span style={{ color: '#4ecca3' }}>{totalBonus >= 0 ? '+' : ''}{totalBonus}</span>
                {' | '}
                Урон: {attack.damage.map(d => `${d.dice}+${d.modifier} ${d.type}`).join(', ')}
              </div>
              {attack.description && (
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#888' }}>
                  {attack.description}
                </div>
              )}
            </div>
          );
        })}
        {character.attacks.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center' }}>Нет добавленных атак</p>
        )}
      </div>
    </div>
  );
};

export default Attacks;
