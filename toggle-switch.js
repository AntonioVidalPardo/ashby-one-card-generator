class ToggleSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['value', 'color', 'text-color'];
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('.toggle').addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-option');
      if (!btn || btn.classList.contains('active')) return;

      this.shadowRoot.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.setAttribute('value', btn.dataset.value);
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: btn.dataset.value },
        bubbles: true,
      }));
    });
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  get options() {
    return Array.from(this.querySelectorAll('option')).map(opt => ({
      value: opt.value,
      label: opt.textContent,
    }));
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'value' && oldVal !== null && oldVal !== newVal) {
      const buttons = this.shadowRoot?.querySelectorAll('.toggle-option');
      if (!buttons) return;
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === newVal);
      });
    }
  }

  render() {
    const color = this.getAttribute('color') || '#473BCE';
    const textColor = this.getAttribute('text-color') || '#FFFFFF';
    const options = this.options;
    const selected = this.getAttribute('value') || options[0]?.value || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        .toggle {
          display: flex;
          background: #e8e8e8;
          border-radius: 999px;
          padding: 4px;
          gap: 4px;
          user-select: none;
        }

        .toggle-option {
          padding: 10px 28px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 500;
          color: #555;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.25s ease, color 0.25s ease;
        }

        .toggle-option.active {
          background: ${color};
          color: ${textColor};
        }

        .toggle-option:not(.active):hover {
          background: rgba(0, 0, 0, 0.05);
        }
      </style>
      <div class="toggle">
        ${options.map(opt => `
          <button class="toggle-option${opt.value === selected ? ' active' : ''}" data-value="${opt.value}">
            ${opt.label}
          </button>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('toggle-switch', ToggleSwitch);
