/* ==========================================================================
   Monochrome Interactive Portfolio Engine - Artemios Zouga
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Environment Configuration (.env loader) --- */
  let envConfig = {};
  async function loadEnv() {
    try {
      const response = await fetch('.env');
      if (response.ok) {
        const text = await response.text();
        text.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valParts] = trimmed.split('=');
            if (key) {
              envConfig[key.trim()] = valParts.join('=').trim();
            }
          }
        });
      }
    } catch (e) {
      console.warn('Unable to load .env configuration file:', e);
    }
  }
  loadEnv();

  /* --- 1. Spotlight Mouse Glow Effect & 3D Tilt Card --- */
  const cursorGlow = document.getElementById('cursor-glow');
  const tiltCard = document.getElementById('tilt-card');

  window.addEventListener('mousemove', (e) => {
    // Move spotlight glow
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';

    // 3D Card tilt effect calculation
    if (tiltCard) {
      const rect = tiltCard.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;

      const angleX = (e.clientY - cardY) / 20;
      const angleY = (cardX - e.clientX) / 20;

      // Only tilt when mouse is nearby
      const dist = Math.hypot(e.clientX - cardX, e.clientY - cardY);
      if (dist < 600) {
        tiltCard.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
      } else {
        tiltCard.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
      }
    }
  });

  /* --- 2. Silver Particles Background Engine --- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = Math.floor(width < 768 ? 40 : 85);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.6 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      const theme = document.documentElement.getAttribute('data-theme');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      if (theme === 'purple') {
        ctx.fillStyle = `rgba(192, 132, 252, ${this.alpha})`;
      } else if (theme === 'orange') {
        ctx.fillStyle = `rgba(251, 146, 60, ${this.alpha})`;
      } else if (theme === 'darkblue') {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.alpha})`;
      } else if (theme === 'red') {
        ctx.fillStyle = `rgba(248, 113, 113, ${this.alpha})`;
      } else if (theme === 'light') {
        ctx.fillStyle = `rgba(15, 23, 42, ${this.alpha * 0.6})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      }
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const theme = document.documentElement.getAttribute('data-theme');
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          if (theme === 'purple') {
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.25 * (1 - dist / 130)})`;
          } else if (theme === 'orange') {
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.25 * (1 - dist / 130)})`;
          } else if (theme === 'darkblue') {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 * (1 - dist / 130)})`;
          } else if (theme === 'red') {
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.25 * (1 - dist / 130)})`;
          } else if (theme === 'light') {
            ctx.strokeStyle = `rgba(15, 23, 42, ${0.15 * (1 - dist / 130)})`;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 130)})`;
          }
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  /* --- 3. Animated Number Counters on Scroll --- */
  const counters = document.querySelectorAll('.counter');
  const floatCounters = document.querySelectorAll('.counter-float');
  let animated = false;

  function animateCounters() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const sectionTop = aboutSection.getBoundingClientRect().top;
    if (sectionTop < window.innerHeight - 100 && !animated) {
      animated = true;

      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = target / 30;

        const updateCount = () => {
          count += speed;
          if (count < target) {
            counter.innerText = Math.ceil(count) + '+';
            setTimeout(updateCount, 40);
          } else {
            counter.innerText = target + '+';
          }
        };
        updateCount();
      });

      floatCounters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        let count = 0;
        const speed = target / 30;

        const updateFloat = () => {
          count += speed;
          if (count < target) {
            counter.innerText = count.toFixed(1) + '%';
            setTimeout(updateFloat, 40);
          } else {
            counter.innerText = target + '%';
          }
        };
        updateFloat();
      });
    }
  }

  window.addEventListener('scroll', animateCounters);

  /* --- 4. Typewriter Effect --- */
  const typedTextSpan = document.getElementById('typed-text');
  const roles = [
    "Aspiring Programmer",
    "IBA Student @ Erasmus Univ. Rotterdam",
    "Learning Python & JavaScript",
    "Upcoming Game Creator"
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400;
    }

    setTimeout(typeEffect, typeSpeed);
  }

  typeEffect();

  /* --- 5. Navbar & Progress Bar Engine --- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';

    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  /* Mobile Navigation Menu */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksList = document.getElementById('nav-links');

  mobileMenuBtn.addEventListener('click', () => {
    navLinksList.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinksList.classList.contains('active')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinksList.classList.remove('active');
      mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  /* --- 6. Theme Switcher (Dark / Light / Purple / Orange / Dark Blue / Red) --- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeOptionBtns = document.querySelectorAll('.theme-option-btn');
  const savedTheme = localStorage.getItem('theme') || 'dark';

  const themeOrder = ['dark', 'light', 'purple', 'orange', 'darkblue', 'red'];
  const themeNames = {
    dark: 'Monochrome Dark',
    light: 'Monochrome Platinum Light',
    purple: 'Cyber Violet Purple',
    orange: 'Sunset Amber Orange',
    darkblue: 'Deep Ocean Dark Blue',
    red: 'Crimson Ruby Red'
  };

  function applyTheme(newTheme, notify = false) {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update active class on dropdown swatches
    themeOptionBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-val') === newTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (notify) {
      showToast(`Switched to ${themeNames[newTheme] || newTheme} theme`);
    }
  }

  applyTheme(savedTheme, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const currentIndex = themeOrder.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      const nextTheme = themeOrder[nextIndex];
      applyTheme(nextTheme, true);
    });
  }

  themeOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.getAttribute('data-theme-val');
      applyTheme(targetTheme, true);
    });
  });

  /* --- 7. Dynamic Skills Display --- */
  const skillData = {
    frontend: [
      { name: 'JavaScript (Fundamentals & ES6)', level: 45 },
      { name: 'HTML5 & CSS3 Layouts', level: 60 },
      { name: 'DOM Manipulation & Interactivity', level: 50 },
      { name: 'HTML5 Canvas 2D Game Basics', level: 40 }
    ],
    backend: [
      { name: 'Python (Basics & Data Structures)', level: 50 },
      { name: 'Pygame & Game Loops', level: 45 },
      { name: 'Object-Oriented Programming (OOP)', level: 40 },
      { name: 'Git & Version Control', level: 55 }
    ],
    tools: [
      { name: 'VS Code & Dev Tools', level: 65 },
      { name: 'International Business Strategy', level: 75 },
      { name: 'Problem Solving & Logic', level: 70 },
      { name: 'Game Design & Storyboarding', level: 60 }
    ]
  };

  const skillsContainer = document.getElementById('skills-list');
  const skillTabs = document.querySelectorAll('.skill-tab-btn');

  function renderSkills(category) {
    skillsContainer.innerHTML = '';
    const skills = skillData[category] || skillData.frontend;

    skills.forEach(skill => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      item.innerHTML = `
        <div class="skill-info">
          <span>${skill.name}</span>
          <span>${skill.level}%</span>
        </div>
        <div class="skill-bar-bg">
          <div class="skill-bar-fill" style="width: 0%"></div>
        </div>
      `;
      skillsContainer.appendChild(item);

      setTimeout(() => {
        item.querySelector('.skill-bar-fill').style.width = skill.level + '%';
      }, 50);
    });
  }

  renderSkills('frontend');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSkills(tab.getAttribute('data-category'));
    });
  });

  /* --- 8. Dynamic Portfolio Grid & Projects --- */
  const projects = [
    {
      id: 1,
      title: "Interactive Personal Portfolio",
      status: "Completed",
      category: "completed",
      icon: "fa-laptop-code",
      tags: ["JavaScript", "HTML5", "CSS3", "Canvas API"],
      desc: "My first completed web project! Designed in monochrome black, silver & purple with interactive particles and dynamic theme switching.",
      details: "Built from scratch while learning JavaScript and web design. Features animated particle canvas physics, custom 3D card tilt effects, theme toggling, and asynchronous form dispatch."
    },
    {
      id: 2,
      title: "ShadowQuest 2D RPG",
      status: "Upcoming",
      category: "gaming",
      icon: "fa-gamepad",
      tags: ["Python", "Pygame", "Tilemaps", "2D Physics"],
      desc: "Upcoming 2D fantasy RPG built with Python & Pygame featuring custom tilemaps, inventory mechanics, and turn-based combat.",
      details: "Currently designing the core game loop and engine architecture in Python using Pygame. Will feature retro pixel art graphics, sprite animations, and custom audio management."
    },
    {
      id: 3,
      title: "Neon Cyber Runner",
      status: "Upcoming",
      category: "gaming",
      icon: "fa-dice-d20",
      tags: ["JavaScript", "Canvas API", "HTML5", "Game Loops"],
      desc: "Upcoming fast-paced browser runner game written in vanilla JavaScript with HTML5 Canvas 2D rendering.",
      details: "In early development phase. Focuses on smooth 60fps canvas game rendering, obstacle collision detection, dynamic difficulty scaling, and high score tracking."
    },
    {
      id: 4,
      title: "Aegean Mythos Adventure",
      status: "Upcoming",
      category: "gaming",
      icon: "fa-shield-halved",
      tags: ["Python", "OOP Design", "Narrative Engine", "Game Logic"],
      desc: "Upcoming narrative-driven adventure game inspired by ancient Greek mythology, strategic choices, and branching decision trees.",
      details: "Planning object-oriented storyline branching, save state persistence, character inventory crafting, and interactive dialogue engines."
    }
  ];

  const projectsGrid = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderProjects(filter = 'all') {
    projectsGrid.innerHTML = '';
    const filtered = filter === 'all' 
      ? projects 
      : projects.filter(p => p.category === filter);

    filtered.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-banner">
          <i class="fa-solid ${project.icon}"></i>
          <span class="project-status-badge ${project.status.toLowerCase()}">${project.status}</span>
          <div class="project-overlay">
            <div class="overlay-btn view-details-btn" data-id="${project.id}" title="View Details">
              <i class="fa-solid fa-eye"></i>
            </div>
            <a href="https://github.com" target="_blank" class="overlay-btn" title="View Source Code">
              <i class="fa-brands fa-github"></i>
            </a>
          </div>
        </div>
        <div class="project-content">
          <div class="project-tags">
            ${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.desc}</p>
        </div>
      `;
      projectsGrid.appendChild(card);
    });

    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        openProjectModal(id);
      });
    });
  }

  renderProjects('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.getAttribute('data-filter'));
    });
  });

  /* --- 9. Modal Functionality --- */
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  function openProjectModal(id) {
    const p = projects.find(item => item.id === id);
    if (!p) return;

    modalBody.innerHTML = `
      <div style="font-size: 2.5rem; color: #ffffff; margin-bottom: 1rem;">
        <i class="fa-solid ${p.icon}"></i>
      </div>
      <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.8rem; color: var(--text-main);">${p.title}</h2>
      <div class="project-tags" style="margin-bottom: 1.2rem;">
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; margin-bottom: 1.8rem;">
        ${p.details}
      </p>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <a href="https://github.com" target="_blank" class="btn btn-primary">
          <i class="fa-brands fa-github"></i> Source Code
        </a>
        <a href="#contact" class="btn btn-secondary" onclick="document.getElementById('project-modal').classList.remove('active')">
          <i class="fa-solid fa-comments"></i> Inquire Project
        </a>
      </div>
    `;
    modal.classList.add('active');
  }

  modalClose.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  /* --- 10. Contact Form Submission Engine (Strictly Discord Webhook) --- */
  const contactForm = document.getElementById('contact-form');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!name || !email || !message) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const webhookUrl = (envConfig.DISCORD_WEBHOOK_URL || (typeof CONFIG !== 'undefined' && CONFIG.DISCORD_WEBHOOK_URL) || '').trim();

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      showToast('Discord Webhook URL is not configured in .env file!', 'error');
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending to Discord...`;
    submitBtn.disabled = true;

    try {
      const discordPayload = {
        username: "Portfolio Inquiry Bot",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/919/919851.png",
        embeds: [
          {
            title: `📩 New Inquiry: ${subject || 'General Contact'}`,
            color: 0xffffff, // Metallic Silver / White Embed Accent
            fields: [
              { name: "👤 Sender Name", value: name, inline: true },
              { name: "✉️ Email Address", value: email, inline: true },
              { name: "📌 Subject", value: subject || "N/A", inline: false },
              { name: "💬 Message Content", value: message, inline: false }
            ],
            footer: { text: "Artemios Zouga Portfolio • Direct Discord Dispatch" },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (res.ok || res.status === 204) {
        showToast(`Thank you, ${name}! Your message has been sent to Discord!`);
        contactForm.reset();
      } else {
        showToast('Error sending message to Discord Webhook.', 'error');
      }
    } catch (err) {
      showToast('Failed to send message to Discord. Please check connection.', 'error');
    } finally {
      submitBtn.innerHTML = originalBtnHTML;
      submitBtn.disabled = false;
    }
  });

  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: #ffffff;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

});
