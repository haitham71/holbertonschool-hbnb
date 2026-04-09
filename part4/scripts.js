document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    checkAuthenticationAndLoadPlaces();
    checkAuthenticationAndLoadPlaceDetails();
    setupReviewForm();
    setupIndexHeroSlider();
    setupDatePicker();
    setupGuestsPicker();
    updateAuthButton();
});

let allPlaces = [];

/* =========================
   Login Page
========================= */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (errorMessage) errorMessage.textContent = '';

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/users/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                document.cookie = `token=${data.access_token}; path=/`;
                window.location.href = 'index.html';
            } else {
                if (errorMessage) {
                    errorMessage.textContent = data.message || data.error || 'Login failed.';
                }
            }
        } catch {
            if (errorMessage) {
                errorMessage.textContent = 'Server connection error.';
            }
        }
    });
}

/* =========================
   Cookies
========================= */
function getCookie(name) {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

/* =========================
   INDEX PAGE
========================= */
function checkAuthenticationAndLoadPlaces() {
    const placesList = document.getElementById('places-list');
    if (!placesList) return;

    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (loginLink) {
        loginLink.style.display = token ? 'none' : 'inline-block';
    }

    fetchPlaces(token);
    setupPriceFilter();
}

async function fetchPlaces(token) {
    try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
            method: 'GET',
            headers
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        allPlaces = data;
        displayPlaces(allPlaces);
    } catch {
        document.getElementById('places-list').innerHTML =
            '<p>Failed to load places.</p>';
    }
}

function displayPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';

        card.innerHTML = `
            ${place.image_url ? `<img src="${place.image_url}" alt="${place.title}" class="place-image">` : ''}

            <div class="place-card-content">
                <h2>${place.title}</h2>

                <p class="place-location">
                    ${place.description || 'No description available'}
                </p>

                <div class="place-features">
                    <div class="feature-item">
                        <img src="icons/wi-fi-icon.png" alt="WiFi">
                        <span>WIFI</span>
                    </div>
                    <div class="feature-item">
                        <img src="icons/balcony.png" alt="Balcony">
                        <span>Balcony</span>
                    </div>
                    <div class="feature-item">
                        <img src="icons/weight.png" alt="Gym">
                        <span>GYM</span>
                    </div>
                    <div class="feature-item">
                        <img src="icons/keys.png" alt="Valet">
                        <span>Valet</span>
                    </div>
                </div>

                <div class="place-card-footer">
                    <p class="place-price">$${place.price}</p>
                    <a href="place.html?id=${place.id}" class="details-button">
                        View Details
                    </a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function setupPriceFilter() {
    const filter = document.getElementById('price-filter');
    if (!filter) return;

    filter.addEventListener('change', (e) => {
        const value = e.target.value;

        if (value === 'all') {
            displayPlaces(allPlaces);
            return;
        }

        const max = Number(value);

        const filtered = allPlaces.filter(p => p.price <= max);
        displayPlaces(filtered);
    });
}

/* =========================
   PLACE DETAILS PAGE
========================= */
function checkAuthenticationAndLoadPlaceDetails() {
    const section = document.getElementById('place-details');
    if (!section) return;

    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const addReviewSection = document.getElementById('add-review');
    const placeId = getPlaceIdFromURL();

    if (loginLink) {
        loginLink.style.display = token ? 'none' : 'inline-block';
    }

    if (addReviewSection) {
        addReviewSection.style.display = token ? 'block' : 'none';
    }

    if (!placeId) {
        section.innerHTML = '<p>Invalid place ID</p>';
        return;
    }

    fetchPlaceDetails(token, placeId);
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(
            `http://127.0.0.1:5000/api/v1/places/${placeId}`,
            { headers }
        );

        if (!response.ok) throw new Error();

        const place = await response.json();
        displayPlaceDetails(place);
    } catch {
        document.getElementById('place-details').innerHTML =
            '<p>Error loading place.</p>';
    }
}

function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    const addReview = document.getElementById('add-review');

    const amenities = place.amenities?.length
        ? `<ul>${place.amenities.map(a => `<li>${a.name}</li>`).join('')}</ul>`
        : '<p>No amenities</p>';

    const reviews = place.reviews?.length
        ? place.reviews.map(r => `
            <div class="review-card">
                <p><strong>User:</strong> ${r.user_id}</p>
                <p><strong>Rating:</strong> ${r.rating}</p>
                <p>${r.text}</p>
            </div>
        `).join('')
        : '<p>No reviews yet</p>';

    section.innerHTML = `
        ${place.image_url ? `<img src="${place.image_url}" alt="${place.title}" class="place-details-image">` : ''}
        <h1>${place.title}</h1>

        <div class="place-info">
            <p>${place.description}</p>
            <p><strong>Price:</strong> $${place.price}</p>
            <p>${place.latitude}, ${place.longitude}</p>
        </div>

        <h2>Amenities</h2>
        ${amenities}

        <h2>Reviews</h2>
        ${reviews}
    `;

    if (addReview) {
        addReview.innerHTML = `
            <a href="add_review.html?id=${place.id}" class="details-button">
                Add Review
            </a>
        `;
    }
}

