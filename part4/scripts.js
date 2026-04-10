document.addEventListener('DOMContentLoaded', () => {
	setupLoginForm();
	updateAuthNavLink();
	checkAuthenticationAndLoadPlaces();
	checkAuthenticationAndLoadPlaceDetails();
	setupReviewForm();
	setupIndexHeroSlider();
	setupDatePicker();
	setupGuestsPicker();
	setupSearchButton();
	setupLoginBackgroundSlider();
	setupThemeToggle();
	setupPasswordToggle();
	setupGalleryLightbox();/**/
	setupPlaceBookingCalculator();/**/
	setupPlaceBookingDatePicker();
	setupInlineReviewForm();
	loadAmenities();
	loadAmenitiesForAddPlace();
    setupAddPlaceImageInputs();
    setupAddPlaceForm();
});

/* 
    
    
    
    
    
    
    setupGuestsPicker();
    setupSearchButton();
    setupLoginBackgroundSlider();
    setupThemeToggle();
    setupPasswordToggle();

    loadAmenitiesForAddPlace();
    setupAddPlaceImageInputs();
    setupAddPlaceForm();
	*/

let allPlaces = [];
let selectedGuests = 0;
let selectedDateRange = {
	from: null,
	to: null
};
let addPlaceMainImage = '';
let addPlaceOtherImages = [];

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
				headers: { 'Content-Type': 'application/json' },
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

function clearCookie(name) {
	document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/* =========================
   Auth Nav Link
========================= */
function updateAuthNavLink() {
	const token = getCookie('token');
	const loginLink = document.getElementById('login-link');

	if (!loginLink) return;

	if (token) {
		loginLink.textContent = 'Sign Out';
		loginLink.href = '#';
		loginLink.onclick = function (e) {
			e.preventDefault();
			clearCookie('token');
			window.location.href = 'login.html';
		};
	} else {
		loginLink.textContent = 'Login';
		loginLink.href = 'login.html';
		loginLink.onclick = null;
	}
}

/* =========================
   INDEX PAGE
========================= */
function checkAuthenticationAndLoadPlaces() {
	const placesList = document.getElementById('places-list');
	if (!placesList) return;

	const token = getCookie('token');

	updateAuthNavLink();
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
		const placesList = document.getElementById('places-list');
		if (placesList) {
			placesList.innerHTML = '<p>Failed to load places.</p>';
		}
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
					<div class="place-price-block">
						<p class="place-price">$${place.price}</p>
                    <div class="guests-trigger">
						<img src="icons/Guests-icon.png" alt="Guests">
						<p class="place-guests-max">Up to ${place.max_guests} guests</p>
					</div>
					</div>

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
	const wrapper = document.getElementById('price-dropdown-wrapper');
	const trigger = document.getElementById('price-trigger');
	const dropdown = document.getElementById('price-dropdown');
	const minRange = document.getElementById('min-price-range');
	const maxRange = document.getElementById('max-price-range');
	const minValue = document.getElementById('min-price-value');
	const maxValue = document.getElementById('max-price-value');
	const display = document.getElementById('price-display');
	const applyBtn = document.getElementById('apply-price');

	if (
		!wrapper || !trigger || !dropdown || !minRange || !maxRange ||
		!minValue || !maxValue || !display || !applyBtn
	) return;

	function syncRanges(changed) {
		let min = Number(minRange.value);
		let max = Number(maxRange.value);

		if (min > max) {
			if (changed === 'min') {
				max = min;
				maxRange.value = max;
			} else {
				min = max;
				minRange.value = min;
			}
		}

		minValue.textContent = min;
		maxValue.textContent = max;
	}

	minRange.addEventListener('input', () => syncRanges('min'));
	maxRange.addEventListener('input', () => syncRanges('max'));

	trigger.addEventListener('click', (e) => {
		e.stopPropagation();
		dropdown.classList.toggle('open');

		const dateDropdown = document.getElementById('date-dropdown');
		const guestsDropdown = document.getElementById('guests-dropdown');

		if (dateDropdown) dateDropdown.classList.remove('open');
		if (guestsDropdown) guestsDropdown.classList.remove('open');
	});

	applyBtn.addEventListener('click', () => {
		const min = Number(minRange.value);
		const max = Number(maxRange.value);

		display.textContent = `$${min} - $${max}`;

		const filtered = allPlaces.filter(place => {
			const price = Number(place.price);
			return price >= min && price <= max;
		});

		displayPlaces(filtered);
		dropdown.classList.remove('open');
	});

	document.addEventListener('click', (e) => {
		if (!wrapper.contains(e.target)) {
			dropdown.classList.remove('open');
		}
	});

	syncRanges();
}

/* =========================
   PLACE DETAILS PAGE
========================= */
function checkAuthenticationAndLoadPlaceDetails() {
	const section = document.getElementById('place-details');
	if (!section) return;

	const token = getCookie('token');
	const addReviewSection = document.getElementById('add-review');
	const placeId = getPlaceIdFromURL();

	updateAuthNavLink();

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
		const placeDetails = document.getElementById('place-details');
		if (placeDetails) {
			placeDetails.innerHTML = '<p>Error loading place.</p>';
		}
	}
}

