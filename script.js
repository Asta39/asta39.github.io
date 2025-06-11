// JavaScript code will go here

// Back-to-Top Button
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    };

    backToTopButton.onclick = function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };
}

// DOMContentLoaded to ensure all scripts run after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Hustle Page Filter Logic
    const categoryFilter = document.getElementById('category-filter');
    const hustleCards = document.querySelectorAll('.hustle-card');

    if (categoryFilter && hustleCards.length > 0) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            hustleCards.forEach(card => {
                const cardCategory = card.dataset.category;
                if (selectedCategory === 'All' || cardCategory === selectedCategory) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Skills Page - Progress Tracking Logic
    const skillCards = document.querySelectorAll('.skill-card');
    const markLearnedButtons = document.querySelectorAll('.mark-learned-btn');

    if (skillCards.length > 0 && markLearnedButtons.length > 0) {
        let learnedSkills = JSON.parse(localStorage.getItem('learnedSkills')) || [];

        const updateSkillCardView = (skillId, isLearned) => {
            const card = document.querySelector(`.skill-card[data-skill-id="${skillId}"]`);
            const button = document.querySelector(`.mark-learned-btn[data-skill-id="${skillId}"]`);
            if (card && button) {
                if (isLearned) {
                    card.classList.add('learned');
                    button.textContent = 'Learned ✓';
                    button.classList.remove('btn-secondary');
                    button.classList.add('btn-success');
                } else {
                    card.classList.remove('learned');
                    button.textContent = 'Mark as Learned';
                    button.classList.add('btn-secondary');
                    button.classList.remove('btn-success');
                }
            }
        };

        learnedSkills.forEach(skillId => {
            updateSkillCardView(skillId, true);
        });

        markLearnedButtons.forEach(button => {
            button.addEventListener('click', function() {
                const skillId = this.dataset.skillId;
                const isLearnedCurrently = learnedSkills.includes(skillId);

                if (isLearnedCurrently) {
                    learnedSkills = learnedSkills.filter(id => id !== skillId);
                    updateSkillCardView(skillId, false);
                } else {
                    learnedSkills.push(skillId);
                    updateSkillCardView(skillId, true);
                }
                localStorage.setItem('learnedSkills', JSON.stringify(learnedSkills));
            });
        });
    }

    // Contact Form - State Saving Logic
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        const formElements = Array.from(contactForm.elements).filter(el => el.name);

        const saveFormData = () => {
            const data = {};
            formElements.forEach(element => {
                if (element.type === 'checkbox') {
                    data[element.name] = element.checked;
                } else if (element.type !== 'submit') {
                    data[element.name] = element.value;
                }
            });
            localStorage.setItem('contactFormData', JSON.stringify(data));
        };

        const loadFormData = () => {
            const savedData = JSON.parse(localStorage.getItem('contactFormData'));
            if (savedData) {
                formElements.forEach(element => {
                    if (element.name in savedData) {
                        if (element.type === 'checkbox') {
                            element.checked = savedData[element.name];
                        } else if (element.type !== 'submit') {
                            element.value = savedData[element.name];
                        }
                    }
                });
            }
        };

        loadFormData();

        formElements.forEach(element => {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.addEventListener('change', saveFormData);
            } else {
                element.addEventListener('input', saveFormData);
            }
        });

        contactForm.addEventListener('submit', function() {
            localStorage.removeItem('contactFormData');
        });
    }

    // Testimonial Slider Functionality
    const slider = document.querySelector('.testimonial-slider');
    const slides = document.querySelectorAll('.testimonial-item');
    const prevButton = document.querySelector('.slider-prev');
    const nextButton = document.querySelector('.slider-next');

    if (slider && slides.length > 0 && prevButton && nextButton) {
        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSliderPosition() {
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSliderPosition();
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSliderPosition();
        });
        updateSliderPosition(); // Initialize slider position
    }

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('nav .nav-links'); // Target .nav-links specifically

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
            const isExpanded = navLinks.classList.contains('nav-open');
            navToggle.setAttribute('aria-expanded', isExpanded);
            navToggle.classList.toggle('active'); // For hamburger to X animation
        });
    }

    // Fade-in class application (CSS handles the animation itself)
    // This is a simple version. For staggered or on-scroll, IntersectionObserver would be better.
    // The CSS now directly applies animation to .card and specific hero elements,
    // so this JS part for adding 'fade-in' class might be redundant if CSS directly targets elements.
    // However, if we want to control timing or be more selective via JS, this is one way.
    // For now, CSS handles it, so this can be commented or removed if not adding further JS logic.
    /*
    document.querySelectorAll('.hero h1, .hero p, .hero .hero-cta, .feature-card, .guide-card, .skill-card, .hustle-card, #contact-form-section, #community-section').forEach(el => {
        el.classList.add('fade-in'); // Ensure your CSS has .fade-in defined if you use this
    });
    */

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => { // Use 'load' to ensure page content loads first
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
});