/* =========================
   ADD REVIEW PAGE
========================= */
function setupReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();
    const msg = document.getElementById('review-message');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = document.getElementById('review-text').value.trim();
        const rating = Number(document.getElementById('rating').value);

        msg.textContent = '';

        try {
            const res = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text,
                    rating,
                    place_id: placeId
                })
            });

            if (res.ok) {
                msg.textContent = 'Review submitted successfully!';
                form.reset();
            } else {
                msg.textContent = 'Failed to submit review.';
            }
        } catch {
            msg.textContent = 'Server error.';
        }
    });
}

/* =========================
   LOGIN PAGE UI EFFECTS
========================= */
document.addEventListener('DOMContentLoaded', () => {
    setupLoginBackgroundSlider();
    setupThemeToggle();
    setupPasswordToggle();
});

function setupLoginBackgroundSlider() {
    if (!document.body.classList.contains('login-page')) return;

    const slides = document.querySelectorAll('.login-bg-slide');
    if (!slides.length) return;

    const bgImages = [
        'BG-IMGS/Los-angles.png',
        'BG-IMGS/Riyadh.jpg'
        // أضف هنا لاحقًا 3 صور أخرى
    ];

    slides.forEach((slide, index) => {
        slide.style.backgroundImage = `url('${bgImages[index % bgImages.length]}')`;
    });

    let currentIndex = 0;

    setInterval(() => {
        const currentSlide = slides[currentIndex % slides.length];
        const nextIndex = (currentIndex + 1) % slides.length;
        const nextSlide = slides[nextIndex];

        const nextBgIndex = (currentIndex + slides.length) % bgImages.length;
        nextSlide.style.backgroundImage = `url('${bgImages[nextBgIndex]}')`;

        currentSlide.classList.remove('active');
        nextSlide.classList.add('active');

        currentIndex = nextIndex;
    }, 3000);
}

function setupThemeToggle() {
    const lightBtn = document.getElementById('light-mode-btn');
    const darkBtn = document.getElementById('dark-mode-btn');
    const page = document.body;

    if (!lightBtn || !darkBtn) return;

    lightBtn.addEventListener('click', () => {
        page.classList.remove('dark-mode');
        page.classList.add('light-mode');
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
    });

    darkBtn.addEventListener('click', () => {
        page.classList.remove('light-mode');
        page.classList.add('dark-mode');
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
    });
}

function setupPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('password-toggle');

    if (!passwordInput || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const isPasswordHidden = passwordInput.type === 'password';

        passwordInput.type = isPasswordHidden ? 'text' : 'password';
        toggleBtn.classList.toggle('active', isPasswordHidden);
        toggleBtn.setAttribute(
            'aria-label',
            isPasswordHidden ? 'Hide password' : 'Show password'
        );
    });
}

/* =========================
   index PAGE UI EFFECTS
========================= */

function setupIndexHeroSlider() {
    if (!document.body.classList.contains('index-page')) return;

    const slides = document.querySelectorAll('.bg-slide');
    const title = document.querySelector('.hero-title');

    if (!slides.length || !title) return;

    const heroData = [
        {
            image: 'BG-IMGS/Los-angles.png',
            title: 'LOS ANGELES'
        },
        {
            image: 'BG-IMGS/Riyadh.jpg',
            title: 'RIYADH'
        }
    ];

    slides.forEach((slide, index) => {
        const item = heroData[index % heroData.length];
        slide.style.backgroundImage = `url('${item.image}')`;
    });

    title.textContent = heroData[0].title;

    let currentIndex = 0;

    setInterval(() => {
        const currentSlide = slides[currentIndex % slides.length];
        const nextIndex = (currentIndex + 1) % slides.length;
        const nextSlide = slides[nextIndex];
        const nextData = heroData[nextIndex % heroData.length];

        nextSlide.style.backgroundImage = `url('${nextData.image}')`;

        currentSlide.classList.remove('active');
        nextSlide.classList.add('active');

        title.textContent = nextData.title;

        currentIndex = nextIndex;
    }, 5000);
}

