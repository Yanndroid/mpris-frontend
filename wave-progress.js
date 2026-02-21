
class WaveProgress extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.classList.add('wave-progress-container');

    const track = document.createElement('div');
    track.classList.add('wave-progress-track');

    const waveDiv = document.createElement('div');
    waveDiv.classList.add('wave-progress-wave');

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add('wave-progress-svg');
    svg.setAttribute("preserveAspectRatio", "none");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add('wave-progress-path');

    svg.appendChild(path);
    waveDiv.appendChild(svg);
    container.appendChild(track);
    container.appendChild(waveDiv);

    const style = document.createElement('style');
    style.textContent = `
      :host {
        --track-color: #cfd8dc;
        --wave-color: #6200ee;
        display: block;
      }
      .wave-progress-container {
        height: 100%;
        width: 100%;
        position: relative;
      }
      .wave-progress-track {
        height: 50%;
        width: 100%;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: var(--track-color);
        overflow: hidden;
      }
      .wave-progress-wave {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        // overflow: hidden;
      }
      .wave-progress-svg {
        height: 100%;
        width: 100%;
        position: absolute;
      }
      .wave-progress-path {
        fill: none;
        stroke: var(--wave-color);
        stroke-linecap: round;
      }
    `;

    this.shadowRoot.append(style, container);

    this._track = track;
    this._svg = svg;
    this._path = path;

    this._width;
    this._height;
    this._cap;
    this._gap;

    this._playing = false;
    this._progress = 0;
    this._offset = 0;

    this._drawWave = this._drawWave.bind(this);
  }

  connectedCallback() {
    const rect = this.getBoundingClientRect();
    this._width = this.hasAttribute('width') ? parseInt(this.getAttribute('width'), 10) : rect.width;
    this._height = this.hasAttribute('height') ? parseInt(this.getAttribute('height'), 10) : rect.height;

    this._svg.setAttribute("viewBox", `0 0 ${this._width} ${this._height}`);

    this._path.style.strokeWidth = this._height / 2 + 'px';
    this._track.style.borderRadius = this._height / 4 + 'px';
    this._cap = this._height / 4;
    this._gap = this._height / 4;

    this.shadowRoot.host.style.setProperty('--track-color', this.getAttribute('track-color') || '#cfd8dc');
    this.shadowRoot.host.style.setProperty('--wave-color', this.getAttribute('wave-color') || '#6200ee');

    this._drawLoop();
  }

  setPlaying(value) {
    this._playing = value;
    this._drawWave();
  }

  setProgress(value) {
    this._progress = Math.min(Math.max(value, 0), 1);
    this._drawWave();
  }

  _drawLoop() {
    if (this._playing) {
      this._offset += 0.005;
      this._drawWave();
    }
    requestAnimationFrame(this._drawLoop.bind(this));
  }

  _drawWave() {
    const waveWidth = this._progress ? Math.max(this._cap * 2, this._width * this._progress) : 0;
    const gap = Math.min(this._gap, this._progress * 100, (1 - this._progress) * 100);

    const amplitude = this._playing ? Math.min(this._height / 4, this._progress * 20) : 0;
    const wavelength = this._height * 2.5;

    /* const waveWidth = this._width * this._progress;
    const gap = this._gap;

    const amplitude = this._height / 4;
    const wavelength = this._height * 2.5; */

    const startX = this._cap;
    const startY = this._height / 2 + amplitude * Math.sin(((startX + this._offset * 100) * 2 * Math.PI) / wavelength);

    let d = `M${startX} ${startY}`;
    for (let x = startX; x <= waveWidth - this._cap; x++) {
      const y = this._height / 2 + amplitude * Math.sin(((x + this._offset * 100) * 2 * Math.PI) / wavelength);
      d += ` L${x} ${y}`;
    }
    this._path.setAttribute('d', d);

    this._track.style.width = this._width - waveWidth - gap + 'px';
    this._track.style.left = waveWidth + gap + 'px';
  }
}

customElements.define('wave-progress', WaveProgress);
