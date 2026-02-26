gsap.registerPlugin(ScrollTrigger);

// Initialize Backgrounds
gsap.set(".bg-0", { opacity: 1 });

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

// 3. Background Crossfading tied to sections
const sections = gsap.utils.toArray('.story-section');
let activeIndex = 0;

sections.forEach((section, i) => {
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

// 4. Booking Form interaction simulated links jumping to bottom
document.querySelectorAll('.simulated-link').forEach(link => {
    link.addEventListener('click', () => {
        const footer = document.querySelector('.footer-booking');
        window.scrollTo({
            top: footer.offsetTop,
            behavior: 'smooth'
        });
    });
});

// 5. Fade out navigation as scrolling begins
gsap.to(".fixed-nav", {
    opacity: 0.1, // Lowers opacity to 10%
    scrollTrigger: {
        trigger: ".section-0",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});