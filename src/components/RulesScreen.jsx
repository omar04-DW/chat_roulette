import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

export default function RulesScreen() {
  const { lang, setScreen } = useGame();
  const l = T[lang] || T.en;
  const rules = [
    { icon: '✍️', title: l.rule1title, text: l.rule1 },
    { icon: '🎰', title: l.rule2title, text: l.rule2 },
    { icon: '⚖️', title: l.rule3title, text: l.rule3 },
    { icon: '🗡️', title: l.rule4title, text: l.rule4 },
    { icon: '🔄', title: l.rule5title, text: l.rule5 },
  ];

  return (
    <div className="screen">
      <div className="laurel-top">📜</div>
      <h1 className="main-title">{l.rulesTitle}</h1>
      <p className="subtitle-glow">{l.rulesSubtitle}</p>
      <div className="rules-container">
        {rules.map((r, i) => (
          <div key={i} className="rule-card" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="rule-icon">{r.icon}</div>
            <div className="rule-content">
              <h3 className="rule-title">{r.title}</h3>
              <p className="rule-text">{r.text}</p>
            </div>
          </div>
        ))}
        <p className="rule-note">{l.ruleNote}</p>
      </div>
      <button className="btn btn-gold btn-lg" onClick={() => setScreen('menu')}>
        {l.letsPlay}
      </button>
    </div>
  );
}
