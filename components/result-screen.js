class ResultScreen extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .result-screen {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
      </style>
      <div class="result-screen">
        <h2>Result Screen</h2>
        <p>Round results will be shown here</p>
      </div>
    `;
  }
}
customElements.define('result-screen', ResultScreen);