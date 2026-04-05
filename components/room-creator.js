class RoomCreator extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .room-creator {
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 1.5rem;
                    max-width: 400px;
                    margin: 0 auto;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                input {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.25rem;
                }
                .btn {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn:hover {
                    background-color: #2563eb;
                }
                .btn-back {
                    background-color: #6b7280;
                    margin-right: 0.5rem;
                }
                .btn-back:hover {
                    background-color: #4b5563;
                }
            </style>
            <div class="room-creator">
                <h2 class="text-xl font-semibold mb-4">Create a Room</h2>
                <div class="form-group">
                    <label for="username">Your Name</label>
                    <input type="text" id="username" placeholder="Enter your name">
                </div>
                <div class="flex justify-between mt-6">
                    <button class="btn btn-back" id="backButton">Back</button>
                    <button class="btn" id="createButton">Create Room</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.shadowRoot.getElementById('backButton').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('back-to-menu'));
        });
        
        this.shadowRoot.getElementById('createButton').addEventListener('click', () => {
            const username = this.shadowRoot.getElementById('username').value.trim();
            if (username) {
                this.dispatchEvent(new CustomEvent('create-room', { 
                    detail: { username } 
                }));
            }
        });
    }
}

customElements.define('room-creator', RoomCreator);