import { useGame } from './contexts/GameContext';
import LangScreen from './components/LangScreen';
import RulesScreen from './components/RulesScreen';
import MenuScreen from './components/MenuScreen';
import CreateScreen from './components/CreateScreen';
import JoinScreen from './components/JoinScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import RulesModal from './components/RulesModal';
import { T } from './utils/i18n';

export default function App() {
  const { screen, error, setError, lang } = useGame();
  const l = T[lang] || T.en;

  return (
    <div className="app-root">
      {error && (
        <div className="toast-error" onClick={() => setError(null)}>
          {l[error] || error} ✕
        </div>
      )}
      {screen === 'lang' && <LangScreen />}
      {screen === 'rules' && <RulesScreen />}
      {screen === 'menu' && <MenuScreen />}
      {screen === 'create' && <CreateScreen />}
      {screen === 'join' && <JoinScreen />}
      {screen === 'lobby' && <LobbyScreen />}
      {screen === 'game' && <GameScreen />}
      <RulesModal />
    </div>
  );
}