function displayPlaceDetails(place) {
	const section = document.getElementById('place-details');
	const addReview = document.getElementById('add-review');

	if (!section) return;

	const galleryImages = [
		...(place.image_url ? [place.image_url] : []),
		...((place.images || []).map(img => img.image_url).filter(Boolean))
	];

	const visibleImages = galleryImages.slice(0, 5);

	const mainImage = visibleImages[0] || '';
	const sideImages = visibleImages.slice(1, 5);

	const reviewCount = place.reviews?.length || 0;
	const avgRating = reviewCount
		? (place.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount).toFixed(2)
		: '0.00';

	const stars = reviewCount
		? '★★★★★'
		: '☆☆☆☆☆';

	const amenityIcons = {
		wifi: 'icons/wi-fi-icon.png',
		gym: 'icons/weight.png',
		balcony: 'icons/balcony.png',
		valet: 'icons/keys.png',
		parking: 'icons/keys.png'
	};

	const amenitiesHtml = place.amenities?.length
		? place.amenities.map(amenity => {
			const amenityName = amenity.name || 'Amenity';
			const icon = amenityIcons[amenityName.toLowerCase()] || 'icons/rating.png';

			return `
                <div class="place-amenity">
                    <img src="${icon}" alt="${amenityName}">
                    <span>${amenityName}</span>
                </div>
            `;
		}).join('')
		: '<p>No amenities available.</p>';

	const sideImagesHtml = sideImages.map((img, index) => {
		const actualIndex = index + 1;
		const isLastVisible = actualIndex === 4;
		const remaining = galleryImages.length - 5;

		return `
            <div class="gallery-thumb-box">
                <img
                    src="${img}"
                    alt="${place.title} image ${actualIndex + 1}"
                    class="gallery-thumb"
                    data-gallery-index="${actualIndex}"
                >
                ${isLastVisible && remaining > 0 ? `
                    <div class="gallery-more-overlay" data-gallery-index="${actualIndex}">
                        +${remaining}
                    </div>
                ` : ''}
            </div>
        `;
	}).join('');

	section.innerHTML = `
        <div class="place-top-bar">
            <div class="place-top-title">
                <h1>${place.title}</h1>
                <p class="place-subtitle">${place.description || 'No description available'}</p>
            </div>

            <div class="place-top-location">
                <strong>City</strong>
                <span>Dubai</span>
            </div>

            <div class="place-top-price">
                <span class="amount">$${place.price}</span>
                <span class="per-night">For per night</span>
            </div>
        </div>

        <div class="place-content-grid">
            <div class="place-left-column">
                <div class="place-gallery">
                    <div class="gallery-main">
                        ${mainImage ? `
                            <img
                                src="${mainImage}"
                                alt="${place.title}"
                                class="gallery-main-image"
                                data-gallery-index="0"
                            >
                        ` : ''}
                    </div>

                    <div class="gallery-side-grid">
                        ${sideImagesHtml}
                    </div>
                </div>

                <div class="place-description-block">
                    <h2>Description</h2>
                    <p>${place.description || 'No description available.'}</p>
                </div>
            </div>

            <aside class="place-sidebar">
                <div class="sidebar-card rating-card">
                    <div class="rating-split">
                        <span class="review-count-number">${reviewCount}</span>
                        <span class="review-count-label">Reviews</span>
                    </div>

                    <div>
                        <span class="rating-value">${avgRating}</span>
                        <div class="rating-stars">${stars}</div>
                    </div>
                </div>

				<div class="sidebar-card booking-card">
					<div class="booking-date-dropdown-wrapper" id="booking-date-dropdown-wrapper">
						<button type="button" class="booking-date-trigger" id="booking-date-trigger">
							<span class="booking-date-trigger-label">Dates</span>
							<span id="booking-date-display">Add dates</span>
						</button>

						<div class="booking-date-dropdown" id="booking-date-dropdown">
							<label class="dropdown-label" for="booking-date-range-picker">Select stay dates</label>
							<input
								type="text"
								id="booking-date-range-picker"
								placeholder="Choose check-in and check-out"
								readonly
							>

							<button type="button" class="dropdown-apply-btn" id="apply-booking-dates">
								Apply
							</button>
						</div>
					</div>

					<div class="booking-summary">
						<div class="booking-summary-row">
							<strong>Price / night</strong>
							<span>$${place.price}</span>
						</div>

						<div class="booking-summary-row">
							<strong>Nights</strong>
							<span id="booking-nights">0</span>
						</div>

						<div class="booking-total">
							<strong>Total</strong>
							<span id="booking-total-price">$${place.price}</span>
						</div>
					</div>

					<button type="button" class="book-now-btn">Book Now</button>
				</div>

                <div class="sidebar-card amenities-card">
                    ${amenitiesHtml}
                </div>
            </aside>
        </div>
    `;

	if (addReview) {
		const token = getCookie('token');

		if (token) {
			addReview.innerHTML = `
            <div class="inline-review-card">
                <h3>Add a Review</h3>

                <form id="inline-review-form" class="inline-review-form">
                    <label>Rating</label>
					<div class="star-rating" id="star-rating">
						<input type="hidden" id="inline-review-rating" required>

						<span class="star" data-value="1">★</span>
						<span class="star" data-value="2">★</span>
						<span class="star" data-value="3">★</span>
						<span class="star" data-value="4">★</span>
						<span class="star" data-value="5">★</span>
					</div>
                    <label for="inline-review-text">Your review</label>
                    <textarea
                        id="inline-review-text"
                        rows="4"
                        placeholder="Write your review here..."
                        required
                    ></textarea>

                    <div class="inline-review-actions">
                        <button type="submit" class="dropdown-apply-btn">Submit Review</button>
                    </div>

                    <p id="inline-review-message" class="inline-review-message"></p>
                </form>
            </div>
        `;

			setupInlineReviewForm(place.id);
		} else {
			addReview.innerHTML = `
            <div class="inline-review-card">
                <p class="inline-review-login-note">
                    <a href="login.html" class="details-button">Login</a> to add a review.
                </p>
            </div>
        `;
		}
	}

	setupGalleryLightbox(galleryImages);
	setupPlaceBookingDatePicker(place.price);

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

		if (msg) msg.textContent = '';

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
				if (msg) msg.textContent = 'Review submitted successfully!';
				form.reset();
			} else {
				if (msg) msg.textContent = 'Failed to submit review.';
			}
		} catch {
			if (msg) msg.textContent = 'Server error.';
		}
	});
}

