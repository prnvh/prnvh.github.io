class AnimatedJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.boundsElement = this.canvas.parentElement || document.body;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.color = options.color || '#181a1b';
    this.opacity = options.opacity || 0.9;
    this.tentacleOpacity = options.tentacleOpacity ?? 0.64;
    this.speed = options.speed || 0.5;
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

    this.curtainAnchors = [-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20];
    this.tentacles = this.createTentacles();
    this.jellyfish = {
      x: 0,
      y: 0,
      vx: 0.05 * this.speed,
      vy: 0.00008 * this.speed
    };

    this.handleResize();
    this.resetPosition();
    this.animate();

    window.addEventListener('resize', () => this.handleResize());
  }

  createTentacles() {
    return [
      { anchor: -15, length: 10, phase: 0.2, curl: -1, inner: false, wisp: -1 },
      { anchor: -11, length: 15, phase: 0.8, curl: 1, inner: true, wisp: 1 },
      { anchor: -7, length: 20, phase: 1.5, curl: -1, inner: true, wisp: -1 },
      { anchor: -3, length: 23, phase: 2.1, curl: 1, inner: true, wisp: 1 },
      { anchor: 1, length: 21, phase: 2.9, curl: -1, inner: true, wisp: -1 },
      { anchor: 5, length: 19, phase: 3.6, curl: 1, inner: true, wisp: 1 },
      { anchor: 9, length: 16, phase: 4.2, curl: -1, inner: true, wisp: -1 },
      { anchor: 13, length: 12, phase: 4.9, curl: 1, inner: false, wisp: 1 }
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

  getCharacterAlpha(char) {
    if (char === ';') return 1.08;
    if (char === ':') return 1.08;
    if (char === '.') return 1.14;
    return 1;
  }

  getUndersideY(metrics) {
    return (this.bell.length - 0.55) * metrics.lineHeight;
  }

  transformPoint(localX, localY, metrics, motion, pulse, swayScale = 1) {
    const bodyHeight = this.getUndersideY(metrics);
    const depth = Math.max(0, Math.min(1.4, localY / bodyHeight));
    const travelPosition = localX * motion.dx + localY * motion.dy;
    const xScale = pulse.stretchX - Math.min(0.03, depth * 0.02) * pulse.contraction;
    const yScale = 1 - Math.min(0.08, depth * 0.055) * pulse.contraction;
    const lowerSnap = -Math.min(1, depth) * pulse.contraction * metrics.lineHeight * 0.3;
    const travelingWave = Math.sin(this.time * 0.052 - travelPosition * 0.055);
    const bodySway = travelingWave * (0.32 + Math.min(1.2, depth) * 0.16) * swayScale;
    const glide = Math.cos(this.time * 0.04 - travelPosition * 0.045) * 0.22;

    return {
      x: this.jellyfish.x + localX * xScale + motion.px * bodySway + motion.dx * glide,
      y: this.jellyfish.y + localY * yScale + lowerSnap + motion.py * bodySway + motion.dy * glide
    };
  }

  drawBell(metrics, motion, pulse) {
    this.bell.forEach((line, rowIndex) => {
      const centerOffset = line.length / 2;

      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        if (char === ' ') continue;

        const rowDepth = rowIndex / Math.max(1, this.bell.length - 1);
        const localX = (col - centerOffset) * metrics.charWidth * (1 + pulse.contraction * rowDepth * 0.035);
        const localY = rowIndex * metrics.lineHeight;
        const point = this.transformPoint(localX, localY, metrics, motion, pulse);

        this.ctx.globalAlpha = Math.min(1, this.opacity * this.getCharacterAlpha(char));
        this.ctx.fillText(char, point.x, point.y);
      }
    });
  }

  getAnchorFlow(anchor, metrics) {
    return Math.sin(this.time * 0.052 - anchor * 0.24) * metrics.lineHeight * 0.16;
  }

  drawUnderside(metrics, motion, pulse) {
    const undersideY = this.getUndersideY(metrics);

    this.curtainAnchors.forEach((anchor, index) => {
      const phaseShift = Math.sin(this.time * 0.052 - anchor * 0.24);
      const rows = index % 2 === 0 ? 3 : 2;

      for (let row = 0; row < rows; row++) {
        const localX = anchor * metrics.charWidth + phaseShift * row * 0.25;
        const localY = undersideY + row * metrics.lineHeight * 0.42 + this.getAnchorFlow(anchor, metrics);
        const point = this.transformPoint(localX, localY, metrics, motion, pulse, 0.9);
        const char = row === 0 ? ';' : row === 1 ? ':' : '.';

        this.ctx.globalAlpha = Math.min(1, this.opacity * this.getCharacterAlpha(char));
        this.ctx.fillText(char, point.x, point.y);
      }
    });
  }

  drawTentacles(metrics, motion, pulse) {
    const undersideY = this.getUndersideY(metrics);

    this.tentacles.forEach((tentacle) => {
      const anchorFlow = this.getAnchorFlow(tentacle.anchor, metrics);
      const rootY = undersideY + metrics.lineHeight * 0.08 + anchorFlow;
      const connectorLength = tentacle.inner ? 7 : 5;
      const rootX = tentacle.anchor * metrics.charWidth;

      for (let segment = 0; segment < connectorLength; segment++) {
        const connectorTaper = segment / Math.max(1, connectorLength - 1);
        const wave = Math.sin(this.time * 0.052 - segment * 0.38 + tentacle.phase) * 0.5 * connectorTaper;
        const bunch = Math.sin(segment * 1.7 + tentacle.phase) * metrics.charWidth * 0.18 * (1 - connectorTaper);
        const localX = rootX + wave + bunch;
        const localY = rootY + segment * metrics.lineHeight * 0.28;
        const point = this.transformPoint(localX, localY, metrics, motion, pulse, 0.72);
        const char = segment < 2 ? ';' : segment < 5 ? ':' : '.';

        this.ctx.globalAlpha = Math.min(1, this.opacity * this.tentacleOpacity * 0.82);
        this.ctx.fillText(char, point.x, point.y);
      }

      for (let segment = 0; segment < tentacle.length; segment++) {
        const taper = segment / tentacle.length;
        const rootTaper = Math.min(1, (segment + 1) / 7);
        const sideWave = Math.sin(this.time * 0.052 - segment * 0.48 + tentacle.phase) * (0.28 + taper * 7.5) * tentacle.curl * rootTaper;
        const secondary = Math.cos(this.time * 0.026 - segment * 0.34 + tentacle.phase) * taper * 2.8 * rootTaper;
        const trail = taper * 10.5 * rootTaper;
        const localX = rootX + sideWave + secondary - motion.dx * trail;
        const localY = rootY + (segment + connectorLength * 0.72) * metrics.lineHeight * 0.5;
        const point = this.transformPoint(localX, localY, metrics, motion, pulse, 1.05);
        const char = taper > 0.82 ? '.' : taper > 0.52 ? ':' : ';';

        const segmentOpacity = 0.82 - taper * 0.28;
        this.ctx.globalAlpha = Math.min(1, this.opacity * this.tentacleOpacity * segmentOpacity);
        this.ctx.fillText(char, point.x, point.y);

        if (segment > 2 && segment % 5 === 1) {
          const wispLength = tentacle.inner ? 3 : 2;

          for (let wisp = 0; wisp < wispLength; wisp++) {
            const wispTaper = wisp / wispLength;
            const wispX = localX + tentacle.wisp * metrics.charWidth * (0.7 + wispTaper * 0.8);
            const wispY = localY + wisp * metrics.lineHeight * 0.28;
            const wispPoint = this.transformPoint(wispX, wispY, metrics, motion, pulse, 0.9);

            this.ctx.globalAlpha = Math.min(1, this.opacity * this.tentacleOpacity * 0.5);
            this.ctx.fillText(wispTaper > 0.5 ? '.' : ':', wispPoint.x, wispPoint.y);
          }
        }
      }

      if (tentacle.inner) {
        for (let segment = 0; segment < Math.floor(tentacle.length * 0.48); segment++) {
          const taper = segment / tentacle.length;
          const rootTaper = Math.min(1, (segment + 1) / 5);
          const wave = Math.sin(this.time * 0.058 - segment * 0.52 + tentacle.phase + 1.8) * (0.3 + taper * 4.4) * rootTaper;
          const localX = rootX + tentacle.curl * metrics.charWidth * 0.9 * rootTaper + wave;
          const localY = rootY + (segment + 1.1) * metrics.lineHeight * 0.38;
          const point = this.transformPoint(localX, localY, metrics, motion, pulse, 1);

          this.ctx.globalAlpha = Math.min(1, this.opacity * this.tentacleOpacity * 0.68);
          this.ctx.fillText(segment > 4 ? ':' : ';', point.x, point.y);
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

    this.drawBell(metrics, motion, pulse);
    this.drawUnderside(metrics, motion, pulse);
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
    tentacleOpacity: 0.64,
    speed: 0.5,
    scale: 1.12
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountJellyfish);
} else {
  mountJellyfish();
}
