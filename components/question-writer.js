class QuestionWriter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .question-writer {
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 1.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                }
                h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.25rem;
                    resize: vertical;
                    margin-bottom: 1rem;
                }
                .submit-btn {
                    display: block;
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.25rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .submit-btn:hover {
                    background-color: #2563eb;
                }
                .submit-btn:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }
                .timer {
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 1rem 0;
                }
            </style>
            <div class="question-writer">
                <h2>Write Your Question</h2>
                <p>Remember: Questions are anonymous!</p>
                <div class="timer" id="timer">02:00</div>
                <textarea id="questionInput" placeholder="Enter your question here..."></textarea>
                <button class="submit-btn" id="submitButton">Submit Question</button>
            </div>
        `;
        
        // Add event listener
        this.shadowRoot.getElementById('submitButton').addEventListener('click', () => {
            const question = this.shadowRoot.getElementById('questionInput').value.trim();
            if (question) {
                this.dispatchEvent(new CustomEvent('submit-question', { 
                    detail: { question } 
                }));
            }
        });
        
        // Start timer (2 minutes)
        this.startTimer(120);
    }
    
    startTimer(duration) {
        const timerElement = this.shadowRoot.getElementById('timer');
        let timer = duration, minutes, seconds;
        
        const interval = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
            
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            
            timerElement.textContent = minutes + ":" + seconds;
            
            if (--timer < 0) {
                clearInterval(interval);
                this.dispatchEvent(new CustomEvent('time-up'));
            }
        }, 1000);
    }
}

customElements.define('question-writer', QuestionWriter);