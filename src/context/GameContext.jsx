import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

const calculateModifier = (score) => Math.floor((score - 10) / 2);

const defaultCharacter = {
  name: '',
  race: '',
  class: '',
  level: 1,
  proficiencyBonus: 2,
  stats: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10
  },
  savingThrows: {
    str: false,
    dex: false,
    con: false,
    int: false,
    wis: false,
    cha: false
  },
  skills: [
    { name: 'Acrobatics', ability: 'dex', proficient: false, bonus: 0 },
    { name: 'Animal Handling', ability: 'wis', proficient: false, bonus: 0 },
    { name: 'Arcana', ability: 'int', proficient: false, bonus: 0 },
    { name: 'Athletics', ability: 'str', proficient: false, bonus: 0 },
    { name: 'Deception', ability: 'cha', proficient: false, bonus: 0 },
    { name: 'History', ability: 'int', proficient: false, bonus: 0 },
    { name: 'Insight', ability: 'wis', proficient: false, bonus: 0 },
    { name: 'Intimidation', ability: 'cha', proficient: false, bonus: 0 },
    { name: 'Investigation', ability: 'int', proficient: false, bonus: 0 },
    { name: 'Medicine', ability: 'wis', proficient: false, bonus: 0 },
    { name: 'Nature', ability: 'int', proficient: false, bonus: 0 },
    { name: 'Perception', ability: 'wis', proficient: false, bonus: 0 },
    { name: 'Performance', ability: 'cha', proficient: false, bonus: 0 },
    { name: 'Persuasion', ability: 'cha', proficient: false, bonus: 0 },
    { name: 'Religion', ability: 'int', proficient: false, bonus: 0 },
    { name: 'Sleight of Hand', ability: 'dex', proficient: false, bonus: 0 },
    { name: 'Stealth', ability: 'dex', proficient: false, bonus: 0 },
    { name: 'Survival', ability: 'wis', proficient: false, bonus: 0 }
  ],
  attacks: [],
  spells: [],
  inventory: [],
  features: []
};

