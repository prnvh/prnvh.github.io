class AnimatedJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.boundsElement = this.canvas.parentElement || document.body;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.color = options.color || '#181a1b';
    this.opacity = options.opacity || 0.9;
    this.speed = options.speed || 1;
    this.scale = options.scale || 1.12;
    this.time = 0;

    this.bell = [
      '                 ..:::;;;;;;;;;;;;;;;;;:::..              ',
      '             ..::;;;;;;;;;;;;;;;;;;;;;;;;;::..            ',
      '          ..::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::..         ',
      '        .:::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::.        ',
      '      .:::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::.      ',
      '    .:::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::.    ',
      '   .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:.   ',
      '  .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:.  ',
      ' .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:. ',
      ' .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:. ',
      ' .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:. ',
      '  .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:.  ',
      '   .::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:.   ',
      '    .:::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::.    ',
      '      .::;;;;;;;;;;;;;;;;;;;;;;;;;::::::::;;;;;;::.       ',
      '        ..::;;;;;;;;;;;;;;;;:::::.....::::::..            ',
      '            ...::::;;;;::::.....       .....              '
    ];

    this.skirt = [
      '           .:;;:..:;;:..:;;:..:;;:..:;;:..:;;:.          ',
      '             .;:.  .;:.  .;:.  .;:.  .;:.  .;:.          ',
      '              :.    :.    :.    :.    :.    :.            '
    ];

    this.tentacles = this.createTentacles();
    this.jellyfish = {
      x: 0,
      y: 0,
      vx: 0.2 * this.speed,
      vy: 0.08 * this.speed
    };

    this.handleResize();
    this.resetPosition();
    this.animate();

    window.addEventListener('resize', () => this.handleResize());
  }

  createTentacles() {
    return [
      { anchor: -16, length: 9, phase: 0.2, curl: -1, inner: false },
      { anchor: -12, length: 13, phase: 0.8, curl: 1, inner: false },
      { anchor: -8, length: 16, phase: 1.5, curl: -1, inner: true },
      { anchor: -4, length: 19, phase: 2.1, curl: 1, inner: true },
      { anchor: 0, length: 18, phase: 2.9, curl: -1, inner: true },
      { anchor: 4, length: 18, phase: 3.6, curl: 1, inner: true },
      { anchor: 8, length: 17, phase: 4.2, curl: -1, inner: true },
      { anchor: 12, length: 14, phase: 4.9, curl: 1, inner: false },
      { anchor: 16, length: 12, phase: 5.5, curl: -1, inner: false }
    ];
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

  getMetrics() {
    const fontSize = Math.max(5.6, Math.min(8.2, this.width / 150)) * this.scale;

    return {
      fontSize,
      charWidth: fontSize * 0.62,
      lineHeight: fontSize * 0.92,
      halfWidth: 31 * fontSize * 0.62,
      totalHeight: 34 * fontSize * 0.92
    };
  }

  getMovementBounds() {
    const metrics = this.getMetrics();
    const gutter = Math.max(12, metrics.fontSize * 2);

    return {
      left: gutter + metrics.halfWidth,
      right: Math.max(gutter + metrics.halfWidth, this.width - metrics.halfWidth - gutter),
      top: gutter,
      bottom: Math.max(gutter, this.height - metrics.totalHeight - gutter)
    };
  }

  resetPosition() {
    const bounds = this.getMovementBounds();
    this.jellyfish.x = bounds.left + (bounds.right - bounds.left) * 0.72;
    this.jellyfish.y = bounds.top + (bounds.bottom - bounds.top) * 0.1;
  }

  keepInBounds() {
    if (!this.jellyfish) return;

    const bounds = this.getMovementBounds();
    this.jellyfish.x = Math.min(bounds.right, Math.max(bounds.left, this.jellyfish.x));
    this.jellyfish.y = Math.min(bounds.bottom, Math.max(bounds.top, this.jellyfish.y));
  }

  getMotionVector() {
    const speed = Math.hypot(this.jellyfish.vx, this.jellyfish.vy) || 1;
    const dx = this.jellyfish.vx / speed;
    const dy = this.jellyfish.vy / speed;

    return {
      dx,
      dy,
      px: -dy,
      py: dx,
      speed
    };
  }

  updatePosition() {
    const bounds = this.getMovementBounds();
    const driftX = Math.sin(this.time * 0.007) * 0.07;
    const driftY = Math.cos(this.time * 0.01) * 0.05;

    this.jellyfish.vx += Math.sin(this.time * 0.005) * 0.0012;
    this.jellyfish.vy += Math.cos(this.time * 0.006) * 0.0009;
    this.jellyfish.vx = Math.max(-0.28, Math.min(0.28, this.jellyfish.vx));
    this.jellyfish.vy = Math.max(-0.16, Math.min(0.16, this.jellyfish.vy));

    this.jellyfish.x += this.jellyfish.vx + driftX;
    this.jellyfish.y += this.jellyfish.vy + driftY;

    if (this.jellyfish.x <= bounds.left || this.jellyfish.x >= bounds.right) {
      this.jellyfish.vx *= -0.95;
      this.jellyfish.x = Math.min(bounds.right, Math.max(bounds.left, this.jellyfish.x));
    }

    if (this.jellyfish.y <= bounds.top || this.jellyfish.y >= bounds.bottom) {
      this.jellyfish.vy *= -0.95;
      this.jellyfish.y = Math.min(bounds.bottom, Math.max(bounds.top, this.jellyfish.y));
    }
  }

  getPulse() {
    const contraction = (Math.sin(this.time * 0.034) + 1) / 2;

    return {
      contraction,
      stretchX: 1 + contraction * 0.045,
      squeezeY: 1 - contraction * 0.045
    };
  }

  drawAsciiRows(rows, startY, metrics, motion, pulse, alphaScale = 1) {
    rows.forEach((line, rowIndex) => {
      const centerOffset = line.length / 2;

      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        if (char === ' ') continue;

        const colOffset = col - centerOffset;
        const rowDepth = rowIndex / Math.max(1, rows.length - 1);
        const localX = colOffset * metrics.charWidth * (1 + pulse.contraction * rowDepth * 0.035);
        const localY = startY + rowIndex * metrics.lineHeight * (1 - pulse.contraction * rowDepth * 0.055);
        const travelPosition = localX * motion.dx + localY * motion.dy;
        const breathingWidth = pulse.stretchX - rowDepth * pulse.contraction * 0.03;
        const travelingWave = Math.sin(this.time * 0.052 - travelPosition * 0.055);
        const bodySway = travelingWave * (0.36 + rowIndex * 0.014);
        const glide = Math.cos(this.time * 0.04 - travelPosition * 0.045) * 0.25;
        const bellSnap = rowDepth * pulse.contraction * metrics.lineHeight * -0.32;
        const x = this.jellyfish.x + localX * breathingWidth + motion.px * bodySway + motion.dx * glide;
        const y = this.jellyfish.y + localY + bellSnap + motion.py * bodySway + motion.dy * glide;
        this.ctx.globalAlpha = Math.min(1, this.opacity * alphaScale * this.getCharacterAlpha(char));
        this.ctx.fillText(char, x, y);
      }
    });
  }

  getCharacterAlpha(char) {
    if (char === ';') return 1.08;
    if (char === ':') return 1.08;
    if (char === '.') return 1.14;
    if (char === '*') return 0.62;
    return 1;
  }

  getTentacleRoot(tentacle, metrics, pulse) {
    const skirtY = (this.bell.length + this.skirt.length - 1.9) * metrics.lineHeight;
    const rootLift = pulse.contraction * metrics.lineHeight * 0.2;

    return {
      x: this.jellyfish.x + tentacle.anchor * metrics.charWidth * pulse.stretchX,
      y: this.jellyfish.y + skirtY - rootLift
    };
  }

  drawTentacles(metrics, motion, pulse) {
    this.ctx.globalAlpha = Math.min(1, this.opacity * 0.98);

    this.tentacles.forEach((tentacle) => {
      const root = this.getTentacleRoot(tentacle, metrics, pulse);
      const connectorLength = tentacle.inner ? 5 : 4;

      for (let segment = 0; segment < connectorLength; segment++) {
        const wave = Math.sin(this.time * 0.052 - segment * 0.45 + tentacle.phase) * 0.45;
        const x = root.x + motion.px * wave;
        const y = root.y + segment * metrics.lineHeight * 0.46 + motion.py * wave;

        this.ctx.fillText(';', x, y);
      }

      for (let segment = 0; segment < tentacle.length; segment++) {
        const taper = segment / tentacle.length;
        const wave = Math.sin(this.time * 0.052 - segment * 0.48 + tentacle.phase) * (0.8 + taper * 5.2) * tentacle.curl;
        const secondary = Math.cos(this.time * 0.026 - segment * 0.34 + tentacle.phase) * taper * 1.8;
        const trail = taper * 9;
        const x = root.x + motion.px * wave - motion.dx * trail + motion.px * secondary;
        const y = root.y + (segment + connectorLength) * metrics.lineHeight * 0.58 + motion.py * wave - motion.dy * trail + motion.py * secondary;
        const char = taper > 0.78 ? ':' : taper > 0.42 ? ';' : ':';

        this.ctx.globalAlpha = Math.min(1, this.opacity * (taper > 0.78 ? 0.98 : 1.08));
        this.ctx.fillText(char, x, y);
      }

      if (tentacle.inner) {
        for (let segment = 0; segment < Math.floor(tentacle.length * 0.48); segment++) {
          const taper = segment / tentacle.length;
          const wave = Math.sin(this.time * 0.058 - segment * 0.52 + tentacle.phase + 1.8) * (0.8 + taper * 3);
          const trail = taper * 5;
          const x = root.x + tentacle.curl * metrics.charWidth * 1.7 + motion.px * wave - motion.dx * trail;
          const y = root.y + (segment + 1.2) * metrics.lineHeight * 0.5 + motion.py * wave - motion.dy * trail;

          this.ctx.globalAlpha = Math.min(1, this.opacity * 0.96);
          this.ctx.fillText(segment > 4 ? ':' : ';', x, y);
        }
      }
    });
  }

  drawJellyfish() {
    const metrics = this.getMetrics();
    const motion = this.getMotionVector();
    const pulse = this.getPulse();

    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${metrics.fontSize}px "IBM Plex Mono", "Courier New", monospace`;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'center';

    this.drawAsciiRows(this.bell, 0, metrics, motion, pulse, 1);
    this.drawAsciiRows(this.skirt, (this.bell.length - 0.55) * metrics.lineHeight, metrics, motion, pulse, 1);
    this.drawTentacles(metrics, motion, pulse);

    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.updatePosition();
    this.drawJellyfish();
    this.time += 0.72;
    requestAnimationFrame(() => this.animate());
  }
}

function mountJellyfish() {
  new AnimatedJellyfish('jellyfishCanvas', {
    color: '#181a1b',
    opacity: 0.9,
    speed: 0.78,
    scale: 1.12
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountJellyfish);
} else {
  mountJellyfish();
}
