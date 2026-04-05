class LanguageSelector extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .language-selector {
                    position: fixed;
                    bottom: 1rem;
                    right: 1rem;
                    z-index: 100;
                }
                .language-btn {
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                }
                .language-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
            </style>
            <div class="language-selector">
                <button class="language-btn" id="toggleLanguage">
                    <i data-feather="globe"></i>
                </button>
            </div>
        `;
        
        // Initialize feather icons
        feather.replace();
        
        // Add click event
        this.shadowRoot.getElementById('toggleLanguage').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('language-toggle'));
        });
    }
}

customElements.define('language-selector', LanguageSelector);