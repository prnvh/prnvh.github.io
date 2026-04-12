class AnimatedJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.boundsElement = this.canvas.parentElement || document.body;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.color = options.color || '#3f4447';
    this.opacity = options.opacity || 0.24;
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
    const chars = ['.', ':', ':', ';', ';', '+', '+'];

    for (let row = -14; row <= 14; row++) {
      for (let col = -40; col <= 42; col++) {
        const nx = col / 40;
        const ny = row / 16;
        const dome = ((nx + 0.12) * (nx + 0.12)) / 1.05 + ((ny + 0.06) * (ny + 0.06)) / 0.58;
        const rightLobe = ((nx - 0.3) * (nx - 0.3)) / 0.58 + ((ny - 0.05) * (ny - 0.05)) / 0.5;
        const lowerCut = row < 10 + Math.sin((col + 7) * 0.2) * 1.4;
        const inside = (dome < 1 || rightLobe < 1) && lowerCut;

        if (!inside) continue;

        const edgeFade = Math.max(dome, rightLobe);
        const innerWeight = 1 - Math.min(1, edgeFade);
        const lowerWeight = row > 3 ? 0.04 : 0;
        const skip = edgeFade > 0.94 ? 0.24 : edgeFade > 0.84 ? 0.1 : Math.max(0, 0.02 - lowerWeight - innerWeight * 0.03);
        if (this.hash(col, row) < skip) continue;

        points.push({
          x: col,
          y: row + 14,
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

    for (let col = -32; col <= 32; col += 2) {
      const row = 27 + Math.sin(col * 0.2) * 1.5;
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
    const anchors = [-29, -23, -17, -11, -5, 1, 7, 13, 20, 27];
    const lengths = [8, 12, 16, 20, 23, 21, 18, 15, 12, 8];

    return anchors.map((anchor, index) => ({
      anchor,
      length: lengths[index],
      phase: index * 0.72,
      curl: index % 2 === 0 ? 1 : -1,
      oral: index > 2 && index < 7
    }));
  }

  getMetrics() {
    const fontSize = Math.max(8, Math.min(12, this.width / 98)) * this.scale;
    return {
      fontSize,
      charWidth: fontSize * 0.62,
      lineHeight: fontSize * 0.86,
      halfWidth: 44 * fontSize * 0.62,
      totalHeight: 48 * fontSize * 0.86
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
    const baseY = this.jellyfish.y + 30 * metrics.lineHeight;

    this.ctx.globalAlpha = this.opacity * 0.86;

    this.tentacles.forEach((tentacle, tentacleIndex) => {
      for (let segment = 0; segment < tentacle.length; segment++) {
        const taper = segment / tentacle.length;
        const wave = Math.sin(this.time * 0.035 + segment * 0.36 + tentacle.phase) * (1.2 + taper * 7) * tentacle.curl;
        const softCurrent = Math.cos(this.time * 0.016 + segment * 0.24 + tentacleIndex) * taper * 3.5;
        const x = this.jellyfish.x + tentacle.anchor * metrics.charWidth + wave + softCurrent;
        const y = baseY + segment * metrics.lineHeight * 0.78;
        const char = taper > 0.78 ? '.' : taper > 0.5 ? ':' : ';';
        this.ctx.fillText(char, x, y);
      }

      if (tentacle.oral) {
        const armLength = Math.floor(tentacle.length * 0.5);

        for (let segment = 0; segment < armLength; segment++) {
          const taper = segment / armLength;
          const wave = Math.sin(this.time * 0.043 + segment * 0.42 + tentacle.phase + 1.4) * (1 + taper * 4);
          const x = this.jellyfish.x + (tentacle.anchor + 2.5 * tentacle.curl) * metrics.charWidth + wave;
          const y = baseY + segment * metrics.lineHeight * 0.66;
          const char = taper > 0.72 ? '.' : ':';
          this.ctx.fillText(char, x, y);
        }
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
    color: '#3f4447',
    opacity: 0.24,
    speed: 1,
    scale: 1
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountJellyfish);
} else {
  mountJellyfish();
}
