import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

export default function CreateScreen() {
  const { lang, setScreen, createRoom } = useGame();
  const l = T[lang] || T.en;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    await createRoom(name.trim());
    setLoading(false);
  };

  return (
    <div className="screen">
      <h1 className="main-title">{l.createRoom}</h1>
      <div className="card roman-card">
        <label className="field-label">{l.yourName}</label>
        <input className="field-input" value={name} onChange={e => setName(e.target.value)}
          placeholder={l.yourName} maxLength={16} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setScreen('menu')}>{l.back}</button>
          <button className="btn btn-gold" disabled={!name.trim() || loading} onClick={handleCreate}>
            {loading ? '...' : l.create}
          </button>
        </div>
      </div>
    </div>
  );
}
