gsap.registerPlugin(ScrollTrigger);

// Initialize Backgrounds
gsap.set(".bg-0", { opacity: 1 });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    // 1. Ken Burns Effect on Backgrounds
    const bgImages = gsap.utils.toArray('.bg-image');
    bgImages.forEach((bg) => {
        // Constant slow scale up for that cinematic feel
        gsap.to(bg, {
            scale: 1.1,
            duration: 30,
            ease: "none",
            repeat: -1,
            yoyo: true
        });
    });

    // 2. Parallax & Fade-in for text panels
    const textBlocks = gsap.utils.toArray('.text-block:not(.intro)');
    textBlocks.forEach(block => {
        gsap.fromTo(block,
            {
                y: 120,
                opacity: 0,
                rotationX: 5 // slight 3D tilt
            },
            {
                y: 0,
                opacity: 1,
                rotationX: 0,
                duration: 1.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );
    });

    // Intro fade out effect on scroll down
    gsap.to(".intro", {
        opacity: 0,
        y: -100,
        scrollTrigger: {
            trigger: ".section-0",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Logo fade as soon as scroll begins
    gsap.to(".hero-logo", {
        opacity: 0,
        y: -30,
        scrollTrigger: {
            trigger: ".section-0",
            start: "top top",
            end: "top+=200",
            scrub: true
        }
    });

    // 3. Background Crossfading tied to sections
    const sections = gsap.utils.toArray('.story-section');
    sections.forEach((section) => {
        const bgClass = section.getAttribute('data-bg');

        if (bgClass) {
            ScrollTrigger.create({
                trigger: section,
                start: "top 60%", // Triggers when top of section reaches 60% of viewport
                end: "bottom 60%",
                onEnter: () => fadeBg(bgClass),
                onEnterBack: () => fadeBg(bgClass),
            });
        }
    });

    // 4. Fade out navigation as scrolling begins
    gsap.to(".fixed-nav", {
        opacity: 0.1, // Lowers opacity to 10%
        scrollTrigger: {
            trigger: ".section-0",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
}

function fadeBg(targetClass) {
    const allBgs = gsap.utils.toArray('.bg-image');
    allBgs.forEach(bg => {
        if (bg.classList.contains(targetClass)) {
            gsap.to(bg, { opacity: 1, duration: 1.2, ease: "power2.inOut" });
        } else {
            // Keep previous backgrounds underneath temporarily then fade out
            gsap.to(bg, { opacity: 0, duration: 1.2, ease: "power2.inOut" });
        }
    });
}

if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
        if (!user) {
            window.netlifyIdentity.on("login", () => {
                document.location.href = "/admin/";
            });
        }
    });
}

const checkoutButtons = document.querySelectorAll('.stripe-checkout');
const checkoutError = document.querySelector('.payment-error');

checkoutButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        if (checkoutError) {
            checkoutError.textContent = '';
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Starting secure checkout...';

        try {
            const response = await fetch('/.netlify/functions/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: button.dataset.item })
            });

            if (!response.ok) {
                throw new Error('Checkout failed');
            }

            const data = await response.json();
            if (!data.url) {
                throw new Error('Missing checkout url');
            }

            window.location.href = data.url;
        } catch (error) {
            if (checkoutError) {
                checkoutError.textContent = 'Unable to start checkout. Please call or try again.';
            }
            button.disabled = false;
            button.textContent = originalText;
        }
    });
});