/* =========================
   LOGIN PAGE UI EFFECTS
========================= */
function setupLoginBackgroundSlider() {
	if (!document.body.classList.contains('login-page')) return;

	const slides = document.querySelectorAll('.login-bg-slide');
	if (!slides.length) return;

	const bgImages = [
		'BG-IMGS/Los-angles.png',
		'BG-IMGS/Riyadh.jpg',
		'BG-IMGS/Dubai.jpg'
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
   INDEX PAGE UI EFFECTS
========================= */
function setupIndexHeroSlider() {
	if (!document.body.classList.contains('index-page')) return;

	const slides = document.querySelectorAll('.bg-slide');
	const title = document.querySelector('.hero-title');

	if (!slides.length || !title) return;

	const heroData = [
		{
			image: 'BG-IMGS/Los-angles.png',
			title: 'LOS ANGLES'
		},
		{
			image: 'BG-IMGS/Riyadh.jpg',
			title: 'RIYADH'
		},
		{
			image: 'BG-IMGS/Dubai.jpg',
			title: 'DUBAI'
		},
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
		onChange: function (dates) {
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
		if (adultsCount) adultsCount.textContent = adults;
		if (childrenCount) childrenCount.textContent = children;
	}

	function updateDisplay() {
		const total = adults + children;
		selectedGuests = total;

		if (total === 0) {
			display.textContent = 'Add Guests';
		} else {
			display.textContent = `${adults} Adults, ${children} Children`;
		}
	}

	trigger.addEventListener('click', (e) => {
		e.stopPropagation();
		dropdown.classList.toggle('open');

		const dateDropdown = document.getElementById('date-dropdown');
		const priceDropdown = document.getElementById('price-dropdown');

		if (dateDropdown) dateDropdown.classList.remove('open');
		if (priceDropdown) priceDropdown.classList.remove('open');
	});

	buttons.forEach((button) => {
		button.addEventListener('click', (e) => {
			e.stopPropagation();

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

	applyBtn.addEventListener('click', (e) => {
		e.stopPropagation();
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

function setupSearchButton() {
	const searchBtn = document.getElementById('search-submit-btn');
	const locationInput = document.getElementById('location-input');

	if (!searchBtn) return;

	searchBtn.addEventListener('click', () => {
		let filtered = [...allPlaces];

		const locationValue = locationInput
			? locationInput.value.trim().toLowerCase()
			: '';

		if (locationValue) {
			filtered = filtered.filter(place =>
				(place.title && place.title.toLowerCase().includes(locationValue)) ||
				(place.description && place.description.toLowerCase().includes(locationValue))
			);
		}

		if (selectedGuests > 0) {
			filtered = filtered.filter(place =>
				Number(place.max_guests) >= selectedGuests
			);
		}

		displayPlaces(filtered);
	});
}

function setupGalleryLightbox(images) {
	const lightbox = document.getElementById('gallery-lightbox');
	const lightboxImage = document.getElementById('lightbox-image');
	const closeBtn = document.getElementById('lightbox-close');
	const prevBtn = document.getElementById('lightbox-prev');
	const nextBtn = document.getElementById('lightbox-next');

	if (!lightbox || !lightboxImage || !closeBtn || !prevBtn || !nextBtn || !images.length) return;

	let currentIndex = 0;

	function openLightbox(index) {
		currentIndex = index;
		lightboxImage.src = images[currentIndex];
		lightbox.classList.add('open');
		lightbox.setAttribute('aria-hidden', 'false');
	}

	function closeLightbox() {
		lightbox.classList.remove('open');
		lightbox.setAttribute('aria-hidden', 'true');
	}

	function showPrev() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
		lightboxImage.src = images[currentIndex];
	}

	function showNext() {
		currentIndex = (currentIndex + 1) % images.length;
		lightboxImage.src = images[currentIndex];
	}

	document.querySelectorAll('[data-gallery-index]').forEach(el => {
		el.addEventListener('click', () => {
			const index = Number(el.dataset.galleryIndex);
			openLightbox(index);
		});
	});

	closeBtn.onclick = closeLightbox;
	prevBtn.onclick = showPrev;
	nextBtn.onclick = showNext;

	lightbox.onclick = (e) => {
		if (e.target === lightbox) {
			closeLightbox();
		}
	};

	document.addEventListener('keydown', (e) => {
		if (!lightbox.classList.contains('open')) return;

		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowLeft') showPrev();
		if (e.key === 'ArrowRight') showNext();
	});
}

function setupPlaceBookingCalculator(pricePerNight) {
	const checkinInput = document.getElementById('booking-checkin');
	const checkoutInput = document.getElementById('booking-checkout');
	const nightsEl = document.getElementById('booking-nights');
	const totalEl = document.getElementById('booking-total-price');

	if (!checkinInput || !checkoutInput || !nightsEl || !totalEl) return;

	const today = new Date().toISOString().split('T')[0];
	checkinInput.min = today;
	checkoutInput.min = today;

	function calculateBookingTotal() {
		const checkin = checkinInput.value;
		const checkout = checkoutInput.value;

		if (!checkin) {
			nightsEl.textContent = '0';
			totalEl.textContent = `$${pricePerNight}`;
			return;
		}

		checkoutInput.min = checkin;

		if (!checkout) {
			nightsEl.textContent = '0';
			totalEl.textContent = `$${pricePerNight}`;
			return;
		}

		const checkinDate = new Date(checkin);
		const checkoutDate = new Date(checkout);

		const diffMs = checkoutDate - checkinDate;
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays <= 0 || Number.isNaN(diffDays)) {
			nightsEl.textContent = '0';
			totalEl.textContent = 'Invalid dates';
			return;
		}

		const total = diffDays * Number(pricePerNight);

		nightsEl.textContent = diffDays;
		totalEl.textContent = `$${total}`;
	}

	checkinInput.addEventListener('change', calculateBookingTotal);
	checkoutInput.addEventListener('change', calculateBookingTotal);

	calculateBookingTotal();
}

function setupPlaceBookingDatePicker(pricePerNight) {
	const wrapper = document.getElementById('booking-date-dropdown-wrapper');
	const trigger = document.getElementById('booking-date-trigger');
	const dropdown = document.getElementById('booking-date-dropdown');
	const input = document.getElementById('booking-date-range-picker');
	const applyBtn = document.getElementById('apply-booking-dates');
	const display = document.getElementById('booking-date-display');
	const nightsEl = document.getElementById('booking-nights');
	const totalEl = document.getElementById('booking-total-price');

	if (!wrapper || !trigger || !dropdown || !input || !applyBtn || !display || !nightsEl || !totalEl) return;
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
		onChange: function (dates) {
			selectedDates = dates;
		}
	});

	function updateBookingTotal(fromDate, toDate) {
		if (!fromDate || !toDate) {
			nightsEl.textContent = '0';
			totalEl.textContent = `$${pricePerNight}`;
			return;
		}

		const diffMs = toDate - fromDate;
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays <= 0 || Number.isNaN(diffDays)) {
			nightsEl.textContent = '0';
			totalEl.textContent = 'Invalid dates';
			return;
		}

		const total = diffDays * Number(pricePerNight);
		nightsEl.textContent = diffDays;
		totalEl.textContent = `$${total}`;
	}

	trigger.addEventListener('click', (e) => {
		e.stopPropagation();
		dropdown.classList.toggle('open');
	});

	applyBtn.addEventListener('click', () => {
		if (selectedDates.length === 2) {
			const from = picker.formatDate(selectedDates[0], 'Y-m-d');
			const to = picker.formatDate(selectedDates[1], 'Y-m-d');

			display.textContent = `${from} → ${to}`;
			selectedDateRange.from = from;
			selectedDateRange.to = to;

			updateBookingTotal(selectedDates[0], selectedDates[1]);
		} else if (selectedDates.length === 1) {
			const from = picker.formatDate(selectedDates[0], 'Y-m-d');

			display.textContent = `From ${from}`;
			selectedDateRange.from = from;
			selectedDateRange.to = null;

			updateBookingTotal(null, null);
		} else {
			display.textContent = 'Add dates';
			selectedDateRange.from = null;
			selectedDateRange.to = null;

			updateBookingTotal(null, null);
		}

		dropdown.classList.remove('open');
	});

	document.addEventListener('click', (e) => {
		if (!wrapper.contains(e.target)) {
			dropdown.classList.remove('open');
		}
	});

	if (selectedDateRange.from && selectedDateRange.to) {
		display.textContent = `${selectedDateRange.from} → ${selectedDateRange.to}`;
		updateBookingTotal(new Date(selectedDateRange.from), new Date(selectedDateRange.to));
	} else {
		display.textContent = 'Add dates';
		updateBookingTotal(null, null);
	}
}

function setupInlineReviewForm(placeId) {
    const form = document.getElementById('inline-review-form');
    const message = document.getElementById('inline-review-message');
    const token = getCookie('token');

    const stars = document.querySelectorAll('#star-rating .star');
    const ratingInput = document.getElementById('inline-review-rating');

    let currentRating = 0;

    if (stars.length) {
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                highlightStars(star.dataset.value);
            });

            star.addEventListener('mouseleave', () => {
                highlightStars(currentRating);
            });

            star.addEventListener('click', () => {
                currentRating = star.dataset.value;
                ratingInput.value = currentRating;
                highlightStars(currentRating);
            });
        });
    }

    function highlightStars(rating) {
        stars.forEach(star => {
            star.classList.toggle('active', star.dataset.value <= rating);
        });
    }

    if (!form || !message || !token) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = Number(ratingInput.value);
        const text = document.getElementById('inline-review-text').value.trim();

        if (!rating) {
            message.textContent = 'Please select a rating.';
            return;
        }

        message.textContent = '';

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
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

            if (!response.ok) {
                message.textContent = 'Failed to submit review.';
                return;
            }

            message.textContent = 'Review submitted successfully!';
            form.reset();
            currentRating = 0;
            highlightStars(0);

            fetchPlaceDetails(token, placeId);
        } catch {
            message.textContent = 'Server error.';
        }
    });
}

