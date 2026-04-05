class GameLobby extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .game-lobby {
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 1.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .room-code {
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 1rem;
                    letter-spacing: 0.2em;
                }
                .player-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }
                .player-card {
                    background: #f3f4f6;
                    border-radius: 0.25rem;
                    padding: 0.5rem;
                    text-align: center;
                }
                .start-btn {
                    display: block;
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #10b981;
                    color: white;
                    border: none;
                    border-radius: 0.25rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-top: 1rem;
                }
                .start-btn:hover {
                    background-color: #059669;
                }
                .start-btn:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }
                .copy-btn {
                    display: block;
                    width: 100%;
                    padding: 0.5rem;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-top: 0.5rem;
                }
                .copy-btn:hover {
                    background-color: #2563eb;
                }
            </style>
            <div class="game-lobby">
                <div class="room-code" id="roomCodeDisplay"></div>
                <button class="copy-btn" id="copyButton">Copy Room Code</button>
                
                <h3 class="text-lg font-semibold mt-4">Players (<span id="playerCount">0</span>/13)</h3>
                <div class="player-list" id="playersContainer"></div>
                
                <button class="start-btn" id="startButton" disabled>Start Game</button>
            </div>
        `;
        
        // Add event listeners
        this.shadowRoot.getElementById('copyButton').addEventListener('click', () => {
            this.copyRoomCode();
        });
        
        this.shadowRoot.getElementById('startButton').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('start-game'));
        });
    }
    
    setRoomCode(code) {
        this.shadowRoot.getElementById('roomCodeDisplay').textContent = code;
    }
    
    updatePlayers(players, isHost) {
        const playersContainer = this.shadowRoot.getElementById('playersContainer');
        const playerCount = this.shadowRoot.getElementById('playerCount');
        const startButton = this.shadowRoot.getElementById('startButton');
        
        // Clear current players
        playersContainer.innerHTML = '';
        
        // Add each player
        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.textContent = player.name;
            playersContainer.appendChild(playerCard);
        });
        
        // Update player count
        playerCount.textContent = players.length;
        
        // Enable/disable start button based on player count and host status
        startButton.disabled = !isHost || players.length < 3;
    }
    
    copyRoomCode() {
        const code = this.shadowRoot.getElementById('roomCodeDisplay').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const copyButton = this.shadowRoot.getElementById('copyButton');
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy Room Code';
            }, 2000);
        });
    }
}

customElements.define('game-lobby', GameLobby);