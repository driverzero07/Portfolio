(function() {
    // --- COMPONENT LOADER ---
    async function loadComponent(id, file) {
        try {
            const element = document.getElementById(id);
            if (!element) return;
            if (element.children.length > 0) return;
            const response = await fetch(file);
            const content = await response.text();
            if (element.children.length === 0) {
                element.innerHTML = content;
            }

            // Trigger a custom event so other scripts know the component is loaded
            window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { id } }));
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }

    async function initComponents() {
        await Promise.all([
            loadComponent('header-placeholder', 'header.html'),
            loadComponent('footer-placeholder', 'footer.html')
        ]);

        // Fix for sticky menu pill via JS
        const navPill = document.getElementById('desktop-nav');
        if (navPill) {
            navPill.style.position = 'fixed';
            navPill.style.top = '2.6rem';
            navPill.style.left = '50%';
            navPill.style.transform = 'translateX(-50%)';
            navPill.style.zIndex = '100';
        }

        // IMPORTANT: Initialize portfolio logic AFTER components are loaded
        initPortfolio();
    }

    // --- CUSTOM CURSOR LOGIC ---
    const cursor = document.getElementById("cursor");
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        if (cursor) {
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Lenis Smooth Scroll Initialization
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // ==================================================
    // LENIS + GSAP SCROLLTRIGGER INTEGRATION (CRITICAL!)
    // ==================================================
    if (typeof gsap !== 'undefined' && gsap.plugins.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        // Tell ScrollTrigger to use Lenis for scroll position
        ScrollTrigger.scrollerProxy(document.body, {
            scrollTop(value) {
                return arguments.length
                    ? lenis.scrollTo(value, { immediate: true })
                    : lenis.scroll;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: document.body.style.transform ? 'transform' : 'fixed'
        });

        // Sync Lenis scroll with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Refresh ScrollTrigger when Lenis resizes
        ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    }

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    // ==================================================
    // SMOOTH PAGE TRANSITION LOGIC
    // ==================================================
    function initSmoothTransitions() {
        const overlay = document.getElementById('transition-overlay');
        if (!overlay) return;

        // 1. Handle Outgoing Transition (Clicking a link)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');

            // Only trigger for internal pages (avoiding # anchors and external sites)
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                e.preventDefault();

                overlay.classList.remove('swipe-out');
                overlay.classList.add('swipe-in');

                setTimeout(() => {
                    window.location.href = href;
                }, 450); // Matches animation duration
            }
        });

        // 2. Handle Incoming Transition (On page load)
        window.addEventListener('DOMContentLoaded', () => {
            // Start with overlay already down
            overlay.style.transform = 'translateY(0%)';
            overlay.style.pointerEvents = 'all';

            // Trigger the swipe-out animation
            setTimeout(() => {
                overlay.classList.add('swipe-out');
                // Remove pointer events once it starts moving up
                overlay.style.pointerEvents = 'none';
            }, 100);
        });
    }

    initSmoothTransitions();

    // ==================================================
    // HERO IMAGE ANIMATION
    // ==================================================
    window.addEventListener('load', () => {
        const heroImage = document.getElementById('hero-image');
        if (heroImage) {
            setTimeout(() => {
                heroImage.classList.add('scale-one');
            }, 3700);
        }
    });

    // ==================================================
    // HERO TEXT REVEAL ANIMATION
    // ==================================================
    const initHeroTextReveal = () => {
        const revealHeadings = document.querySelectorAll('.reveal-text');
        revealHeadings.forEach((heading) => {
            const split = new SplitType(heading, { types: 'words' });
            gsap.from(split.words, {
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 3.9
            });
        });
    };

    // ==================================================
    // PRELOADER LOGIC
    // ==================================================
    const preloader = document.getElementById('preloader');
    const wordsTrack = document.getElementById('wordsTrack');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const portfolioContent = document.getElementById('portfolio-content');

    function getWordHeight() {
        const firstItem = wordsTrack.querySelector('.word-item');
        return firstItem ? firstItem.offsetHeight : 64;
    }

    function updateWordFromProgress(value) {
        const wordIndex = value >= 90 ? 3 : value >= 60 ? 2 : value >= 30 ? 1 : 0;
        const height = getWordHeight();
        wordsTrack.style.transition = 'transform 0.6s cubic-bezier(0.77, 0, 0.18, 1)';
        wordsTrack.style.transform = `translateY(-${wordIndex * height}px)`;
    }

    let progress = 0;
    let progressInterval = null;

    function simulateProgress() {
        progress = 0;
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
        updateWordFromProgress(0);

        progressInterval = setInterval(() => {
            const step = Math.floor(Math.random() * 8) + 3;
            progress = Math.min(progress + step, 100);
            progressFill.style.width = progress + '%';
            progressPercent.textContent = progress + '%';
            updateWordFromProgress(progress);

            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(hidePreloader, 300);
            }
        }, 180);
    }

    function hidePreloader() {
        const preloaderEl = document.getElementById('preloader');
        const portfolioContentEl = document.getElementById('portfolio-content');
        if (preloaderEl) preloaderEl.classList.add('hidden');
        document.body.style.overflow = '';
        if (portfolioContentEl) {
            portfolioContentEl.classList.remove('opacity-0');
            portfolioContentEl.classList.add('opacity-100');
        }
    }

    function initPreloader() {
        const preloaderEl = document.getElementById('preloader');
        if (!preloaderEl) return;

        const preloaderEnabled = localStorage.getItem('preloaderEnabled') !== 'false';
        if (!preloaderEnabled) {
            hidePreloader();
            return;
        }
        document.body.style.overflow = 'hidden';

        updateWordFromProgress(0);
        simulateProgress();
    }

    // ==================================================
    // PORTFOLIO LOGIC
    // ==================================================
    function initPortfolio() {
        const desktopNavBtns = document.querySelectorAll('.nav-btn');
        const mobileLinks = document.querySelectorAll('.mobile-link');

        function initMobileMenu() {
            const menuBtn = document.getElementById('menu-btn');
            const menuIcon = document.getElementById('menu-icon');
            const mobileMenu = document.getElementById('mobile-menu');

            if (!menuBtn || !mobileMenu || !menuIcon) return;

            function toggleMenu(forceClose = false) {
                const shouldOpen = forceClose ? false : !mobileMenu.classList.contains('active');
                if (shouldOpen) {
                    mobileMenu.classList.add('active');
                    mobileMenu.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
                    mobileMenu.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-xmark');
                } else {
                    mobileMenu.classList.remove('active');
                    mobileMenu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
                    mobileMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
                    menuIcon.classList.remove('fa-xmark');
                    menuIcon.classList.add('fa-bars');
                }
            }

            if (!menuBtn.dataset.menuListener) {
                menuBtn.dataset.menuListener = 'true';
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMenu();
                });
            }

            if (!document.body.dataset.outsideMenuListener) {
                document.body.dataset.outsideMenuListener = 'true';
                document.addEventListener('click', (e) => {
                    const curMenu = document.getElementById('mobile-menu');
                    const curBtn = document.getElementById('menu-btn');
                    if (curMenu && curMenu.classList.contains('active')) {
                        if (!curMenu.contains(e.target) && (!curBtn || !curBtn.contains(e.target))) {
                            toggleMenu(true);
                        }
                    }
                });
            }

            mobileLinks.forEach(link => {
                if (!link.dataset.closeListener) {
                    link.dataset.closeListener = 'true';
                    link.addEventListener('click', () => {
                        toggleMenu(true);
                    });
                }
            });
        }
        window.initMobileMenu = initMobileMenu;
        initMobileMenu();

        function setActiveTab(targetHref) {
            desktopNavBtns.forEach(btn => {
                if (btn.getAttribute('href') === targetHref) {
                    btn.className = 'nav-btn bg-slate-900 text-white font-medium text-sm px-5 py-1.5 rounded-full shadow transition-all duration-300';
                } else {
                    btn.className = 'nav-btn text-gray-800 hover:text-black font-medium text-sm px-5 py-1.5 rounded-full transition-all duration-300';
                }
            });
            mobileLinks.forEach(link => {
                if (link.getAttribute('href') === targetHref) {
                    link.className = 'mobile-link bg-black text-white py-2.5 rounded-xl font-semibold transition-all';
                } else {
                    link.className = 'mobile-link text-gray-800 py-2 hover:bg-gray-100 rounded-xl transition-all';
                }
            });
        }

        desktopNavBtns.forEach(btn => btn.addEventListener('click', () => setActiveTab(btn.getAttribute('href'))));
        mobileLinks.forEach(link => link.addEventListener('click', () => {
            setActiveTab(link.getAttribute('href'));
        }));

        const curvedTextPath = document.getElementById('curvedTextPath');
        let textOffset = -33.33;
        function animateCurvedText() {
            if (curvedTextPath) {
                textOffset += 0.06;
                if (textOffset >= 0) textOffset = -33.33;
                curvedTextPath.setAttribute('startOffset', textOffset + '%');
            }
            requestAnimationFrame(animateCurvedText);
        }
        requestAnimationFrame(animateCurvedText);

        const skillRows = document.querySelectorAll('.skill-row');
        function activateSkillRow(targetRow) {
            skillRows.forEach(row => {
                const isTarget = row === targetRow;
                const label = row.querySelector('.skill-label');
                const title = row.querySelector('.skill-title');
                const action = row.querySelector('.skill-action');
                const cards = row.querySelector('.mockup-cards');
                if (isTarget) {
                    row.classList.add('bg-brandRed', 'text-white', 'shadow-lg');
                    row.classList.remove('bg-transparent', 'text-gray-900', 'hover:bg-gray-50');
                    if (label) label.className = 'skill-label text-sm md:text-base font-medium text-white/90 w-16';
                    if (title) title.className = 'skill-title text-2xl sm:text-3xl md:text-4xl font-medium tracking-[-0.05em] text-white';
                    if (action) action.className = 'skill-action text-sm sm:text-base md:text-lg font-medium text-white';
                    if (cards) { cards.classList.remove('opacity-0', 'scale-95'); cards.classList.add('opacity-100', 'scale-100'); }
                } else {
                    row.classList.remove('bg-brandRed', 'text-white', 'shadow-lg');
                    row.classList.add('bg-transparent', 'text-gray-900', 'hover:bg-gray-50');
                    if (label) label.className = 'skill-label text-sm md:text-base font-medium text-gray-500 w-16';
                    if (title) title.className = 'skill-title text-2xl sm:text-3xl md:text-4xl font-medium tracking-[-0.05em] text-gray-900';
                    if (action) action.className = 'skill-action text-sm sm:text-base md:text-lg font-medium text-gray-900';
                    if (cards) { cards.classList.remove('opacity-100', 'scale-100'); cards.classList.add('opacity-0', 'scale-95'); }
                }
            });
        }
        skillRows.forEach(row => {
            row.addEventListener('mouseenter', () => activateSkillRow(row));
            row.addEventListener('click', () => activateSkillRow(row));
        });

        const projects = [
            { title: "Porsche 911", category: "Car Render", image: "https://raw.githubusercontent.com/driverzero07/Images/main/wide.webp" },
            { title: "Studio Headphones", category: "Product Visualization", image: "https://raw.githubusercontent.com/driverzero07/Images/main/Headphone_Mockup_1.webp" },
            { title: "Type Design", category: "Graphic Design & Typography", image: "https://raw.githubusercontent.com/driverzero07/Images/main/Type%20Design%20mockup.webp" },
            { title: "Coffee Brand Mockup", category: "Packaging & Branding", image: "https://raw.githubusercontent.com/driverzero07/Images/main/Coffee%20mockup.webp" },
            { title: "Luxury Product Concept", category: "3D Visualization", image: "https://raw.githubusercontent.com/driverzero07/Images/main/Luxury_Mockup_3.webp" }
        ];
        let currentProjectIndex = 0;
        const slideBg = document.getElementById('showcase-slide');
        const slideTitle = document.getElementById('slide-title');
        const slideCategory = document.getElementById('slide-category');
        const prevBtn = document.getElementById('prev-slide-btn');
        const nextBtn = document.getElementById('next-slide-btn');
        function updateProjectSlide(index) {
            if (!slideBg || !slideTitle || !slideCategory) return;
            slideTitle.style.opacity = '0'; slideCategory.style.opacity = '0'; slideBg.style.opacity = '0.3';
            setTimeout(() => {
                const project = projects[index];
                slideBg.style.backgroundImage = `url('${project.image}')`;
                slideTitle.textContent = project.title;
                slideCategory.textContent = project.category;
                slideTitle.style.opacity = '1'; slideCategory.style.opacity = '1'; slideBg.style.opacity = '1';
            }, 200);
        }
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => { currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length; updateProjectSlide(currentProjectIndex); });
            nextBtn.addEventListener('click', () => { currentProjectIndex = (currentProjectIndex + 1) % projects.length; updateProjectSlide(currentProjectIndex); });
        }

            /* ================================================== */
            /* MY PROCESS TIMELINE SCROLL GRADIENT FILL           */
            /* ================================================== */
            const timelineLine = document.getElementById('timeline-line');
            const processSection = document.getElementById('my-process');

            // Use GSAP ScrollTrigger (now integrated with Lenis via scrollerProxy)
            if (timelineLine && processSection && typeof gsap !== 'undefined' && gsap.plugins.ScrollTrigger) {
                ScrollTrigger.create({
                    trigger: processSection,
                    scroller: document.body, // Use Lenis scroller
                    start: 'top 70%',        // starts when section top hits 70% of viewport
                    end: 'bottom 30%',       // ends when section bottom hits 30% of viewport
                    scrub: 0.3,              // smooth scrub (0.3s lag for nice feel)
                    onUpdate: self => {
                        const progress = self.progress * 100; // 0–100
                        const redEnd = Math.max(0, progress - 8);
                        const fadeEnd = Math.min(100, progress + 15);
                        timelineLine.style.background = `linear-gradient(to bottom, #e30613 0%, #e30613 ${redEnd}%, #e30613 ${progress}%, #e5e7eb ${fadeEnd}%, #e5e7eb 100%)`;
                    }
                });
            } else if (timelineLine && processSection) {
                // Fallback: simple scroll listener (no scrub smoothing)
                function updateTimelineProgress() {
                    const rect = processSection.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const startPoint = windowHeight * 0.7;
                    const endPoint = windowHeight * 0.3;
                    const totalScrollable = rect.height + windowHeight - startPoint - endPoint;
                    const scrolled = startPoint - rect.top;
                    let progress = Math.min(Math.max((scrolled / totalScrollable) * 100, 0), 100);
                    const redEnd = Math.max(0, progress - 8);
                    const fadeEnd = Math.min(100, progress + 15);
                    timelineLine.style.background = `linear-gradient(to bottom, #e30613 0%, #e30613 ${redEnd}%, #e30613 ${progress}%, #e5e7eb ${fadeEnd}%, #e5e7eb 100%)`;
                }
                window.addEventListener('scroll', updateTimelineProgress, { passive: true });
                window.addEventListener('resize', updateTimelineProgress);
                updateTimelineProgress();
            }
        }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPreloader();
            initComponents().then(() => {
                initHeroTextReveal();
            });
        });
    } else {
        initPreloader();
        initComponents().then(() => {
            initHeroTextReveal();
        });
    }
})();

