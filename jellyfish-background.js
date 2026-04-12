class AnimatedJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.boundsElement = this.canvas.parentElement || document.body;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.color = options.color || '#4b4f52';
    this.opacity = options.opacity || 0.2;
    this.speed = options.speed || 1;
    this.scale = options.scale || 1;
    this.time = 0;

    this.bellPoints = this.createBellPoints();
    this.skirtPoints = this.createSkirtPoints();
    this.tentacles = this.createTentacles();

    this.jellyfish = {
      x: 0,
      y: 0,
      vx: 0.32 * this.speed,
      vy: 0.18 * this.speed
    };

    this.handleResize();
    this.resetPosition();
    this.animate();

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const rect = this.boundsElement.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.keepInBounds();
  }

  resetPosition() {
    const bounds = this.getMovementBounds();
    this.jellyfish.x = bounds.left + (bounds.right - bounds.left) * 0.74;
    this.jellyfish.y = bounds.top + (bounds.bottom - bounds.top) * 0.12;
  }

  hash(x, y) {
    const value = Math.sin((x * 127.1) + (y * 311.7)) * 43758.5453123;
    return value - Math.floor(value);
  }

  createBellPoints() {
    const points = [];
    const chars = ['.', ':', ':', ';', '+', '*'];

    for (let row = -13; row <= 12; row++) {
      for (let col = -38; col <= 40; col++) {
        const nx = col / 39;
        const ny = row / 15;
        const dome = ((nx + 0.1) * (nx + 0.1)) / 1.08 + ((ny + 0.08) * (ny + 0.08)) / 0.56;
        const rightLobe = ((nx - 0.32) * (nx - 0.32)) / 0.54 + ((ny - 0.08) * (ny - 0.08)) / 0.48;
        const lowerCut = row < 8 + Math.sin((col + 6) * 0.22) * 1.8;
        const inside = (dome < 1 || rightLobe < 1) && lowerCut;

        if (!inside) continue;

        const edgeFade = Math.max(dome, rightLobe);
        const skip = edgeFade > 0.93 ? 0.32 : edgeFade > 0.82 ? 0.16 : 0.03;
        if (this.hash(col, row) < skip) continue;

        points.push({
          x: col,
          y: row + 13,
          char: chars[Math.floor(this.hash(row, col) * chars.length)],
          phase: this.hash(col + 17, row - 9) * Math.PI * 2,
          edge: edgeFade
        });
      }
    }

    return points;
  }

  createSkirtPoints() {
    const points = [];

    for (let col = -30; col <= 28; col += 2) {
      const row = 25 + Math.sin(col * 0.22) * 1.6;
      points.push({
        x: col,
        y: row,
        char: col % 6 === 0 ? '+' : ':',
        phase: this.hash(col, row) * Math.PI * 2
      });
    }

    return points;
  }

  createTentacles() {
    const anchors = [-26, -20, -14, -8, -2, 5, 12, 19, 25];
    const lengths = [10, 15, 18, 22, 24, 21, 17, 14, 10];

    return anchors.map((anchor, index) => ({
      anchor,
      length: lengths[index],
      phase: index * 0.72,
      curl: index % 2 === 0 ? 1 : -1
    }));
  }

  getMetrics() {
    const fontSize = Math.max(8, Math.min(12, this.width / 98)) * this.scale;
    return {
      fontSize,
      charWidth: fontSize * 0.62,
      lineHeight: fontSize * 0.86,
      halfWidth: 42 * fontSize * 0.62,
      totalHeight: 50 * fontSize * 0.86
    };
  }

  getMovementBounds() {
    const metrics = this.getMetrics();
    const gutter = Math.max(18, metrics.fontSize * 3);
    const bottom = Math.max(gutter, this.height - metrics.totalHeight - gutter);

    return {
      left: gutter + metrics.halfWidth,
      right: Math.max(gutter + metrics.halfWidth, this.width - metrics.halfWidth - gutter),
      top: gutter,
      bottom
    };
  }

  keepInBounds() {
    if (!this.jellyfish) return;

    const bounds = this.getMovementBounds();
    this.jellyfish.x = Math.min(bounds.right, Math.max(bounds.left, this.jellyfish.x));
    this.jellyfish.y = Math.min(bounds.bottom, Math.max(bounds.top, this.jellyfish.y));
  }

  updatePosition() {
    const bounds = this.getMovementBounds();
    const driftX = Math.sin(this.time * 0.008) * 0.12;
    const driftY = Math.cos(this.time * 0.011) * 0.08;

    this.jellyfish.vx += Math.sin(this.time * 0.006) * 0.0025;
    this.jellyfish.vy += Math.cos(this.time * 0.007) * 0.002;
    this.jellyfish.vx = Math.max(-0.48, Math.min(0.48, this.jellyfish.vx));
    this.jellyfish.vy = Math.max(-0.34, Math.min(0.34, this.jellyfish.vy));

    this.jellyfish.x += this.jellyfish.vx + driftX;
    this.jellyfish.y += this.jellyfish.vy + driftY;

    if (this.jellyfish.x <= bounds.left || this.jellyfish.x >= bounds.right) {
      this.jellyfish.vx *= -0.96;
      this.jellyfish.x = Math.min(bounds.right, Math.max(bounds.left, this.jellyfish.x));
    }

    if (this.jellyfish.y <= bounds.top || this.jellyfish.y >= bounds.bottom) {
      this.jellyfish.vy *= -0.96;
      this.jellyfish.y = Math.min(bounds.bottom, Math.max(bounds.top, this.jellyfish.y));
    }
  }

  drawBell(metrics) {
    const pulse = 1 + Math.sin(this.time * 0.024) * 0.025;
    const breathe = 1 + Math.cos(this.time * 0.019) * 0.014;

    this.bellPoints.forEach((point) => {
      const current = Math.sin(this.time * 0.021 + point.phase + point.y * 0.11);
      const x = this.jellyfish.x + point.x * metrics.charWidth * pulse + current * (0.7 + point.y * 0.035);
      const y = this.jellyfish.y + point.y * metrics.lineHeight * breathe + Math.sin(this.time * 0.017 + point.phase) * 0.55;
      this.ctx.fillText(point.char, x, y);
    });

    this.skirtPoints.forEach((point) => {
      const sway = Math.sin(this.time * 0.034 + point.phase) * 2.5;
      const x = this.jellyfish.x + point.x * metrics.charWidth + sway;
      const y = this.jellyfish.y + point.y * metrics.lineHeight + Math.cos(this.time * 0.022 + point.phase) * 0.8;
      this.ctx.fillText(point.char, x, y);
    });
  }

  drawTentacles(metrics) {
    const baseY = this.jellyfish.y + 28 * metrics.lineHeight;

    this.ctx.globalAlpha = this.opacity * 0.9;

    this.tentacles.forEach((tentacle, tentacleIndex) => {
      for (let segment = 0; segment < tentacle.length; segment++) {
        const taper = segment / tentacle.length;
        const wave = Math.sin(this.time * 0.04 + segment * 0.32 + tentacle.phase) * (2 + taper * 10) * tentacle.curl;
        const softCurrent = Math.cos(this.time * 0.018 + segment * 0.2 + tentacleIndex) * taper * 5;
        const x = this.jellyfish.x + tentacle.anchor * metrics.charWidth + wave + softCurrent;
        const y = baseY + segment * metrics.lineHeight * 0.78;
        const char = taper > 0.78 ? '.' : taper > 0.48 ? ':' : '|';
        this.ctx.fillText(char, x, y);
      }
    });

    this.ctx.globalAlpha = this.opacity;
  }

  drawJellyfish() {
    const metrics = this.getMetrics();

    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${metrics.fontSize}px "IBM Plex Mono", "Courier New", monospace`;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'center';

    this.drawBell(metrics);
    this.drawTentacles(metrics);

    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.updatePosition();
    this.drawJellyfish();
    this.time += 1;
    requestAnimationFrame(() => this.animate());
  }
}

function mountJellyfish() {
  new AnimatedJellyfish('jellyfishCanvas', {
    color: '#4b4f52',
    opacity: 0.2,
    speed: 1,
    scale: 1
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountJellyfish);
} else {
  mountJellyfish();
}
