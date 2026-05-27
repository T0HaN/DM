import { useState } from 'react';
import CharacterInfo from './components/CharacterInfo';
import CoreStats from './components/CoreStats';
import Attacks from './components/Attacks';
import Inventory from './components/Inventory';
import Features from './components/Features';
import Chat from './components/Chat';

function App() {
  const [activeTab, setActiveTab] = useState('character');

  return (
    <div className="app-container">
      <nav>
        <h1>🎲 D&D Companion</h1>
        <a 
          href="#" 
          className={activeTab === 'character' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); setActiveTab('character'); }}
        >
          Лист персонажа
        </a>
        <a 
          href="#" 
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); setActiveTab('chat'); }}
        >
          Чат и Броски
        </a>
      </nav>

      <main>
        {activeTab === 'character' && (
          <>
            <CharacterInfo />
            <CoreStats />
            <Attacks />
            <Inventory />
            <Features />
          </>
        )}
        
        {activeTab === 'chat' && (
          <Chat />
        )}
      </main>
    </div>
  );
}

export default App;
