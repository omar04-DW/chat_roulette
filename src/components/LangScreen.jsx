import { useGame } from '../contexts/GameContext';

export default function LangScreen() {
  const { setLang, setScreen } = useGame();
  const pick = (l) => { setLang(l); setScreen('rules'); };
  return (
    <div className="screen">
      <div className="laurel-top">🏛️</div>
      <h1 className="main-title">MYSTERIUM</h1>
      <p className="subtitle-glow">Choose your tongue • Choisis ta langue</p>
      <div className="card roman-card">
        <button className="btn btn-gold" onClick={() => pick('fr')}>
          <span className="btn-icon">🇫🇷</span> Français
        </button>
        <button className="btn btn-gold" onClick={() => pick('en')}>
          <span className="btn-icon">🇬🇧</span> English
        </button>
      </div>
      <div className="roman-ornament">⚔️</div>
    </div>
  );
}