async function loadAmenities() {
    const container = document.getElementById('amenities-list');
    if (!container) return;

    const res = await fetch('http://127.0.0.1:5000/api/v1/amenities/');
    const data = await res.json();

    data.forEach(a => {
        container.innerHTML += `
            <label class="amenity-item">
                <input type="checkbox" value="${a.id}">
                ${a.name}
            </label>
        `;
    });
}

document.getElementById('images')?.addEventListener('change', (e) => {
    const gallery = document.getElementById('preview-gallery');
    gallery.innerHTML = '';

    [...e.target.files].forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        gallery.appendChild(img);
    });
});

function setupAddPlaceForm() {
    const form = document.getElementById('add-place-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = getCookie('token');

        const amenities = [...document.querySelectorAll('#amenities-list input:checked')]
            .map(el => el.value);

        const data = {
            title: title.value,
            description: description.value,
            short_description: document.getElementById('short-description').value,
            price: Number(price.value),
            max_guests: Number(guests.value),
            amenities
        };

        const res = await fetch('http://127.0.0.1:5000/api/v1/places/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const place = await res.json();

        /* رفع الصور */
        const files = document.getElementById('images').files;

        for (let file of files) {
            const fd = new FormData();
            fd.append('image', file);

            await fetch(`http://127.0.0.1:5000/api/v1/places/${place.id}/images`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
        }

        alert('Place created');
    });
}

function loadAmenitiesForAddPlace() {
    const container = document.getElementById('amenities-list');
    if (!container) return;

    fetch('http://127.0.0.1:5000/api/v1/amenities/')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';

            data.forEach(amenity => {
                container.innerHTML += `
                    <label class="amenity-item">
                        <input type="checkbox" value="${amenity.id}">
                        <span>${amenity.name}</span>
                    </label>
                `;
            });
        })
        .catch(() => {
            container.innerHTML = '<p>Failed to load amenities.</p>';
        });
}

