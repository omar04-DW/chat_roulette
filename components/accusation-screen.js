class AccusationScreen extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .accusation-screen {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
      </style>
      <div class="accusation-screen">
        <h2>Accusation Screen</h2>
        <p>Someone has been accused!</p>
      </div>
    `;
  }
}
customElements.define('accusation-screen', AccusationScreen);