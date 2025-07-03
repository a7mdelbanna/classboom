import { useEffect, useRef } from 'react';

interface ConfettiProps {
  primaryColor?: string;
  secondaryColor?: string;
  duration?: number;
}

export function Confetti({ 
  primaryColor = '#FF6B35', 
  secondaryColor = '#4169E1',
  duration = 3000 
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      angle: number;
      angularVelocity: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = -20;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 3 + 2;
        this.size = Math.random() * 8 + 4;
        this.color = Math.random() > 0.5 ? primaryColor : secondaryColor;
        this.angle = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.angle += this.angularVelocity;
        
        // Add some air resistance
        this.vx *= 0.99;
        this.vy *= 0.99;
      }
      
      draw() {
        if (!ctx) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        
        // Draw a rectangle (confetti piece)
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        ctx.restore();
      }
      
      isOffScreen() {
        return this.y > (canvas?.height || window.innerHeight) + 20;
      }
    }
    
    const particles: Particle[] = [];
    let animationId: number;
    let startTime = Date.now();
    
    // Create initial burst of particles
    for (let i = 0; i < 150; i++) {
      setTimeout(() => {
        particles.push(new Particle());
      }, i * 10);
    }
    
    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();
        
        if (particle.isOffScreen()) {
          particles.splice(i, 1);
        }
      }
      
      // Continue spawning particles for the duration
      const elapsed = Date.now() - startTime;
      if (elapsed < duration && Math.random() < 0.3) {
        particles.push(new Particle());
      }
      
      // Continue animation if there are particles or within duration
      if (particles.length > 0 || elapsed < duration) {
        animationId = requestAnimationFrame(animate);
      }
    }
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [primaryColor, secondaryColor, duration]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}