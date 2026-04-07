import { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { T } from '../utils/i18n';

function getName(players, uid) {
  return players?.find(p => p.uid === uid)?.name || '???';
}

/* ========================================
   EXISTING PHASES (unchanged)
   ======================================== */

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

/* ========================================
   NEW: GAGE PHASES
   ======================================== */

function GageVotePhase() {
  const { lang, uid, room, submitGageVote } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const votes = room?.gageVotes || {};
  const isPunished = uid === room?.target;
  const hasVoted = !!votes[uid];
  const [timer, setTimer] = useState(10);

  // Countdown timer synced to gageTimerStart
  useEffect(() => {
    if (!room?.gageTimerStart) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - room.gageTimerStart) / 1000);
      const remaining = Math.max(0, 10 - elapsed);
      setTimer(remaining);
    }, 200);
    return () => clearInterval(interval);
  }, [room?.gageTimerStart]);

  // Count votes per category
  const counts = { PHYSIQUE: 0, BOISSON: 0, GENANT: 0 };
  Object.values(votes).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
  const totalVotes = Object.values(votes).length;
  const totalEligible = players.filter(p => p.uid !== room?.target).length;

  const categories = [
    { key: 'PHYSIQUE', label: l.gagePhysique, icon: '💪', color: '#b8860b' },
    { key: 'BOISSON', label: l.gageBoisson, icon: '🍺', color: '#8b0000' },
    { key: 'GENANT', label: l.gageGenant, icon: '😳', color: '#7b2d8b' },
  ];

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">❌</div>
      <h2 style={{ color: '#c0392b' }}>{l.wrong}</h2>
      <p style={{ fontSize: '1rem' }}>
        <strong>{getName(players, room?.target)}</strong> {l.wrongAccusation}
      </p>

      <h3 style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', marginTop: 8 }}>
        {l.gageVoteTitle}
      </h3>
      <p className="hint-text">{l.gageVoteSubtitle} <strong>{getName(players, room?.target)}</strong></p>

      {/* Timer bar */}
      <div style={{
        width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 4,
        height: 8, overflow: 'hidden', margin: '4px 0'
      }}>
        <div style={{
          width: `${(timer / 10) * 100}%`, height: '100%',
          background: timer <= 3 ? '#c0392b' : 'var(--gold)',
          transition: 'width 0.3s, background 0.3s', borderRadius: 4,
        }} />
      </div>
      <p className="muted">{l.voteTimer}: {timer}s — {totalVotes}/{totalEligible} {l.votesCount}</p>

      {isPunished ? (
        <div style={{
          padding: '20px', background: 'rgba(192,57,43,0.08)',
          border: '1px solid rgba(192,57,43,0.3)', borderRadius: 4, width: '100%', textAlign: 'center'
        }}>
          <p style={{ fontSize: '2rem' }}>😰</p>
          <p>{l.youCantVote}</p>
        </div>
      ) : hasVoted ? (
        <div style={{
          padding: '20px', background: 'rgba(45,125,70,0.08)',
          border: '1px solid rgba(45,125,70,0.3)', borderRadius: 4, width: '100%', textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.5rem' }}>✅</p>
          <p>{l.waitingVotes}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => submitGageVote(cat.key)}
              style={{
                flex: '1 1 120px', maxWidth: 160, padding: '18px 12px',
                background: `linear-gradient(135deg, ${cat.color}40, ${cat.color}20)`,
                border: `2px solid ${cat.color}60`, borderRadius: 8,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 8,
                fontFamily: "'Cinzel', serif", color: 'var(--text)',
                fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = `0 0 25px ${cat.color}40`; }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Live vote display */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
        {categories.map(cat => (
          <div key={cat.key} style={{ textAlign: 'center', opacity: counts[cat.key] > 0 ? 1 : 0.4 }}>
            <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
            <p style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: "'Cinzel', serif" }}>{counts[cat.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GageWheelPhase() {
  const { lang, room, isHost, showGageResult } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];
  const [angle, setAngle] = useState(0);
  const [done, setDone] = useState(false);

  const categoryLabels = {
    PHYSIQUE: { label: l.gagePhysique, icon: '💪', color: '#b8860b' },
    BOISSON: { label: l.gageBoisson, icon: '🍺', color: '#8b0000' },
    GENANT: { label: l.gageGenant, icon: '😳', color: '#7b2d8b' },
  };
  const cat = categoryLabels[room?.gageCategory] || categoryLabels.PHYSIQUE;

  // Auto-spin on mount
  useEffect(() => {
    const spins = 3 + Math.random() * 3;
    const target = spins * 360 + Math.random() * 360;
    setAngle(target);
    const timer = setTimeout(() => {
      setDone(true);
      if (isHost) showGageResult();
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="phase-card fade-up">
      <div className="phase-icon">🎰</div>
      <h2>{l.gageWheelTitle}</h2>
      <p className="muted">{l.gageCategory}: <strong style={{ color: cat.color }}>{cat.icon} {cat.label}</strong></p>
      <p className="hint-text">{getName(players, room?.target)}</p>

      {/* Simple spinning animation */}
      <div style={{
        width: 180, height: 180, margin: '12px auto', position: 'relative',
        borderRadius: '50%', border: `4px solid ${cat.color}`,
        background: `conic-gradient(${cat.color}30, ${cat.color}10, ${cat.color}30, ${cat.color}10)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `rotate(${angle}deg)`,
        transition: 'transform 3s cubic-bezier(0.08,0.82,0.1,1)',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--bg-card)', border: `2px solid ${cat.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', transform: `rotate(-${angle}deg)`,
          transition: 'transform 3s cubic-bezier(0.08,0.82,0.1,1)',
        }}>
          {done ? '🎯' : cat.icon}
        </div>
      </div>

      {!done && <div className="spinner" />}
    </div>
  );
}

function GageResultPhase() {
  const { lang, room, isHost, nextRound } = useGame();
  const l = T[lang] || T.en;
  const players = room?.players || [];

  const categoryLabels = {
    PHYSIQUE: { label: l.gagePhysique, icon: '💪', color: '#b8860b' },
    BOISSON: { label: l.gageBoisson, icon: '🍺', color: '#8b0000' },
    GENANT: { label: l.gageGenant, icon: '😳', color: '#7b2d8b' },
  };
  const cat = categoryLabels[room?.gageCategory] || categoryLabels.PHYSIQUE;
  const gageText = l[room?.gageResult] || room?.gageResult || '???';

  return (
    <div className="phase-card fade-up">
      <div style={{ fontSize: 64 }}>⚡</div>
      <h2 style={{ color: cat.color }}>{l.gageResultTitle}</h2>

      <div style={{
        padding: '12px 20px', background: `${cat.color}15`,
        border: `1px solid ${cat.color}40`, borderRadius: 4,
        fontFamily: "'Cinzel', serif", fontSize: '0.85rem',
        color: cat.color, fontWeight: 700, letterSpacing: '0.1em',
      }}>
        {cat.icon} {cat.label}
      </div>

      <div style={{
        width: '100%', padding: 24,
        background: 'linear-gradient(135deg, rgba(212,168,68,0.08), rgba(139,26,26,0.06))',
        border: '2px solid var(--border-glow)', borderRadius: 8,
        textAlign: 'center',
      }}>
        <p className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>
          {l.yourDare}
        </p>
        <p style={{
          fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold-light)',
          fontFamily: "'Cinzel', serif", lineHeight: 1.4,
        }}>
          {gageText}
        </p>
      </div>

      <p style={{ fontSize: '1rem' }}>
        🎯 <strong>{getName(players, room?.target)}</strong>
      </p>

      {isHost ? (
        <button className="btn btn-gold btn-lg pulse-anim" onClick={nextRound}>
          {l.gageContinue}
        </button>
      ) : (
        <div className="waiting-msg"><div className="spinner" /><p>{l.waiting}</p></div>
      )}
    </div>
  );
}

/* ========================================
   MAIN GAME SCREEN
   ======================================== */

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
      {p === 'answering' && <AnsweringPhase />}
      {p === 'roundEnd' && <RoundEndPhase />}
      {/* NEW GAGE PHASES */}
      {p === 'gageVote' && <GageVotePhase />}
      {p === 'gageWheel' && <GageWheelPhase />}
      {p === 'gageResult' && <GageResultPhase />}
    </div>
  );
}
