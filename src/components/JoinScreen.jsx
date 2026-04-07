import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

export default function JoinScreen() {
  const { lang, setScreen, joinRoom, setError } = useGame();
  const l = T[lang] || T.en;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim() || loading) return;
    setLoading(true);
    await joinRoom(code.trim(), name.trim());
    setLoading(false);
  };

  return (
    <div className="screen">
      <h1 className="main-title">{l.joinRoom}</h1>
      <div className="card roman-card">
        <label className="field-label">{l.roomCode}</label>
        <input className="field-input code-input" value={code}
          onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABC12" maxLength={5} />
        <label className="field-label">{l.yourName}</label>
        <input className="field-input" value={name} onChange={e => setName(e.target.value)}
          placeholder={l.yourName} maxLength={16} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setScreen('menu')}>{l.back}</button>
          <button className="btn btn-silver" disabled={!code.trim() || !name.trim() || loading} onClick={handleJoin}>
            {loading ? '...' : l.join}
          </button>
        </div>
      </div>
    </div>
  );
}
