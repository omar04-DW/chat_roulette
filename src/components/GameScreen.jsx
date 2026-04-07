import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

function getName(players, uid) {
  return players?.find(p => p.uid === uid)?.name || '???';
}

function RouletteWheel({ players, onFinish, spinning }) {
  const [angle, setAngle] = useState(0);
  const [done, setDone] = useState(false);
  const n = players.length;
  const colors = ['#b8860b','#8b0000','#1a1a5e','#6b3a2a','#2d5016','#7b2d8b','#0a4a6b','#8b6914','#4a0e2e','#0e4a3a','#5c1a1a','#1a3a5c','#6b1a6b'];

  useEffect(() => {
    if (spinning && !done) {
      const spins = 4 + Math.random() * 4;
      const target = spins * 360 + Math.random() * 360;
      setAngle(target);
      setTimeout(() => { setDone(true); onFinish(); }, 3800);
    }
  }, [spinning]);

  return (
    <div className="wheel-wrapper">
      <div className="wheel-pointer-roman">▼</div>
      <svg viewBox="0 0 200 200" className="wheel-svg"
        style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.08,0.82,0.1,1)' : 'none' }}>
        {/* Outer ring */}
        <circle cx="100" cy="100" r="98" fill="none" stroke="url(#goldGrad)" strokeWidth="4"/>
        {players.map((p, i) => {
          const a1 = (i / n) * 360, a2 = ((i + 1) / n) * 360;
          const mid = ((a1 + a2) / 2) * Math.PI / 180;
          const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
          const large = a2 - a1 > 180 ? 1 : 0;
          const x1 = 100 + 90 * Math.cos(r1), y1 = 100 + 90 * Math.sin(r1);
          const x2 = 100 + 90 * Math.cos(r2), y2 = 100 + 90 * Math.sin(r2);
          const tx = 100 + 58 * Math.cos(mid), ty = 100 + 58 * Math.sin(mid);
          return (
            <g key={p.uid}>
              <path d={`M100,100 L${x1},${y1} A90,90 0 ${large},1 ${x2},${y2} Z`}
                fill={colors[i % colors.length]} stroke="#d4a84420" strokeWidth="1"/>
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                fill="#f0e6c8" fontSize={n > 8 ? '6.5' : '8.5'} fontWeight="700"
                fontFamily="serif"
                transform={`rotate(${(a1 + a2) / 2}, ${tx}, ${ty})`}>
                {p.name.slice(0, 8)}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="goldGrad"><stop offset="0%" stopColor="#d4a844"/><stop offset="100%" stopColor="#8b6914"/></linearGradient>
        </defs>
        <circle cx="100" cy="100" r="18" fill="#0a0a1a" stroke="#d4a844" strokeWidth="2"/>
        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="#d4a844" fontSize="14" fontFamily="serif" fontWeight="700">⚔</text>
      </svg>
    </div>
  );
}

function WritingPhase() {
  const { lang, uid, room, submitQuestion } = useGame();
  const l = T[lang] || T.en;
  const [q, setQ] = useState('');
  const [sent, setSent] = useState(false);
  const already = room?.questions?.some(x => x.uid === uid);

  const handleSubmit = () => {
    if (!q.trim()) return;
    submitQuestion(q.trim());
    setSent(true);
  };

  if (already || sent) {
    return (
      <div className="phase-card fade-up">
        <div className="phase-icon">✅</div>
        <h2>{l.submit}</h2>
        <p className="muted">{l.waiting} ({room?.questions?.length || 0}/{room?.players?.length || 0})</p>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="phase-card fade-up">
      <div className="round-badge">{l.roundNum} {room?.round}</div>
      <div className="phase-icon">✍️</div>
      <h2>{l.writeQuestion}</h2>
      <p className="hint-text">{l.questionAnon}</p>
      <textarea className="field-textarea" value={q} onChange={e => setQ(e.target.value)}
        placeholder={l.writeQuestion} rows={3} />
      <button className="btn btn-gold" disabled={!q.trim()} onClick={handleSubmit}>{l.submit}</button>
    </div>
  );
}

function ShowQuestionPhase() {
  const { lang, room, isMC, spinWheel } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => { setSpinning(true); };
  const onFinish = () => { spinWheel(); };

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">📜</div>
      <h2>{l.questionIs}</h2>
      <div className="question-display">{room?.selectedQuestion}</div>
      <div className="mc-badge">🎤 {l.mcIs} <strong>{getName(players, room?.mc)}</strong></div>
      {isMC ? (
        <>
          <p className="highlight-text">{l.youAreMC}</p>
          <RouletteWheel players={players.filter(p => p.uid !== room?.mc)} onFinish={onFinish} spinning={spinning} />
          {!spinning && (
            <button className="btn btn-gold btn-lg pulse-anim" onClick={handleSpin}>{l.spin}</button>
          )}
        </>
      ) : (
        <div className="waiting-msg"><div className="spinner" /><p>{l.waitingMC}</p></div>
      )}
    </div>
  );
}

function TargetSelectedPhase() {
  const { lang, room, isTarget, chooseAnswer, chooseAccuse, me } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const canAccuse = me?.accusationsLeft > 0;

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">🎯</div>
      <h2>{getName(players, room?.target)} {l.targetIs}</h2>
      <div className="question-display">{room?.selectedQuestion}</div>
      {isTarget ? (
        <>
          <p className="highlight-text glow-text">{l.youAreTarget}</p>
          <p className="hint-text">🗡️ {me?.accusationsLeft} {l.accusationsLeft}</p>
          <div className="btn-row">
            <button className="btn btn-gold" onClick={chooseAnswer}>{l.answer}</button>
            <button className="btn btn-danger" disabled={!canAccuse} onClick={chooseAccuse}>{l.accuse}</button>
          </div>
          {!canAccuse && <p className="muted">{l.noAccusation}</p>}
        </>
      ) : (
        <div className="waiting-msg"><div className="spinner" /><p>{l.waitingChoice}</p></div>
      )}
    </div>
  );
}

function AccusingPhase() {
  const { lang, room, isTarget, uid, submitAccusation } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const candidates = players.filter(p => p.uid !== uid && p.uid !== room?.mc);

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">🕵️</div>
      <h2>{l.whoWrote}</h2>
      <div className="question-display">{room?.selectedQuestion}</div>
      {isTarget ? (
        <div className="player-grid">
          {candidates.map((p, i) => (
            <button key={p.uid} className="player-chip-btn"
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => submitAccusation(p.uid)}>
              {p.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="waiting-msg"><div className="spinner" /><p>{l.waitingChoice}</p></div>
      )}
    </div>
  );
}

function AccusationResultPhase() {
  const { lang, room } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const ok = room?.accusationCorrect;

  return (
    <div className="phase-card fade-up">
      <div className="result-icon-big">{ok ? '⚔️' : '💀'}</div>
      <h2 className={ok ? 'text-gold' : 'text-danger'}>{ok ? l.correct : l.wrong}</h2>
      <div className={`result-box ${ok ? 'result-correct' : 'result-wrong'}`}>
        <p><strong>{getName(players, room?.target)}</strong> → {getName(players, room?.accusedUid)}</p>
        <p style={{ marginTop: 8, fontWeight: 700 }}>
          {ok ? `${getName(players, room?.target)} ${l.doesntAnswer}` : `${getName(players, room?.target)} ${l.mustAnswer}`}
        </p>
      </div>
    </div>
  );
}

function AnsweringPhase() {
  const { lang, room, isTarget, submitAnswer } = useGame();
  const l = T[lang] || T.en;
  const [ans, setAns] = useState('');

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">💬</div>
      <h2>{l.answer}</h2>
      <div className="question-display">{room?.selectedQuestion}</div>
      {isTarget ? (
        <>
          <textarea className="field-textarea" value={ans} onChange={e => setAns(e.target.value)}
            placeholder={l.typeAnswer} rows={3} />
          <button className="btn btn-gold" disabled={!ans.trim()} onClick={() => submitAnswer(ans.trim())}>{l.submitAnswer}</button>
        </>
      ) : (
        <div className="waiting-msg"><div className="spinner" /><p>{l.waitingAnswer}</p></div>
      )}
    </div>
  );
}

function RoundEndPhase() {
  const { lang, room, isHost, nextRound } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const wasCorrect = room?.accusationCorrect === true;

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">🏆</div>
      <h2>{l.roundNum} {room?.round} — {l.result}</h2>
      <div className="question-display">{room?.selectedQuestion}</div>
      {wasCorrect ? (
        <div className="result-box result-correct">
          <p>⚔️ <strong>{getName(players, room?.target)}</strong> {l.doesntAnswer}</p>
        </div>
      ) : room?.answer ? (
        <div className="answer-display">
          <p><strong>{getName(players, room?.target)}</strong> {l.answered}</p>
          <blockquote>{room.answer}</blockquote>
        </div>
      ) : null}
      {isHost ? (
        <button className="btn btn-gold btn-lg pulse-anim" onClick={nextRound}>{l.nextRound}</button>
      ) : (
        <div className="waiting-msg"><div className="spinner" /><p>{l.waiting}</p></div>
      )}
    </div>
  );
}

export default function GameScreen() {
  const { room } = useGame();
  if (!room) return <div className="screen"><div className="spinner" /></div>;
  const p = room.phase;
  return (
    <div className="screen">
      {p === 'writing' && <WritingPhase />}
      {p === 'showQuestion' && <ShowQuestionPhase />}
      {p === 'targetSelected' && <TargetSelectedPhase />}
      {p === 'accusing' && <AccusingPhase />}
      {p === 'accusationResult' && <AccusationResultPhase />}
      {p === 'answering' && <AnsweringPhase />}
      {p === 'roundEnd' && <RoundEndPhase />}
    </div>
  );
}
