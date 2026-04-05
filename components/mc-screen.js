class McScreen extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .mc-screen {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
      </style>
      <div class="mc-screen">
        <h2>MC Screen</h2>
        <p>This player is the Master of Ceremonies</p>
      </div>
    `;
  }
}
customElements.define('mc-screen', McScreen);