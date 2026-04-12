class ASCIIJellyfish {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    
    // Configuration
    this.color = options.color || '#6366f1'; // Indigo
    this.opacity = options.opacity || 0.08;
    this.speed = options.speed || 0.5;
    this.scale = options.scale || 1;
    
    // Jellyfish state
    this.jellyfish = {
      x: this.width / 2,
      y: this.height / 3,
      vx: 0.3 * this.speed,
      vy: 0.1 * this.speed,
      wobble: 0,
      wobbleSpeed: 0.02,
      tentacleWave: 0
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
  
  getJellyfishASCII() {
    // ASCII art jellyfish (dome + tentacles)
    const dome = [
      "    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      " ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      " ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
      "  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
    ];
    
    const tentacles = [
      "   ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░",
      "   ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░",
      "   ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░",
      "   ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░",
      "   ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░"
    ];
    
    return { dome, tentacles };
  }
  
  drawJellyfish(x, y) {
    const { dome, tentacles } = this.getJellyfishASCII();
    const fontSize = 9 * this.scale;
    
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${fontSize}px monospace`;
    this.ctx.textBaseline = 'top';
    
    // Draw dome
    dome.forEach((line, i) => {
      this.ctx.fillText(line, x - (line.length * fontSize * 0.5), y + (i * fontSize * 0.8));
    });
    
    // Draw tentacles with wave effect
    tentacles.forEach((line, i) => {
      const waveOffset = Math.sin(this.jellyfish.tentacleWave + i * 0.5) * 15 * this.scale;
      this.ctx.fillText(
        line,
        x - (line.length * fontSize * 0.5) + waveOffset,
        y + (dome.length * fontSize * 0.8) + (i * fontSize * 0.8)
      );
    });
    
    this.ctx.restore();
  }
  
  updatePosition() {
    // Gentle floating motion with bounds
    this.jellyfish.x += this.jellyfish.vx;
    this.jellyfish.y += Math.sin(this.time * 0.01) * 0.1 * this.speed;
    
    // Bounce off edges
    if (this.jellyfish.x < 100) this.jellyfish.vx = Math.abs(this.jellyfish.vx);
    if (this.jellyfish.x > this.width - 100) this.jellyfish.vx = -Math.abs(this.jellyfish.vx);
    if (this.jellyfish.y < 50) this.jellyfish.vy = Math.abs(this.jellyfish.vy);
    if (this.jellyfish.y > this.height - 150) this.jellyfish.vy = -Math.abs(this.jellyfish.vy);
    
    // Update animation values
    this.jellyfish.tentacleWave += 0.05;
    this.jellyfish.wobble += this.jellyfish.wobbleSpeed;
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
    new ASCIIJellyfish('jellyfishCanvas', {
      color: '#6366f1',      // Indigo (change to match your theme)
      opacity: 0.08,          // Subtle background
      speed: 0.5,             // Slow movement
      scale: 1                // Adjust size if needed
    });
  });
} else {
  new ASCIIJellyfish('jellyfishCanvas', {
    color: '#6366f1',
    opacity: 0.08,
    speed: 0.5,
    scale: 1
  });
}