document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    checkAuthenticationAndLoadPlaces();
    checkAuthenticationAndLoadPlaceDetails();
    setupReviewForm();
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

        const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
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
            <h2>${place.title}</h2>
            <p>$${place.price} / night</p>
            <p>${place.description || 'No description'}</p>
            <a href="place.html?id=${place.id}" class="details-button">
                View Details
            </a>
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