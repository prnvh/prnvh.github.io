class AnimatedJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    
    // Configuration
    this.color = options.color || '#6366f1';
    this.opacity = options.opacity || 0.06;
    this.speed = options.speed || 0.5;
    this.scale = options.scale || 1;
    
    // Jellyfish state
    this.jellyfish = {
      x: this.width / 2,
      y: this.height / 3,
      vx: 0.2 * this.speed,
      vy: 0.05 * this.speed,
      wobbleTime: 0,
      bellPulse: 0,
      tentacleWaves: [0, 0, 0, 0, 0, 0, 0, 0] // One wave per tentacle
    };
    
    this.time = 0;
    this.setupCanvas();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupCanvas() {
    this.ctx.fillStyle = 'transparent';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  handleResize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }
  
  // Create a more detailed jellyfish bell (dome)
  getBell() {
    return [
      "       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       ",
      "     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     ",
      "   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ",
      "  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ",
      " ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ",
      " ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      " ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ "
    ];
  }
  
  // Create flowing tentacles that can wave
  getTentacles(waveOffsets) {
    const tentacleCount = 8;
    const tentacles = [];
    
    // Create 8 tentacles with varying lengths
    const lengths = [12, 14, 15, 14, 14, 15, 14, 12];
    
    for (let t = 0; t < tentacleCount; t++) {
      const tentacle = [];
      const length = lengths[t];
      const waveOffset = waveOffsets[t] || 0;
      
      for (let i = 0; i < length; i++) {
        // Create wave effect - more pronounced at the bottom
        const waveIntensity = (i / length) * 8; // Increases toward tip
        const wave = Math.sin(waveOffset + i * 0.3) * waveIntensity;
        
        // Create tentacle taper - thinner at the tip
        const thickness = Math.max(0, 1 - (i / length) * 0.6);
        const char = thickness > 0.6 ? '░' : '▓';
        
        // Spacing for wave effect
        const spacing = ' '.repeat(Math.max(0, Math.floor(wave)));
        tentacle.push(spacing + char);
      }
      
      tentacles.push(tentacle);
    }
    
    return tentacles;
  }
  
  drawJellyfish(x, y) {
    const fontSize = 8 * this.scale;
    const bell = this.getBell();
    
    // Get tentacles with current wave animations
    const tentacles = this.getTentacles(this.jellyfish.tentacleWaves);
    
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${fontSize}px monospace`;
    this.ctx.textBaseline = 'top';
    
    // Draw bell (dome)
    let bellHeight = 0;
    bell.forEach((line, i) => {
      const lineX = x - (line.length * fontSize * 0.5) / 2;
      const lineY = y + (i * fontSize * 0.7);
      this.ctx.fillText(line, lineX, lineY);
      bellHeight = i * fontSize * 0.7;
    });
    
    // Draw tentacles
    const tentacleStartY = y + bellHeight + fontSize;
    const tentacleSpacing = (bell[0].length * fontSize * 0.5) / (tentacles.length - 1);
    
    tentacles.forEach((tentacle, t) => {
      const tentacleX = x - (bell[0].length * fontSize * 0.5) / 2 + (t * tentacleSpacing);
      
      tentacle.forEach((char, i) => {
        const charY = tentacleStartY + (i * fontSize * 0.6);
        this.ctx.fillText(char, tentacleX, charY);
      });
    });
    
    this.ctx.restore();
  }
  
  updatePosition() {
    // Gentle floating motion
    this.jellyfish.x += this.jellyfish.vx;
    this.jellyfish.y += Math.sin(this.time * 0.008) * 0.15 * this.speed;
    
    // Bounce off edges with smooth transition
    if (this.jellyfish.x < 120) {
      this.jellyfish.vx = Math.abs(this.jellyfish.vx) * 0.9;
    }
    if (this.jellyfish.x > this.width - 120) {
      this.jellyfish.vx = -Math.abs(this.jellyfish.vx) * 0.9;
    }
    if (this.jellyfish.y < 80) {
      this.jellyfish.vy = Math.abs(this.jellyfish.vy) * 0.9;
    }
    if (this.jellyfish.y > this.height - 200) {
      this.jellyfish.vy = -Math.abs(this.jellyfish.vy) * 0.9;
    }
    
    // Update tentacle waves - each with different phase
    this.jellyfish.tentacleWaves.forEach((_, i) => {
      this.jellyfish.tentacleWaves[i] = this.time * 0.05 + (i * Math.PI / 4);
    });
    
    // Bell pulsing effect
    this.jellyfish.bellPulse = Math.sin(this.time * 0.02) * 0.5 + 0.5;
    
    this.time++;
  }
  
  animate() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Update and draw
    this.updatePosition();
    this.drawJellyfish(this.jellyfish.x, this.jellyfish.y);
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('jellyfishCanvas');
    if (canvas) {
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '-1';
      canvas.style.pointerEvents = 'none';
      canvas.style.display = 'block';
      canvas.style.margin = '0';
      canvas.style.padding = '0';
    }
    
    new AnimatedJellyfish('jellyfishCanvas', {
      color: '#6366f1',      // Indigo - change to match your theme
      opacity: 0.06,         // Very subtle (increase to 0.10 for more visibility)
      speed: 0.5,            // Movement speed
      scale: 1               // Size multiplier
    });
  });
} else {
  const canvas = document.getElementById('jellyfishCanvas');
  if (canvas) {
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';
    canvas.style.margin = '0';
    canvas.style.padding = '0';
  }
  
  new AnimatedJellyfish('jellyfishCanvas', {
    color: '#6366f1',
    opacity: 0.06,
    speed: 0.5,
    scale: 1
  });
}