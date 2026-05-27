import { useState } from 'react';
import { useGame } from '../context/GameContext';

const Chat = () => {
  const { character, currentRoom, chatMessages, isConnected, joinRoom, leaveRoom, sendMessage, rollDice } = useGame();
  const [roomInput, setRoomInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const handleJoinRoom = () => {
    if (roomInput.trim()) {
      joinRoom(roomInput.trim());
      setRoomInput('');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && currentRoom) {
      sendMessage({
        type: 'message',
        text: messageInput.trim(),
        timestamp: new Date().toISOString()
      });
      setMessageInput('');
    }
  };

  const handleRoll = (diceNotation) => {
    const [count, sides] = diceNotation.split('d').map(Number);
    rollDice([{ count, sides }], 0, `Бросок ${diceNotation}`);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="card">
      <h2>Чат и Броски кубов</h2>
      
      {!currentRoom ? (
        <div className="room-selector">
          <div className="form-row" style={{ alignItems: 'end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Название комнаты</label>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Введите название комнаты для подключения"
              />
            </div>
            <button className="btn" onClick={handleJoinRoom}>
              Войти в комнату
            </button>
          </div>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>
            Все игроки в одной комнате будут видеть броски друг друга
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ color: '#4ecca3' }}>
              Комната: <strong>{currentRoom}</strong>
              {isConnected && (
                <span style={{ marginLeft: '0.5rem', color: '#4ecca3' }}>● Подключено</span>
              )}
              {!isConnected && (
                <span style={{ marginLeft: '0.5rem', color: '#e94560' }}>○ Отключено</span>
              )}
            </div>
            <button className="btn btn-secondary btn-small" onClick={leaveRoom}>
              Выйти из комнаты
            </button>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
                  Сообщений пока нет. Будьте первым!
                </p>
              )}
              {chatMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <div className="message-header">
                    <span>{msg.characterName || 'Аноним'}</span>
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>
                  
                  {msg.type === 'message' && (
                    <div>{msg.text}</div>
                  )}
                  
                  {msg.type === 'roll' && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#e94560' }}>{msg.label}</div>
                      <div className="roll-result">
                        Итого: {msg.finalTotal}
                      </div>
                      <div className="roll-details">
                        {msg.dice.map((d, i) => (
                          <span key={i}>
                            {d.dice}: [{d.rolls.join(', ')}] = {d.total}
                            {i < msg.dice.length - 1 ? ' + ' : ''}
                          </span>
                        ))}
                        {msg.modifier !== 0 && (
                          <span> {msg.modifier >= 0 ? '+' : ''}{msg.modifier} (модификатор)</span>
                        )}
                      </div>
                    </>
                  )}
                  
                  {msg.type === 'damage' && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#e94560' }}>{msg.label}</div>
                      <div className="roll-result">
                        Урон: {msg.total}
                      </div>
                      <div className="roll-details">
                        Броски: [{msg.rolls.join(', ')}]
                        {msg.modifier !== 0 && (
                          <span> {msg.modifier >= 0 ? '+' : ''}{msg.modifier} (модификатор)</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Введите сообщение..."
                />
                <button type="submit" className="btn">
                  Отправить
                </button>
              </form>
              
              <div className="dice-roller">
                <button className="dice-btn" onClick={() => handleRoll('1d4')}>d4</button>
                <button className="dice-btn" onClick={() => handleRoll('1d6')}>d6</button>
                <button className="dice-btn" onClick={() => handleRoll('1d8')}>d8</button>
                <button className="dice-btn" onClick={() => handleRoll('1d10')}>d10</button>
                <button className="dice-btn" onClick={() => handleRoll('1d12')}>d12</button>
                <button className="dice-btn" onClick={() => handleRoll('1d20')}>d20</button>
                <button className="dice-btn" onClick={() => handleRoll('1d100')}>d100</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