// ==================================================
// GSAP TEXT FILL EFFECT
// ==================================================
function splitTextIntoChars(element) {
    const nodes = Array.from(element.childNodes);
    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const fragment = document.createDocumentFragment();

            // Split by words first to keep words together
            const words = text.split(' ');
            words.forEach((word, wordIdx) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'word-wrapper inline-block';

                // Split each word into characters
                word.split('').forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.textContent = char;
                    charSpan.className = 'char inline-block text-gray-300';
                    wordSpan.appendChild(charSpan);
                });

                fragment.appendChild(wordSpan);

                // Add a regular space after the word, except for the last one
                if (wordIdx < words.length - 1) {
                    fragment.appendChild(document.createTextNode(' '));
                }
            });
            element.replaceChild(fragment, node);
        }
    });
}

function initTextFillEffect() {
    const targetH2 = document.querySelector('#myself h2');
    if (!targetH2) return;

    // Initialize GSAP plugin
    gsap.registerPlugin(ScrollTrigger);

    splitTextIntoChars(targetH2);

    const chars = targetH2.querySelectorAll('.char');

    gsap.to(chars, {
        scrollTrigger: {
            trigger: targetH2,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
        },
        color: '#111827', // text-gray-900
        stagger: 0.1,
        ease: 'none'
    });
}

