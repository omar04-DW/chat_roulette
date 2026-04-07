import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

export default function MenuScreen() {
  const { lang, setLang, setScreen } = useGame();
  const l = T[lang] || T.en;
  return (
    <div className="screen">
      <div className="laurel-top">🏛️</div>
      <h1 className="main-title">{l.title}</h1>
      <p className="subtitle-glow">{l.subtitle}</p>
      <div className="card roman-card">
        <button className="btn btn-gold" onClick={() => setScreen('create')}>{l.createRoom}</button>
        <button className="btn btn-silver" onClick={() => setScreen('join')}>{l.joinRoom}</button>
        <button className="btn btn-ghost" onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}>
          🌐 {l.changeLang}
        </button>
      </div>
      <div className="roman-ornament">⚔️</div>
    </div>
  );
}