function setupAddPlaceImageInputs() {
    const mainInput = document.getElementById('main-image-url');
    const otherInput = document.getElementById('other-image-url');
    const addMainBtn = document.getElementById('add-main-image-btn');
    const addOtherBtn = document.getElementById('add-other-image-btn');

    if (!mainInput || !otherInput || !addMainBtn || !addOtherBtn) return;

    addMainBtn.addEventListener('click', () => {
        const value = mainInput.value.trim();
        if (!value) return;

        addPlaceMainImage = value;
        mainInput.value = '';
        renderAddPlacePreviewGallery();
    });

    addOtherBtn.addEventListener('click', () => {
        const value = otherInput.value.trim();
        if (!value) return;

        addPlaceOtherImages.push(value);
        otherInput.value = '';
        renderAddPlacePreviewGallery();
    });
}

function renderAddPlacePreviewGallery() {
    const gallery = document.getElementById('preview-gallery');
    if (!gallery) return;

    const allImages = [
        ...(addPlaceMainImage ? [addPlaceMainImage] : []),
        ...addPlaceOtherImages
    ];

    gallery.innerHTML = '';

    allImages.forEach((imageUrl, index) => {
        gallery.innerHTML += `
            <div class="preview-gallery-item">
                <img src="${imageUrl}" alt="Preview ${index + 1}">
            </div>
        `;
    });
}

