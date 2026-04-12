class AnimatedJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.boundsElement = this.canvas.parentElement || document.body;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.color = options.color || '#3f4244';
    this.opacity = options.opacity || 0.7;
    this.speed = options.speed || 1;
    this.scale = options.scale || 1;
    this.time = 0;

    this.bell = [
      '                 ...:::;;;+++++++;;;:::...                 ',
      '             ..::;;+++++++++++++++++++++;;::..             ',
      '          ..::;+++***********************+++;::..          ',
      '        .::;++*******************************++;::.        ',
      '      .::;++***********************************++;;:.      ',
      '    .::;++***************************************++;;:.    ',
      '   .:;++*******************************************++;:.   ',
      '  .:;++*********************************************++;:.  ',
      ' .:;++***********************************************++;:. ',
      ' .:;++***********************************************++;:. ',
      ' .:;++***********************************************++;:. ',
      '  .:;++*********************************************++;:.  ',
      '   .:;++***********************************+++++++++;:.   ',
      '    .::;++**************************+++++;;;;;;;++;:.     ',
      '      .::;;++++************+++++;;;;::::::::;;;;::.       ',
      '        ..::;;;;++++++++;;;;:::::........::::::..         ',
      '            ...::::;;;;::::.....         .....            '
    ];

    this.skirt = [
      '             .:;:..:;:..:;:..:;:..:;:..:;:.             ',
      '               .:.  .:.  .:.  .:.  .:.  .:.             '
    ];

    this.tentacles = this.createTentacles();
    this.jellyfish = {
      x: 0,
      y: 0,
      vx: 0.28 * this.speed,
      vy: 0.12 * this.speed
    };

    this.handleResize();
    this.resetPosition();
    this.animate();

    window.addEventListener('resize', () => this.handleResize());
  }

  createTentacles() {
    return [
      { anchor: -24, length: 9, phase: 0.2, curl: -1 },
      { anchor: -18, length: 13, phase: 1.1, curl: 1 },
      { anchor: -12, length: 16, phase: 2.0, curl: -1 },
      { anchor: -6, length: 19, phase: 2.8, curl: 1 },
      { anchor: 0, length: 18, phase: 3.4, curl: -1 },
      { anchor: 6, length: 16, phase: 4.2, curl: 1 },
      { anchor: 13, length: 13, phase: 5.0, curl: -1 },
      { anchor: 20, length: 10, phase: 5.7, curl: 1 }
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
      totalHeight: 35 * fontSize * 0.92
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
    const driftX = Math.sin(this.time * 0.009) * 0.11;
    const driftY = Math.cos(this.time * 0.013) * 0.08;

    this.jellyfish.vx += Math.sin(this.time * 0.006) * 0.002;
    this.jellyfish.vy += Math.cos(this.time * 0.008) * 0.0015;
    this.jellyfish.vx = Math.max(-0.42, Math.min(0.42, this.jellyfish.vx));
    this.jellyfish.vy = Math.max(-0.24, Math.min(0.24, this.jellyfish.vy));

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

  drawAsciiRows(rows, startY, metrics, motion, alphaScale = 1) {
    this.ctx.globalAlpha = this.opacity * alphaScale;

    rows.forEach((line, rowIndex) => {
      const centerOffset = line.length / 2;

      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        if (char === ' ') continue;

        const colOffset = col - centerOffset;
        const localX = colOffset * metrics.charWidth;
        const localY = startY + rowIndex * metrics.lineHeight;
        const travelPosition = localX * motion.dx + localY * motion.dy;
        const pulse = 1 + Math.sin(this.time * 0.024) * 0.018;
        const travelingWave = Math.sin(this.time * 0.07 - travelPosition * 0.055);
        const bodySway = travelingWave * (0.55 + rowIndex * 0.018);
        const glide = Math.cos(this.time * 0.052 - travelPosition * 0.045) * 0.35;
        const x = this.jellyfish.x + localX * pulse + motion.px * bodySway + motion.dx * glide;
        const y = this.jellyfish.y + localY + motion.py * bodySway + motion.dy * glide;
        this.ctx.fillText(char, x, y);
      }
    });
  }

  drawTentacles(metrics, motion) {
    const baseY = this.jellyfish.y + (this.bell.length + this.skirt.length + 1) * metrics.lineHeight;
    this.ctx.globalAlpha = this.opacity * 0.9;

    this.tentacles.forEach((tentacle) => {
      for (let segment = 0; segment < tentacle.length; segment++) {
        const taper = segment / tentacle.length;
        const wave = Math.sin(this.time * 0.075 - segment * 0.55 + tentacle.phase) * (1 + taper * 6.5) * tentacle.curl;
        const secondary = Math.cos(this.time * 0.035 - segment * 0.38 + tentacle.phase) * taper * 2.4;
        const trail = taper * 13;
        const x = this.jellyfish.x + tentacle.anchor * metrics.charWidth + motion.px * wave - motion.dx * trail + motion.px * secondary;
        const y = baseY + segment * metrics.lineHeight * 0.74 + motion.py * wave - motion.dy * trail + motion.py * secondary;
        const char = taper > 0.74 ? '.' : taper > 0.42 ? ':' : ';';

        this.ctx.fillText(char, x, y);
      }
    });
  }

  drawJellyfish() {
    const metrics = this.getMetrics();
    const motion = this.getMotionVector();

    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${metrics.fontSize}px "IBM Plex Mono", "Courier New", monospace`;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'center';

    this.drawAsciiRows(this.bell, 0, metrics, motion, 1);
    this.drawAsciiRows(this.skirt, this.bell.length * metrics.lineHeight, metrics, motion, 0.9);
    this.drawTentacles(metrics, motion);

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
    color: '#3f4244',
    opacity: 0.7,
    speed: 1,
    scale: 1
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountJellyfish);
} else {
  mountJellyfish();
}