function setupDatePicker() {
    const wrapper = document.getElementById('date-dropdown-wrapper');
    const trigger = document.getElementById('date-trigger');
    const dropdown = document.getElementById('date-dropdown');
    const input = document.getElementById('date-range-picker');
    const applyBtn = document.getElementById('apply-dates');
    const display = document.getElementById('date-display');

    if (!wrapper || !trigger || !dropdown || !input || !applyBtn || !display) return;
    if (typeof flatpickr === 'undefined') return;

    let selectedDates = [];

    const picker = flatpickr(input, {
        mode: 'range',
        minDate: 'today',
        dateFormat: 'Y-m-d',
        disableMobile: true,
        inline: true,
        locale: flatpickr.l10ns.default,
        onReady: function (_, __, instance) {
            instance.calendarContainer.setAttribute('lang', 'en');

            const yearInput = instance.calendarContainer.querySelector('.numInput.cur-year');
            if (yearInput) {
                yearInput.setAttribute('lang', 'en');
                yearInput.style.direction = 'ltr';
            }
        },
        onOpen: function (_, __, instance) {
            instance.calendarContainer.setAttribute('lang', 'en');

            const yearInput = instance.calendarContainer.querySelector('.numInput.cur-year');
            if (yearInput) {
                yearInput.setAttribute('lang', 'en');
                yearInput.style.direction = 'ltr';
            }
        },
        onMonthChange: function (_, __, instance) {
            const yearInput = instance.calendarContainer.querySelector('.numInput.cur-year');
            if (yearInput) {
                yearInput.setAttribute('lang', 'en');
                yearInput.style.direction = 'ltr';
            }
        },
        onYearChange: function (_, __, instance) {
            const yearInput = instance.calendarContainer.querySelector('.numInput.cur-year');
            if (yearInput) {
                yearInput.setAttribute('lang', 'en');
                yearInput.style.direction = 'ltr';
            }
        },
        onChange: function(dates) {
            selectedDates = dates;
        }
    });

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');

        const guestsDropdown = document.getElementById('guests-dropdown');
        if (guestsDropdown) guestsDropdown.classList.remove('open');
    });

    applyBtn.addEventListener('click', () => {
        if (selectedDates.length === 2) {
            const from = picker.formatDate(selectedDates[0], 'Y-m-d');
            const to = picker.formatDate(selectedDates[1], 'Y-m-d');
            display.textContent = `${from} → ${to}`;
        } else if (selectedDates.length === 1) {
            const from = picker.formatDate(selectedDates[0], 'Y-m-d');
            display.textContent = `From ${from}`;
        } else {
            display.textContent = 'Add dates';
        }

        dropdown.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function setupGuestsPicker() {
    const wrapper = document.getElementById('guests-dropdown-wrapper');
    const trigger = document.getElementById('guests-trigger');
    const dropdown = document.getElementById('guests-dropdown');
    const display = document.getElementById('guests-display');
    const applyBtn = document.getElementById('apply-guests');
    const buttons = document.querySelectorAll('.guest-btn');

    if (!wrapper || !trigger || !dropdown || !display || !applyBtn || !buttons.length) return;

    let adults = 0;
    let children = 0;

    const adultsCount = document.getElementById('adults-count');
    const childrenCount = document.getElementById('children-count');

    function updateCounts() {
        adultsCount.textContent = adults;
        childrenCount.textContent = children;
    }

    function updateDisplay() {
        const total = adults + children;

        if (total === 0) {
            display.textContent = 'Add Guests';
            return;
        }

        display.textContent = `${adults} Adults, ${children} Children`;
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        const dateDropdown = document.getElementById('date-dropdown');
        if (dateDropdown) dateDropdown.classList.remove('open');
    });

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            const action = button.dataset.action;

            if (target === 'adults') {
                if (action === 'increase') adults++;
                if (action === 'decrease' && adults > 0) adults--;
            }

            if (target === 'children') {
                if (action === 'increase') children++;
                if (action === 'decrease' && children > 0) children--;
            }

            updateCounts();
        });
    });

    applyBtn.addEventListener('click', () => {
        updateDisplay();
        dropdown.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    updateCounts();
    updateDisplay();
}

function updateAuthButton() {
    const token = getCookie('token');
    const loginBtn = document.querySelector('.login-button');

    if (!loginBtn) return;

    if (token) {
        loginBtn.textContent = 'Sign Out';
        loginBtn.href = '#';

        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();

            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = 'login.html';
        });
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.href = 'login.html';
    }
}