function setupAddPlaceForm() {
    const form = document.getElementById('add-place-form');
    const message = document.getElementById('add-place-message');
    const token = getCookie('token');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const title = document.getElementById('title').value.trim();
        const shortDescription = document.getElementById('short-description').value.trim();
        const description = document.getElementById('description').value.trim();
        const price = Number(document.getElementById('price').value);
        const guests = Number(document.getElementById('guests').value);
        const city = document.getElementById('city').value.trim();

        const selectedAmenities = [
            ...document.querySelectorAll('#amenities-list input[type="checkbox"]:checked')
        ].map(input => input.value);

        const payload = {
            title,
            short_description: shortDescription,
            description,
            price,
            max_guests: guests,
            city,
            image_url: addPlaceMainImage,
            images: addPlaceOtherImages,
            amenities: selectedAmenities,
            latitude: 0,
            longitude: 0
        };

        if (message) message.textContent = '';

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (message) {
                    message.textContent = data?.message || data?.error || 'Failed to add place.';
                }
                return;
            }

            if (message) {
                message.textContent = 'Place added successfully!';
            }

            form.reset();
            addPlaceMainImage = '';
            addPlaceOtherImages = [];
            renderAddPlacePreviewGallery();
        } catch {
            if (message) {
                message.textContent = 'Server error.';
            }
        }
    });
}

