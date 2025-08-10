// Particle Animation System
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            return;
        }
        
        console.log('ParticleSystem initialized successfully!');
        
        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 30 : 50; // Fewer particles on mobile
        this.colors = [
            'rgba(255, 0, 0, 1.0)',     // Red (full opacity)
            'rgba(147, 0, 211, 0.9)',   // Purple
            'rgba(255, 20, 147, 0.9)',  // Deep Pink
            'rgba(220, 20, 60, 0.9)',   // Crimson
            'rgba(255, 0, 255, 0.9)',   // Magenta
            'rgba(138, 43, 226, 0.9)'   // Blue Violet
        ];
        
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        this.init();
        this.animate();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.createParticles();
        this.addMouseInteraction();
    }
    
    addMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;
        
        this.canvas.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });
        
        // Store mouse position for particle interaction
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        
        // Add scroll interaction
        window.addEventListener('scroll', () => {
            this.scrollY = window.pageYOffset;
        });
        
        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.paused = true;
            } else {
                this.paused = false;
            }
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Adjust particle count based on screen size
        const newParticleCount = window.innerWidth < 768 ? 30 : 
                                window.innerWidth < 1024 ? 40 : 50;
        
        if (newParticleCount !== this.particleCount) {
            this.particleCount = newParticleCount;
            this.particles = [];
            this.createParticles();
        }
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                targetColor: this.colors[Math.floor(Math.random() * this.colors.length)],
                opacity: Math.random() * 0.8 + 0.5,
                life: Math.random() * 100 + 50,
                fadeDirection: Math.random() > 0.5 ? 1 : -1,
                fadeSpeed: Math.random() * 0.02 + 0.01,
                colorTransition: 0
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Mouse interaction - particles slightly move away from mouse
            if (this.mouseX > 0 && this.mouseY > 0) {
                const dx = particle.x - this.mouseX;
                const dy = particle.y - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const force = (150 - distance) / 150 * 0.3;
                    particle.vx += (dx / distance) * force;
                    particle.vy += (dy / distance) * force;
                }
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Subtle parallax effect on scroll
            if (this.scrollY) {
                const parallaxSpeed = 0.1;
                particle.y += this.scrollY * parallaxSpeed * 0.01;
            }
            
            // Add some natural movement
            particle.vx += (Math.random() - 0.5) * 0.01;
            particle.vy += (Math.random() - 0.5) * 0.01;
            
            // Limit velocity
            particle.vx = Math.max(-1, Math.min(1, particle.vx));
            particle.vy = Math.max(-1, Math.min(1, particle.vy));
            
            // Bounce off edges
            if (particle.x <= 0 || particle.x >= this.canvas.width) {
                particle.vx *= -0.8;
            }
            if (particle.y <= 0 || particle.y >= this.canvas.height) {
                particle.vy *= -0.8;
            }
            
            // Keep particles within bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Update life and opacity
            particle.life--;
            
            // Fade effect
            particle.opacity += particle.fadeDirection * particle.fadeSpeed;
            if (particle.opacity <= 0.2 || particle.opacity >= 0.9) {
                particle.fadeDirection *= -1;
                particle.opacity = Math.max(0.2, Math.min(0.9, particle.opacity));
            }
            
            // Color transition
            particle.colorTransition += 0.01;
            if (particle.colorTransition >= 1) {
                particle.color = particle.targetColor;
                particle.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                particle.colorTransition = 0;
            }
            
            if (particle.life <= 0) {
                particle.life = Math.random() * 100 + 50;
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
                particle.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                particle.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                particle.opacity = Math.random() * 0.8 + 0.5;
                particle.fadeDirection = Math.random() > 0.5 ? 1 : -1;
                particle.fadeSpeed = Math.random() * 0.02 + 0.01;
                particle.colorTransition = 0;
            }
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            
            // Smooth color blending
            const currentColor = this.interpolateColor(particle.color, particle.targetColor, particle.colorTransition);
            
            // Add subtle glow effect
            this.ctx.shadowColor = currentColor;
            this.ctx.shadowBlur = particle.size * 2;
                    this.ctx.globalAlpha = particle.opacity;
        
        // Add glow effect for all particles
        this.ctx.shadowColor = currentColor;
        this.ctx.shadowBlur = particle.size * 2;
        
        this.ctx.fillStyle = currentColor;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Draw connecting lines between nearby particles
        this.drawConnections();
    }
    
    interpolateColor(color1, color2, factor) {
        // Simple color interpolation for rgba strings
        const rgba1 = this.parseRGBA(color1);
        const rgba2 = this.parseRGBA(color2);
        
        const r = Math.round(rgba1.r + (rgba2.r - rgba1.r) * factor);
        const g = Math.round(rgba1.g + (rgba2.g - rgba1.g) * factor);
        const b = Math.round(rgba1.b + (rgba2.b - rgba1.b) * factor);
        const a = rgba1.a + (rgba2.a - rgba1.a) * factor;
        
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    parseRGBA(rgbaString) {
        const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: match[4] ? parseFloat(match[4]) : 1
            };
        }
        return { r: 0, g: 0, b: 0, a: 1 };
    }
    
    drawConnections() {
        this.ctx.strokeStyle = 'rgba(182, 145, 33, 0.08)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = Math.max(0, (120 - distance) / 120) * 0.1;
                    this.ctx.strokeStyle = `rgba(182, 145, 33, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate(currentTime) {
        if (!this.paused && currentTime - this.lastTime >= this.frameInterval) {
            this.updateParticles();
            this.drawParticles();
            this.lastTime = currentTime;
        }
        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize Particle System when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ParticleSystem...');
    try {
        new ParticleSystem();
        console.log('ParticleSystem created successfully!');
    } catch (error) {
        console.error('Error creating ParticleSystem:', error);
    }
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .section-title, .calendar-subtitle');
    animatedElements.forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });
});

// Calendly integration
function openCalendly() {
    // If Calendly widget is loaded, open it
    if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({
            url: 'https://calendly.com/your-calendly-link'
        });
    } else {
        // Fallback: scroll to calendar section
        document.querySelector('#contact').scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Add loading animation to service cards on hover
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect for floating elements
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.element');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add typing effect to hero title (optional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        // Uncomment the next line if you want the typing effect
        // typeWriter(heroTitle, originalText, 50);
    }
});

// Add scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(45deg, #FFD700, #FFA500);
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress
createScrollProgress();

// Add loading screen
function showLoadingScreen() {
    const loader = document.createElement('div');
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        ">
            <div style="
                width: 50px;
                height: 50px;
                border: 3px solid #333;
                border-top: 3px solid #FFD700;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loader);
    
    // Remove loader after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 200);
        }, 300);
    });
}

// Initialize loading screen
showLoadingScreen();

// Initialize Particle System when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ParticleSystem...');
    try {
        new ParticleSystem();
        console.log('ParticleSystem created successfully!');
    } catch (error) {
        console.error('Error creating ParticleSystem:', error);
    }
}); 