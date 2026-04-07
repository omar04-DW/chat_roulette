import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, ensureAuth } from '../firebase';
import { doc, setDoc, updateDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { GAGES } from '../utils/i18n';

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

function genCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 5; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}

export function GameProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || null);
  const [uid, setUid] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState('lang');

  useEffect(() => { ensureAuth().then(u => setUid(u.uid)); }, []);

  useEffect(() => {
    if (lang) localStorage.setItem('lang', lang);
  }, [lang]);

  // Firestore real-time listener
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setRoom(data);
        if (data.phase && data.phase !== 'lobby') setScreen('game');
      }
    });
    return () => unsub();
  }, [roomId]);

  const createRoom = useCallback(async (name) => {
    if (!uid) return;
    const code = genCode();
    const data = {
      code, host: uid, phase: 'lobby', round: 0,
      players: [{ uid, name, accusationsLeft: 1 }],
      questions: [], selectedQuestion: null, questionAuthor: null,
      mc: null, target: null, targetChoice: null,
      accusedUid: null, accusationCorrect: null, answer: null,
      // Gage fields
      gageVotes: {}, // { uid: 'PHYSIQUE' | 'BOISSON' | 'GENANT' }
      gageCategory: null,
      gageResult: null,
      gageTimerStart: null,
      createdAt: Date.now()
    };
    await setDoc(doc(db, 'rooms', code), data);
    setRoomId(code);
    setScreen('lobby');
  }, [uid]);

  const joinRoom = useCallback(async (code, name) => {
    if (!uid) return;
    const roomRef = doc(db, 'rooms', code.toUpperCase());
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error('notFound');
        const d = snap.data();
        if (d.phase !== 'lobby') throw new Error('alreadyStarted');
        if (d.players.length >= 13) throw new Error('roomFull');
        if (d.players.some(p => p.name === name)) throw new Error('nameTaken');
        if (d.players.some(p => p.uid === uid)) return;
        tx.update(roomRef, { players: [...d.players, { uid, name, accusationsLeft: 1 }] });
      });
      setRoomId(code.toUpperCase());
      setScreen('lobby');
    } catch (e) { setError(e.message); }
  }, [uid]);

  const startGame = useCallback(async () => {
    if (!roomId || !room || room.host !== uid || room.players.length < 3) return;
    await updateDoc(doc(db, 'rooms', roomId), {
      phase: 'writing', round: 1, questions: [],
      selectedQuestion: null, questionAuthor: null,
      mc: null, target: null, targetChoice: null,
      accusedUid: null, accusationCorrect: null, answer: null,
      gageVotes: {}, gageCategory: null, gageResult: null, gageTimerStart: null,
    });
  }, [roomId, room, uid]);

  const submitQuestion = useCallback(async (text) => {
    if (!roomId || !uid) return;
    const roomRef = doc(db, 'rooms', roomId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      const d = snap.data();
      if (d.questions.some(q => q.uid === uid)) return;
      tx.update(roomRef, { questions: [...d.questions, { uid, text }] });
    });
  }, [roomId, uid]);

  // Host auto-advance when all questions submitted
  useEffect(() => {
    if (!room || room.phase !== 'writing' || room.host !== uid) return;
    if (!room.questions || room.questions.length < room.players.length) return;
    const qs = room.questions;
    const qi = Math.floor(Math.random() * qs.length);
    const sel = qs[qi];
    const eligible = room.players.filter(p => p.uid !== sel.uid);
    const mc = eligible[Math.floor(Math.random() * eligible.length)];
    updateDoc(doc(db, 'rooms', roomId), {
      phase: 'showQuestion', selectedQuestion: sel.text, questionAuthor: sel.uid, mc: mc.uid,
    });
  }, [room?.questions?.length, room?.phase, room?.players?.length]);

  const spinWheel = useCallback(async () => {
    if (!room || room.mc !== uid) return;
    const eligible = room.players.filter(p => p.uid !== room.mc);
    const target = eligible[Math.floor(Math.random() * eligible.length)];
    await updateDoc(doc(db, 'rooms', roomId), { phase: 'targetSelected', target: target.uid });
  }, [room, uid, roomId]);

  const chooseAnswer = useCallback(async () => {
    await updateDoc(doc(db, 'rooms', roomId), { phase: 'answering', targetChoice: 'answer' });
  }, [roomId]);

  const chooseAccuse = useCallback(async () => {
    await updateDoc(doc(db, 'rooms', roomId), { phase: 'accusing', targetChoice: 'accuse' });
  }, [roomId]);

  const submitAccusation = useCallback(async (accusedUid) => {
    if (!room) return;
    const isCorrect = accusedUid === room.questionAuthor;
    const updatedPlayers = room.players.map(p =>
      p.uid === room.target ? { ...p, accusationsLeft: Math.max(0, p.accusationsLeft - 1) } : p
    );
    if (isCorrect) {
      // Correct accusation -> round end, no gage
      await updateDoc(doc(db, 'rooms', roomId), {
        phase: 'roundEnd', accusedUid, accusationCorrect: true, players: updatedPlayers,
      });
    } else {
      // WRONG accusation -> go to GAGE VOTE (not answering!)
      await updateDoc(doc(db, 'rooms', roomId), {
        phase: 'gageVote',
        accusedUid,
        accusationCorrect: false,
        players: updatedPlayers,
        gageVotes: {},
        gageCategory: null,
        gageResult: null,
        gageTimerStart: Date.now(),
      });
    }
  }, [room, roomId]);

  // Submit gage vote
  const submitGageVote = useCallback(async (category) => {
    if (!roomId || !uid || !room) return;
    // Target (punished player) cannot vote
    if (uid === room.target) return;
    const roomRef = doc(db, 'rooms', roomId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      const d = snap.data();
      const votes = d.gageVotes || {};
      if (votes[uid]) return; // already voted
      votes[uid] = category;
      tx.update(roomRef, { gageVotes: votes });
    });
  }, [roomId, uid, room]);

  // Host auto-advance: all votes in OR timer expired -> resolve gage category
  useEffect(() => {
    if (!room || room.phase !== 'gageVote' || room.host !== uid) return;

    const votes = room.gageVotes || {};
    const eligibleVoters = room.players.filter(p => p.uid !== room.target);
    const allVoted = eligibleVoters.every(p => votes[p.uid]);

    if (allVoted) {
      resolveGageVote();
    }
  }, [room?.gageVotes, room?.phase]);

  // Timer: host checks if 10s elapsed
  useEffect(() => {
    if (!room || room.phase !== 'gageVote' || room.host !== uid) return;
    if (!room.gageTimerStart) return;

    const elapsed = Date.now() - room.gageTimerStart;
    const remaining = 10000 - elapsed;

    if (remaining <= 0) {
      resolveGageVote();
      return;
    }

    const timer = setTimeout(() => {
      resolveGageVote();
    }, remaining);

    return () => clearTimeout(timer);
  }, [room?.phase, room?.gageTimerStart]);

  const resolveGageVote = useCallback(async () => {
    if (!room || !roomId) return;

    const votes = room.gageVotes || {};
    const counts = { PHYSIQUE: 0, BOISSON: 0, GENANT: 0 };
    Object.values(votes).forEach(v => { if (counts[v] !== undefined) counts[v]++; });

    const maxCount = Math.max(...Object.values(counts));
    const winners = Object.keys(counts).filter(k => counts[k] === maxCount);
    const winningCategory = winners[Math.floor(Math.random() * winners.length)];

    // Pick random gage from category
    const gageKeys = GAGES[winningCategory];
    const gageResult = gageKeys[Math.floor(Math.random() * gageKeys.length)];

    await updateDoc(doc(db, 'rooms', roomId), {
      phase: 'gageWheel',
      gageCategory: winningCategory,
      gageResult: gageResult,
    });
  }, [room, roomId]);

  // After gage wheel animation, host moves to result
  const showGageResult = useCallback(async () => {
    if (!roomId) return;
    await updateDoc(doc(db, 'rooms', roomId), { phase: 'gageResult' });
  }, [roomId]);

  const submitAnswer = useCallback(async (text) => {
    await updateDoc(doc(db, 'rooms', roomId), { phase: 'roundEnd', answer: text });
  }, [roomId]);

  const nextRound = useCallback(async () => {
    if (!room || room.host !== uid) return;
    await updateDoc(doc(db, 'rooms', roomId), {
      phase: 'writing', round: (room.round || 0) + 1,
      questions: [], selectedQuestion: null, questionAuthor: null,
      mc: null, target: null, targetChoice: null,
      accusedUid: null, accusationCorrect: null, answer: null,
      gageVotes: {}, gageCategory: null, gageResult: null, gageTimerStart: null,
    });
  }, [room, uid, roomId]);

  const me = room?.players?.find(p => p.uid === uid);
  const isHost = room?.host === uid;
  const isMC = room?.mc === uid;
  const isTarget = room?.target === uid;

  return (
    <GameContext.Provider value={{
      lang, setLang, uid, roomId, room, error, setError,
      screen, setScreen, createRoom, joinRoom, startGame,
      submitQuestion, spinWheel, chooseAnswer, chooseAccuse,
      submitAccusation, submitAnswer, nextRound,
      submitGageVote, showGageResult,
      me, isHost, isMC, isTarget,
    }}>
      {children}
    </GameContext.Provider>
  );
}