function loadAmenitiesForAddPlace() {
    const container = document.getElementById('amenities-list');
    if (!container) return;

    fetch('http://127.0.0.1:5000/api/v1/amenities/')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';

            data.forEach(amenity => {
                container.innerHTML += `
                    <label class="amenity-item">
                        <input type="checkbox" value="${amenity.id}">
                        <span>${amenity.name}</span>
                    </label>
                `;
            });
        })
        .catch(() => {
            container.innerHTML = '<p>Failed to load amenities.</p>';
        });
}

function setupAddPlaceImageInputs() {
    const mainInput = document.getElementById('main-image-url');
    const otherInput = document.getElementById('other-image-url');
    const addMainBtn = document.getElementById('add-main-image-btn');
    const addOtherBtn = document.getElementById('add-other-image-btn');

    if (!mainInput || !otherInput || !addMainBtn || !addOtherBtn) return;

    addMainBtn.addEventListener('click', () => {
        const value = mainInput.value.trim();
        if (!value) return;

        addPlaceMainImage = value;
        mainInput.value = '';
        renderAddPlacePreviewGallery();
    });

    addOtherBtn.addEventListener('click', () => {
        const value = otherInput.value.trim();
        if (!value) return;

        addPlaceOtherImages.push(value);
        otherInput.value = '';
        renderAddPlacePreviewGallery();
    });
}

function renderAddPlacePreviewGallery() {
    const gallery = document.getElementById('preview-gallery');
    if (!gallery) return;

    const allImages = [
        ...(addPlaceMainImage ? [addPlaceMainImage] : []),
        ...addPlaceOtherImages
    ];

    gallery.innerHTML = '';

    allImages.forEach((imageUrl, index) => {
        gallery.innerHTML += `
            <div class="preview-gallery-item">
                <img src="${imageUrl}" alt="Preview ${index + 1}">
            </div>
        `;
    });
}

function setupAddPlaceForm() {
    const form = document.getElementById('add-place-form');
    const message = document.getElementById('add-place-message');
    const token = getCookie('token');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const title = document.getElementById('title').value.trim();
        const shortDescription = document.getElementById('short-description').value.trim();
        const description = document.getElementById('description').value.trim();
        const price = Number(document.getElementById('price').value);
        const guests = Number(document.getElementById('guests').value);
        const city = document.getElementById('city').value.trim();

        const selectedAmenities = [
            ...document.querySelectorAll('#amenities-list input[type="checkbox"]:checked')
        ].map(input => input.value);

        const payload = {
            title,
            short_description: shortDescription,
            description,
            price,
            max_guests: guests,
            city,
            image_url: addPlaceMainImage,
            images: addPlaceOtherImages,
            amenities: selectedAmenities,
            latitude: 0,
            longitude: 0
        };

        if (message) message.textContent = '';

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (message) {
                    message.textContent = data?.message || data?.error || 'Failed to add place.';
                }
                return;
            }

            if (message) {
                message.textContent = 'Place added successfully!';
            }

            form.reset();
            addPlaceMainImage = '';
            addPlaceOtherImages = [];
            renderAddPlacePreviewGallery();
        } catch {
            if (message) {
                message.textContent = 'Server error.';
            }
        }
    });
}