// Initialize the effect after the DOM is ready
if (document.readyState === 'complete') {
    initTextFillEffect();
} else {
    window.addEventListener('load', initTextFillEffect);
}

// ==================================================
// ADDED FROM Portfolio\script.js                    // ==================================================
// Toggle skill tags on click
const tagsContainer = document.getElementById('tags');
if (tagsContainer) {
  tagsContainer.addEventListener('click', (e) => {
    const tag = e.target.closest('.tag');
    if (!tag) return;
    tag.classList.toggle('is-active');
  });
}

// ==================================================
// Contact Page
// ==================================================

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    console.log("Initializing Contact Form...");

    const statusEl = document.getElementById('status');
    const sendBtn = contactForm.querySelector('.send');

    const ACCESS_KEY = 'c9292753-4d4c-4367-adf4-8df1dab7368f';
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    function setStatus(text, isError = false) {
      if (statusEl) {
        statusEl.textContent = text;
        statusEl.classList.toggle('is-error', isError);
      }
    }

    contactForm.addEventListener('input', (e) => {
      e.target.closest('.field')?.classList.remove('has-error');
      setStatus('');
    });

    contactForm.addEventListener('submit', async (e) => {
      console.log("Form submit event triggered");
      e.preventDefault();
      e.stopPropagation();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      console.log("Form data captured:", data);

      const errors = [];
      if (!data.name?.trim()) errors.push('name');
      if (!isEmail(data.email?.trim())) errors.push('email');
      if (!data.message?.trim()) errors.push('message');

      contactForm.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));

      if (errors.length) {
        console.log("Validation errors:", errors);
        errors.forEach((id) => {
            const el = document.getElementById(id);
            el?.closest('.field')?.classList.add('has-error');
        });
        document.getElementById(errors[0])?.focus();
        setStatus('Please fill in your name, a valid email, and a message.', true);
        return;
      }

      if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.textContent = 'Sending...';
      }
      setStatus('');

      try {
        console.log("Sending request to Web3Forms...");
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: ACCESS_KEY,
            subject: `Portfolio enquiry from ${data.name.trim()}`,
            from_name: 'Portfolio Contact Form',
            name: data.name.trim(),
            email: data.email.trim(),
            interested_in: data.interest?.trim() || '-',
            message: data.message.trim(),
          }),
        });
        const result = await res.json();
        console.log("Server response:", result);

        if (result.success) {
          setStatus('Thanks! Your message has been sent.');
          contactForm.reset();
        } else {
          setStatus(result.message || 'Could not send your message. Please email me directly.', true);
        }
      } catch (err) {
        console.error("Submission error:", err);
        if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
          setStatus('Failed to send: AdBlocker or file:// protocol issue. Please disable AdBlocker or open via Live Server.', true);
        } else {
          setStatus(err.message || 'Could not send your message. Please email me directly.', true);
        }
      } finally {
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Message';
        }
      }
    });
}

// Initialize both on DOMContentLoaded and immediately
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