export const GameProvider = ({ children }) => {
  const [character, setCharacter] = useState(() => {
    const saved = localStorage.getItem('dnd_character');
    return saved ? JSON.parse(saved) : defaultCharacter;
  });
  
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    localStorage.setItem('dnd_character', JSON.stringify(character));
  }, [character]);

  useEffect(() => {
    const storedRoom = localStorage.getItem('dnd_room');
    if (storedRoom) {
      setCurrentRoom(storedRoom);
    }
  }, []);

  useEffect(() => {
    if (currentRoom) {
      const newSocket = io('http://localhost:3001', {
        query: { room: currentRoom }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      newSocket.on('chat_message', (message) => {
        setChatMessages(prev => [...prev, message]);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [currentRoom]);

  const joinRoom = (roomName) => {
    if (socket) {
      socket.close();
    }
    setCurrentRoom(roomName);
    localStorage.setItem('dnd_room', roomName);
    setChatMessages([]);
  };

  const leaveRoom = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
    setCurrentRoom('');
    localStorage.removeItem('dnd_room');
    setChatMessages([]);
  };

  const sendMessage = (message) => {
    if (socket && currentRoom) {
      socket.emit('chat_message', {
        room: currentRoom,
        characterName: character.name || 'Anonymous',
        ...message
      });
    }
  };

  const rollDice = (dice, modifier = 0, label = '') => {
    const results = dice.map(d => {
      const [count, sides] = d.split('d').map(Number);
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
      return {
        dice: `${count}d${sides}`,
        rolls,
        total: rolls.reduce((a, b) => a + b, 0)
      };
    });

    const totalRoll = results.reduce((sum, r) => sum + r.total, 0);
    const finalTotal = totalRoll + modifier;

    const message = {
      type: 'roll',
      label,
      dice: results,
      modifier,
      totalRoll,
      finalTotal,
      timestamp: new Date().toISOString()
    };

    sendMessage(message);
    return message;
  };

  const rollSkill = (skillName, customBonus = 0) => {
    const skill = character.skills.find(s => s.name === skillName);
    if (!skill) return null;

    const abilityScore = character.stats[skill.ability];
    const abilityMod = calculateModifier(abilityScore);
    const profBonus = skill.proficient ? character.proficiencyBonus : 0;
    const totalMod = abilityMod + profBonus + skill.bonus + customBonus;

    return rollDice([{ count: 1, sides: 20 }], totalMod, `Skill Check: ${skillName}`);
  };

  const rollSavingThrow = (ability, customBonus = 0) => {
    const abilityNames = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
    const abilityScore = character.stats[ability];
    const abilityMod = calculateModifier(abilityScore);
    const profBonus = character.savingThrows[ability] ? character.proficiencyBonus : 0;
    const totalMod = abilityMod + profBonus + customBonus;

    return rollDice([{ count: 1, sides: 20 }], totalMod, `${abilityNames[ability]} Saving Throw`);
  };

  const rollAttack = (attack, customBonus = 0) => {
    const abilityMod = attack.ability ? calculateModifier(character.stats[attack.ability]) : 0;
    const profBonus = attack.proficient ? character.proficiencyBonus : 0;
    const totalMod = attack.bonus + abilityMod + profBonus + customBonus;

    const rollMessage = rollDice([{ count: 1, sides: 20 }], totalMod, `Attack: ${attack.name}`);

    if (attack.damage && rollMessage) {
      attack.damage.forEach(dmg => {
        const [count, sides] = dmg.dice.split('d').map(Number);
        const damageMod = dmg.modifier || 0;
        const damageRoll = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
        const damageTotal = damageRoll.reduce((a, b) => a + b, 0) + damageMod;

        sendMessage({
          type: 'damage',
          label: `${attack.name} Damage (${dmg.type})`,
          rolls: damageRoll,
          modifier: damageMod,
          total: damageTotal,
          timestamp: new Date().toISOString()
        });
      });
    }

    return rollMessage;
  };

  const updateCharacter = (updates) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  const updateStat = (stat, value) => {
    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: parseInt(value) || 10 }
    }));
  };

  const toggleSavingThrow = (stat) => {
    setCharacter(prev => ({
      ...prev,
      savingThrows: { ...prev.savingThrows, [stat]: !prev.savingThrows[stat] }
    }));
  };

  const updateSkill = (skillName, updates) => {
    setCharacter(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.name === skillName ? { ...skill, ...updates } : skill
      )
    }));
  };

  const addAttack = (attack) => {
    setCharacter(prev => ({
      ...prev,
      attacks: [...prev.attacks, { id: Date.now(), ...attack }]
    }));
  };

  const updateAttack = (id, updates) => {
    setCharacter(prev => ({
      ...prev,
      attacks: prev.attacks.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAttack = (id) => {
    setCharacter(prev => ({
      ...prev,
      attacks: prev.attacks.filter(a => a.id !== id)
    }));
  };

  const addInventoryItem = (item) => {
    setCharacter(prev => ({
      ...prev,
      inventory: [...prev.inventory, { id: Date.now(), ...item }]
    }));
  };

  const updateInventoryItem = (id, updates) => {
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const deleteInventoryItem = (id) => {
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== id)
    }));
  };

  const addFeature = (feature) => {
    setCharacter(prev => ({
      ...prev,
      features: [...prev.features, { id: Date.now(), ...feature }]
    }));
  };

  const updateFeature = (id, updates) => {
    setCharacter(prev => ({
      ...prev,
      features: prev.features.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const deleteFeature = (id) => {
    setCharacter(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };

  const restoreFeatures = () => {
    setCharacter(prev => ({
      ...prev,
      features: prev.features.map(f => ({
        ...f,
        usesCurrent: f.usesMax
      }))
    }));
  };

  const value = {
    character,
    socket,
    currentRoom,
    chatMessages,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    rollDice,
    rollSkill,
    rollSavingThrow,
    rollAttack,
    updateCharacter,
    updateStat,
    toggleSavingThrow,
    updateSkill,
    addAttack,
    updateAttack,
    deleteAttack,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addFeature,
    updateFeature,
    deleteFeature,
    restoreFeatures
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
