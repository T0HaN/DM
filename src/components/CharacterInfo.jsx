import { useGame } from '../context/GameContext';

const CharacterInfo = () => {
  const { character, updateCharacter } = useGame();

  return (
    <div className="card">
      <h2>Основная информация (Character Info)</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Имя персонажа</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => updateCharacter({ name: e.target.value })}
            placeholder="Введите имя"
          />
        </div>
        <div className="form-group">
          <label>Раса</label>
          <input
            type="text"
            value={character.race}
            onChange={(e) => updateCharacter({ race: e.target.value })}
            placeholder="Например: Человек, Эльф"
          />
        </div>
        <div className="form-group">
          <label>Класс</label>
          <input
            type="text"
            value={character.class}
            onChange={(e) => updateCharacter({ class: e.target.value })}
            placeholder="Например: Воин, Волшебник"
          />
        </div>
        <div className="form-group">
          <label>Уровень</label>
          <input
            type="number"
            min="1"
            max="20"
            value={character.level}
            onChange={(e) => {
              const level = parseInt(e.target.value) || 1;
              let proficiencyBonus = 2;
              if (level >= 5) proficiencyBonus = 3;
              if (level >= 9) proficiencyBonus = 4;
              if (level >= 13) proficiencyBonus = 5;
              if (level >= 17) proficiencyBonus = 6;
              updateCharacter({ level, proficiencyBonus });
            }}
          />
        </div>
        <div className="form-group">
          <label>Бонус мастерства</label>
          <input
            type="number"
            value={character.proficiencyBonus}
            onChange={(e) => updateCharacter({ proficiencyBonus: parseInt(e.target.value) || 2 })}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterInfo;
