import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

export default function LobbyScreen() {
  const { lang, roomId, room, isHost, startGame } = useGame();
  const l = T[lang] || T.en;
  const [copied, setCopied] = useState(false);

  if (!room) return <div className="screen"><div className="spinner" /></div>;

  const players = room.players || [];
  const copy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="screen">
      <h1 className="main-title">🏟️ {l.title}</h1>
      <div className="card roman-card">
        <div className="room-code-display" onClick={copy}>{roomId}</div>
        <p className="copy-hint" onClick={copy}>{copied ? l.copied : l.copyCode}</p>
        <div className="player-count">{l.players}: {players.length}/13</div>
        <div className="player-grid">
          {players.map((p, i) => (
            <div key={p.uid} className="player-chip" style={{ animationDelay: `${i * 0.08}s` }}>
              {p.uid === room.host && <span className="crown">👑</span>}
              {p.name}
            </div>
          ))}
        </div>
        {isHost ? (
          <button className="btn btn-gold btn-lg" disabled={players.length < 3} onClick={startGame}>
            {players.length < 3 ? l.needMin : l.startGame}
          </button>
        ) : (
          <div className="waiting-msg">
            <div className="spinner" />
            <p>{l.waiting}</p>
          </div>
        )}
      </div>
    </div>
  );
}
