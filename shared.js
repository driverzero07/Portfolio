// ==================================================
// SHARED COMPONENT LOADER & NAV LOGIC
// Used by: index.html, Myself.html, Contact.html, project-gallery.html
// ==================================================

/**
 * Loads header.html and footer.html into placeholders
 */
async function loadComponents() {
    try {
        const headerEl = document.getElementById('header-placeholder');
        const footerEl = document.getElementById('footer-placeholder');

        if (headerEl && headerEl.children.length === 0) {
            const headerRes = await fetch('header.html');
            headerEl.innerHTML = await headerRes.text();
        }

        if (footerEl && footerEl.children.length === 0) {
            const footerRes = await fetch('footer.html');
            footerEl.innerHTML = await footerRes.text();
        }

        initDynamicElements();
        highlightActivePage();
    } catch (err) {
        console.error('Error loading components:', err);
    }
}

/**
 * Highlights the active nav button based on current page
 */
function highlightActivePage() {
    const path = window.location.pathname.toLowerCase();
    const navButtons = document.querySelectorAll('.nav-btn, .mobile-link');

    navButtons.forEach(btn => {
        const page = btn.getAttribute('data-page')?.toLowerCase();
        if (!page) return;

        // Exact match for the page, or if it's index.html and path is just '/'
        const isExactMatch = (path.endsWith(page)) || (page === 'index.html' && (path === '/' || path.endsWith('/index.html')));

        if (isExactMatch) {
            btn.classList.add('nav-btn-active', 'bg-slate-900', 'text-white');
            btn.classList.remove('nav-btn-inactive', 'text-gray-800');
            if (btn.classList.contains('mobile-link')) {
                btn.classList.add('bg-black', 'text-white', 'font-semibold');
                btn.classList.remove('text-gray-800');
            }
        } else {
            btn.classList.add('nav-btn-inactive', 'text-gray-800');
            btn.classList.remove('nav-btn-active', 'bg-slate-900', 'text-white');
            if (btn.classList.contains('mobile-link')) {
                btn.classList.add('text-gray-800');
                btn.classList.remove('bg-black', 'text-white', 'font-semibold');
            }
        }
    });
}

/**
 * Initializes mobile menu and other dynamic elements
 */
function initDynamicElements() {
    if (window.initMobileMenu) {
        window.initMobileMenu();
    } else {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');

        if (menuBtn && !menuBtn.dataset.menuListener && mobileMenu && menuIcon) {
            menuBtn.dataset.menuListener = 'true';
            const toggle = (forceClose = false) => {
                const isOpen = forceClose ? false : !mobileMenu.classList.contains('active');
                if (isOpen) {
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
            };

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle();
            });

            document.addEventListener('click', (e) => {
                if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                    toggle(true);
                }
            });

            document.querySelectorAll('.mobile-link').forEach(link => {
                link.addEventListener('click', () => toggle(true));
            });
        }
    }
}

// Auto-initialize on DOM ready
window.addEventListener('DOMContentLoaded', loadComponents);