class TargetScreen extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .target-screen {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
      </style>
      <div class="target-screen">
        <h2>Target Screen</h2>
        <p>You've been selected to answer the question!</p>
      </div>
    `;
  }
}
customElements.define('target-screen', TargetScreen);