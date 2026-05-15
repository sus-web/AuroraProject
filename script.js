// ============================================================
//  AURORA — Interactive Layer
// ============================================================

// === Loader ===
const loader = document.getElementById('loader');
const loaderFill = document.querySelector('.loader-fill');
const loaderPercent = document.querySelector('.loader-percent');

let progress = 0;
const loaderInterval = setInterval(() => {
    progress += Math.random() * 12;
    if (progress >= 100) {
        progress = 100;
        clearInterval(loaderInterval);
        loaderFill.style.width = '100%';
        loaderPercent.textContent = '100%';
        setTimeout(() => {
            loader.classList.add('done');
            document.body.style.overflow = '';
        }, 500);
    } else {
        loaderFill.style.width = progress + '%';
        loaderPercent.textContent = Math.floor(progress) + '%';
    }
}, 100);

document.body.style.overflow = 'hidden';

// === Theme Toggle ===
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});

// === Scroll Progress ===
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (window.scrollY / max) * 100;
    scrollProgress.style.width = percent + '%';
}, { passive: true });

// === Custom Cursor + Spotlight + Trail ===
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const spotlight = document.getElementById('spotlight');

let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let followerX = mouseX, followerY = mouseY;
let spotX = mouseX, spotY = mouseY;
let lastTrailTime = 0;
let lastTrailX = mouseX, lastTrailY = mouseY;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';

    // Trail частица — спавним если прошло достаточно времени и курсор сдвинулся
    const now = performance.now();
    const dx = mouseX - lastTrailX;
    const dy = mouseY - lastTrailY;
    const dist2 = dx * dx + dy * dy;
    if (now - lastTrailTime > 35 && dist2 > 25) {
        spawnTrail(mouseX, mouseY);
        lastTrailTime = now;
        lastTrailX = mouseX;
        lastTrailY = mouseY;
    }
});

function spawnTrail(x, y) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    // лёгкое случайное смещение и размер для живости
    const size = 4 + Math.random() * 4;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    const palette = ['#a78bfa', '#f472b6', '#60a5fa', '#34d399'];
    const color = palette[Math.floor(Math.random() * palette.length)];
    dot.style.background = color;
    dot.style.boxShadow = `0 0 ${size * 2.5}px ${color}`;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 900);
}

function animateCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';

    spotX += (mouseX - spotX) * 0.08;
    spotY += (mouseY - spotY) * 0.08;
    if (spotlight) {
        spotlight.style.left = spotX + 'px';
        spotlight.style.top = spotY + 'px';
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

const interactives = document.querySelectorAll(
    'a, button, input, .bento-item, .pricing-card, .testimonial, summary'
);
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        follower.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        follower.classList.remove('active');
    });
});

// === Magnetic Buttons ===
const magnets = document.querySelectorAll('[data-magnetic]');
magnets.forEach(el => {
    let bx = 0, by = 0, tx = 0, ty = 0;

    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        tx = (e.clientX - cx) * 0.25;
        ty = (e.clientY - cy) * 0.35;
    });

    function loop() {
        bx += (tx - bx) * 0.15;
        by += (ty - by) * 0.15;
        el.style.transform = `translate(${bx}px, ${by}px)`;
        requestAnimationFrame(loop);
    }
    loop();
});

// === Navigation scroll effect ===
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// === Reveal on scroll ===
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// === Counter animation ===
const counters = document.querySelectorAll('.stat-value');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count);
            const duration = 2000;
            const start = performance.now();
            function update(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target);
                if (progress < 1) requestAnimationFrame(update);
                else el.textContent = target;
            }
            requestAnimationFrame(update);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// === Parallax blobs ===
const blobs = document.querySelectorAll('.blob');
let pTargetX = 0, pTargetY = 0, pCurX = 0, pCurY = 0;

document.addEventListener('mousemove', (e) => {
    pTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
    pTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function parallax() {
    pCurX += (pTargetX - pCurX) * 0.05;
    pCurY += (pTargetY - pCurY) * 0.05;
    blobs.forEach((blob, i) => {
        const depth = (i + 1) * 15;
        blob.style.translate = `${pCurX * depth}px ${pCurY * depth}px`;
    });
    requestAnimationFrame(parallax);
}
parallax();

// === Smooth scroll for anchors ===
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// === Tilt effect on cards ===
document.querySelectorAll('.bento-item, .pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rx = ((y - cy) / cy) * -4;
        const ry = ((x - cx) / cx) * 4;
        const baseTransform = card.classList.contains('featured')
            ? 'scale(1.03) translateY(-8px)'
            : 'translateY(-8px)';
        card.style.transform = `${baseTransform} perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;

        const glow = card.querySelector('.feature-glow');
        if (glow) {
            glow.style.left = (x - 125) + 'px';
            glow.style.top = (y - 125) + 'px';
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// === FAQ accordion — single open ===
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            faqItems.forEach(other => {
                if (other !== item) other.open = false;
            });
        }
    });
});

// === CTA form ===
const ctaForm = document.getElementById('ctaForm');
if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = ctaForm.querySelector('button');
        btn.innerHTML = '<span>Готово ✓</span>';
        ctaForm.querySelector('input').value = '';
        setTimeout(() => {
            btn.innerHTML = '<span>Подписаться</span>';
        }, 2500);
    });
}

// ============================================================
//  Finale — fade-переход в финальную сцену
// ============================================================
(function setupFinale() {
    const finale = document.getElementById('finale');
    const footer = document.querySelector('.footer');
    if (!finale) return;

    // IntersectionObserver — добавляет класс in-view когда секция занимает >40%
    const finaleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0.35) {
                finale.classList.add('in-view');
            }
            // не убираем класс обратно — финал должен оставаться
        });
    }, { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] });

    finaleObserver.observe(finale);

    // Дополнительно: footer плавно затухает по мере приближения финала,
    // создаёт эффект "перехода" между ними.
    function onScroll() {
        const rect = finale.getBoundingClientRect();
        const vh = window.innerHeight;

        // когда секция вот-вот появится снизу (rect.top ≈ vh) — footer полностью видим
        // когда секция уже сверху (rect.top ≈ 0) — footer затух
        const enter = vh + 100;       // начало fade
        const settled = -vh * 0.2;    // конец fade
        const range = enter - settled;
        let p = (enter - rect.top) / range;
        p = Math.max(0, Math.min(1, p));

        if (footer) {
            footer.style.opacity = String(1 - p * 0.85);
            footer.style.transform = `translateY(${-p * 30}px)`;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Останавливаем canvas-частицы пока финал в кадре, чтобы не мешали
    // (просто понижаем opacity самого canvas через body класс)
    const finaleVis = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            document.body.classList.toggle('finale-active', entry.intersectionRatio > 0.6);
        });
    }, { threshold: [0.6] });
    finaleVis.observe(finale);
})();

// ============================================================
//  Konami code easter egg
// ============================================================
(function konami() {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    window.addEventListener('keydown', (e) => {
        if (e.key === seq[idx]) {
            idx++;
            if (idx === seq.length) {
                document.body.style.animation = 'rainbow 5s linear infinite';
                const s = document.createElement('style');
                s.textContent = `@keyframes rainbow { 0%,100%{filter:hue-rotate(0deg)} 50%{filter:hue-rotate(360deg)} }`;
                document.head.appendChild(s);
                idx = 0;
            }
        } else { idx = 0; }
    });
})();
