import { useGame } from '../context/GameContext';

const calculateModifier = (score) => Math.floor((score - 10) / 2);

const statNames = {
  str: 'Сила',
  dex: 'Ловкость',
  con: 'Телосложение',
  int: 'Интеллект',
  wis: 'Мудрость',
  cha: 'Харизма'
};

const CoreStats = () => {
  const { character, updateStat, toggleSavingThrow, updateSkill, rollSavingThrow } = useGame();

  return (
    <div className="card">
      <h2>Характеристики и Навыки (Core Stats & Skills)</h2>
      
      <div className="form-row" style={{ marginBottom: '2rem' }}>
        {Object.entries(character.stats).map(([key, value]) => (
          <div key={key} className="stat-box">
            <div className="stat-name">{statNames[key]}</div>
            <div className="stat-value">
              <input
                type="number"
                value={value}
                onChange={(e) => updateStat(key, e.target.value)}
                style={{
                  width: '60px',
                  textAlign: 'center',
                  background: 'transparent',
                  border: '1px solid #0f3460',
                  borderRadius: '4px',
                  color: '#e94560',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              />
            </div>
            <div className="stat-mod">
              {calculateModifier(value) >= 0 ? '+' : ''}{calculateModifier(value)}
            </div>
            <label className="checkbox-label" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              <input
                type="checkbox"
                checked={character.savingThrows[key]}
                onChange={() => toggleSavingThrow(key)}
              />
              Спасбросок
            </label>
            <button
              className="btn btn-small btn-secondary"
              style={{ marginTop: '0.5rem', width: '100%' }}
              onClick={() => rollSavingThrow(key)}
            >
              Бросок
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ color: '#4ecca3', marginBottom: '1rem' }}>Навыки</h3>
      <ul className="skills-list">
        {character.skills.map((skill) => {
          const abilityMod = calculateModifier(character.stats[skill.ability]);
          const profBonus = skill.proficient ? character.proficiencyBonus : 0;
          const totalMod = abilityMod + profBonus + skill.bonus;

          return (
            <li key={skill.name}>
              <div className="skill-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={skill.proficient}
                    onChange={(e) => updateSkill(skill.name, { proficient: e.target.checked })}
                  />
                  <span>{skill.name} ({statNames[skill.ability]})</span>
                </label>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                  {abilityMod >= 0 ? '+' : ''}{abilityMod}
                  {skill.proficient && ` + ${character.proficiencyBonus}`}
                  {skill.bonus !== 0 && ` + ${skill.bonus}`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  className="modifier-input"
                  placeholder="Бонус"
                  value={skill.bonus || ''}
                  onChange={(e) => updateSkill(skill.name, { bonus: parseInt(e.target.value) || 0 })}
                />
                <span style={{ fontWeight: 'bold', color: '#4ecca3', minWidth: '40px' }}>
                  {totalMod >= 0 ? '+' : ''}{totalMod}
                </span>
                <button
                  className="btn btn-small"
                  onClick={() => {
                    const result = rollSkill(skill.name);
                    console.log(result);
                  }}
                >
                  Бросок
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CoreStats;
