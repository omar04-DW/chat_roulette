import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

export default function RulesModal() {
  const { lang, screen } = useGame();
  const [open, setOpen] = useState(false);
  const l = T[lang] || T.en;

  // Don't show on lang/rules screens
  if (!lang || screen === 'lang' || screen === 'rules') return null;

  const rules = [
    { icon: '✍️', title: l.rule1title, text: l.rule1 },
    { icon: '🎰', title: l.rule2title, text: l.rule2 },
    { icon: '⚖️', title: l.rule3title, text: l.rule3 },
    { icon: '🗡️', title: l.rule4title, text: l.rule4 },
    { icon: '🔄', title: l.rule5title, text: l.rule5 },
  ];

  return (
    <>
      <button className="rules-fab" onClick={() => setOpen(true)} title={l.howToPlay}>
        ?
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            <h2 className="modal-title">{l.rulesTitle}</h2>
            <div className="modal-rules">
              {rules.map((r, i) => (
                <div key={i} className="modal-rule">
                  <span className="modal-rule-icon">{r.icon}</span>
                  <div>
                    <strong>{r.title}</strong>
                    <p>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="rule-note" style={{ marginTop: 16 }}>{l.ruleNote}</p>
          </div>
        </div>
      )}
    </>
  );
}
