const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';

let allPlaces = [];
let selectedGuests = 0;
let selectedDateRange = {
	from: null,
	to: null
};
let addPlaceMainImage = '';
let addPlaceOtherImages = [];

document.addEventListener('DOMContentLoaded', () => {
	setupLoginForm();
	setupSignupForm();
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
	setupGalleryLightbox();
	setupPlaceBookingDatePicker();

	loadAmenities();
	loadAmenitiesForAddPlace();

	setupAddPlaceImageInputs();
	setupAddPlaceForm();

	protectAdminPage();
	setupAdminAmenityForm();
	loadAdminAmenities();
	setupAdminReviewSearch();
	loadAdminReviews();
});

/* =========================
   Helpers
========================= */
function getToken() {
	return localStorage.getItem('token');
}

function clearToken() {
	localStorage.removeItem('token');
}

async function safeJson(response) {
	try {
		return await response.json();
	} catch {
		return null;
	}
}

function parseJwt(token) {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(base64));
	} catch {
		return null;
	}
}

function getCurrentUserId() {
	const token = getToken();
	if (!token) return null;

	const payload = parseJwt(token);
	return payload?.sub || payload?.identity || null;
}

function isCurrentUserAdmin() {
	const token = getToken();
	if (!token) return false;

	const payload = parseJwt(token);
	return Boolean(payload?.is_admin);
}

/* =========================
   Auth Nav Link
========================= */
function updateAuthNavLink() {
	const token = getToken();
	const loginLink = document.getElementById('login-link');
	const nav = document.querySelector('.top-nav');

	if (!loginLink || !nav) return;

	const existingAdminLink = document.getElementById('admin-link');
	if (existingAdminLink) existingAdminLink.remove();

	if (token) {
		const payload = parseJwt(token);

		if (payload && payload.is_admin) {
			const adminLink = document.createElement('a');
			adminLink.href = 'adminpage.html';
			adminLink.textContent = 'Admin';
			adminLink.className = 'nav-link';
			adminLink.id = 'admin-link';

			if (window.location.pathname.includes('adminpage.html')) {
				adminLink.classList.add('is-active');
			}

			nav.insertBefore(adminLink, loginLink);
		}

		loginLink.textContent = 'Sign Out';
		loginLink.href = '#';
		loginLink.onclick = function (e) {
			e.preventDefault();
			clearToken();
			window.location.href = 'login.html';
		};
	} else {
		loginLink.textContent = 'Login';
		loginLink.href = 'login.html';
		loginLink.onclick = null;
	}
}

/* =========================
   Login Page
========================= */
function setupLoginForm() {
	const loginForm = document.getElementById('login-form');
	const errorMessage = document.getElementById('error-message');

	if (!loginForm) return;

	loginForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const email = document.getElementById('email')?.value.trim();
		const password = document.getElementById('password')?.value.trim();

		if (errorMessage) errorMessage.textContent = '';

		try {
			const response = await fetch(`${API_BASE_URL}/users/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await safeJson(response);

			if (response.ok && data?.access_token) {
				localStorage.setItem('token', data.access_token);
				window.location.href = 'index.html';
			} else {
				if (errorMessage) {
					errorMessage.textContent = data?.message || data?.error || 'Login failed.';
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
   INDEX PAGE
========================= */
function checkAuthenticationAndLoadPlaces() {
	const placesList = document.getElementById('places-list');
	if (!placesList) return;

	const token = getToken();

	updateAuthNavLink();
	fetchPlaces(token);
	setupPriceFilter();
}

async function fetchPlaces(token) {
	try {
		const headers = {};
		if (token) headers.Authorization = `Bearer ${token}`;

		const response = await fetch(`${API_BASE_URL}/places/`, {
			method: 'GET',
			headers
		});

		if (!response.ok) throw new Error(`Failed with status ${response.status}`);

		const data = await safeJson(response);
		allPlaces = Array.isArray(data) ? data : [];
		displayPlaces(allPlaces);
	} catch (error) {
		console.error('fetchPlaces error:', error);
		const placesList = document.getElementById('places-list');
		if (placesList) {
			placesList.innerHTML = '<p>Failed to load places.</p>';
		}
	}
}

function displayPlaces(places) {
	const container = document.getElementById('places-list');
	if (!container) return;

	const amenityIcons = {
		wifi: 'icons/wi-fi-icon.png',
		gym: 'icons/weight.png',
		balcony: 'icons/balcony.png',
		valet: 'icons/keys.png',
		parking: 'icons/parking.png',
		pool: 'icons/swimming.png'
	};

	const currentUserId = getCurrentUserId();
	const isAdmin = isCurrentUserAdmin();

	container.innerHTML = '';

	places.forEach(place => {
		const card = document.createElement('div');
		card.className = 'place-card';

		const amenitiesHtml = Array.isArray(place.amenities)
			? place.amenities
				.filter(amenity => {
					const amenityName = (amenity.name || '').trim().toLowerCase();
					return amenityIcons[amenityName];
				})
				.map(amenity => {
					const amenityName = amenity.name || 'Amenity';
					const icon = amenityIcons[amenityName.trim().toLowerCase()];

					return `
						<div class="feature-item">
							<img src="${icon}" alt="${amenityName}">
							<span>${amenityName}</span>
						</div>
					`;
				})
				.join('')
			: '';

		const canDeletePlace = isAdmin || (currentUserId && place.owner_id === currentUserId);

		card.innerHTML = `
			<div class="place-card-top-actions">
				${canDeletePlace ? `
					<button
						type="button"
						class="delete-place-btn"
						data-place-id="${place.id}"
						aria-label="Delete place"
						title="Delete place"
					>×</button>
				` : ''}
			</div>

			${place.image_url ? `<img src="${place.image_url}" alt="${place.title}" class="place-image">` : ''}

			<div class="place-card-content">
				<h2>${place.title}</h2>

				<p class="place-location">
					${place.short_description || 'No description available'}
				</p>

				<div class="place-features">
					${amenitiesHtml || '<p class="no-amenities">No supported amenities</p>'}
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

	container.querySelectorAll('.delete-place-btn').forEach(button => {
		button.addEventListener('click', () => {
			const placeId = button.dataset.placeId;
			confirmDeletePlace(placeId);
		});
	});
}

function confirmDeletePlace(placeId) {
	if (!placeId) return;

	const confirmed = window.confirm('Are you sure you want to delete this place? This action cannot be undone.');
	if (!confirmed) return;

	deletePlace(placeId);
}

async function deletePlace(placeId) {
	const token = getToken();
	if (!token || !placeId) return;

	try {
		const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const data = await safeJson(response);

		if (!response.ok) {
			alert(data?.message || data?.error || 'Failed to delete place.');
			return;
		}

		allPlaces = allPlaces.filter(place => place.id !== placeId);
		displayPlaces(allPlaces);
		alert('Place deleted successfully.');
	} catch {
		alert('Server error while deleting place.');
	}
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

	const token = getToken();
	const addReviewSection = document.getElementById('add-review');
	const placeId = getPlaceIdFromURL();

	updateAuthNavLink();

	if (addReviewSection) {
		addReviewSection.style.display = 'block';
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
		if (token) headers.Authorization = `Bearer ${token}`;

		const response = await fetch(`${API_BASE_URL}/places/${placeId}`, { headers });

		if (!response.ok) throw new Error();

		const place = await safeJson(response);
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

	if (!section || !place) return;

	const galleryImages = [
		...(place.image_url ? [place.image_url] : []),
		...((place.images || []).map(img => img.image_url || img).filter(Boolean))
	];

	const visibleImages = galleryImages.slice(0, 5);
	const mainImage = visibleImages[0] || '';
	const sideImages = visibleImages.slice(1, 5);

	const reviewCount = place.reviews?.length || 0;
	const avgRating = reviewCount
		? (place.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount).toFixed(2)
		: '0.00';

	const reviewsHtml = place.reviews?.length
		? place.reviews.map(review => `
		<div class="review-card">
			<div class="review-card-header">
				<div class="review-user">
					${review.user_first_name || ''} ${review.user_last_name || ''}
				</div>
				<div class="review-rating">
					Rating: ${review.rating}/5
				</div>
			</div>
			<p class="review-text">${review.text}</p>
		</div>
	`).join('')
		: '<p class="no-reviews">No reviews yet.</p>';

	const stars = generateStars(Number(avgRating));

	const amenityIcons = {
		wifi: 'icons/wi-fi-icon.png',
		gym: 'icons/weight.png',
		balcony: 'icons/balcony.png',
		valet: 'icons/keys.png',
		parking: 'icons/parking.png',
		pool: 'icons/swimming.png'
	};

	const amenitiesHtml = place.amenities?.length
		? place.amenities
			.filter(amenity => {
				const amenityName = (amenity.name || '').trim().toLowerCase();
				return amenityIcons[amenityName];
			})
			.map(amenity => {
				const amenityName = amenity.name || 'Amenity';
				const icon = amenityIcons[amenityName.trim().toLowerCase()];

				return `
					<div class="place-amenity">
						<img src="${icon}" alt="${amenityName}">
						<span>${amenityName}</span>
					</div>
				`;
			}).join('')
		: '<p>No supported amenities available.</p>';

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
				<p class="place-subtitle">${place.short_description || 'No description available'}</p>
			</div>

			<div class="place-top-location">
				<strong>City</strong>
				<span>${place.city || 'Unknown'}</span>
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

			<div class="place-reviews-block">
				<h2>Reviews</h2>
				<div class="place-reviews-list">
					${reviewsHtml}
				</div>
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
		const token = getToken();

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

	const token = getToken();
	const placeId = getPlaceIdFromURL();
	const msg = document.getElementById('review-message');

	if (!token) {
		window.location.href = 'index.html';
		return;
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const text = document.getElementById('review-text')?.value.trim();
		const rating = Number(document.getElementById('rating')?.value);

		if (msg) msg.textContent = '';

		try {
			const res = await fetch(`${API_BASE_URL}/reviews/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					text,
					rating,
					place_id: placeId
				})
			});

			const data = await safeJson(res);

			if (res.ok) {
				if (msg) msg.textContent = 'Review submitted successfully!';
				form.reset();
			} else {
				if (msg) msg.textContent = data?.message || data?.error || 'Failed to submit review.';
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

	const savedTheme = localStorage.getItem('theme');

	if (savedTheme === 'dark') {
		page.classList.add('dark-mode');
		page.classList.remove('light-mode');
		darkBtn.classList.add('active');
		lightBtn.classList.remove('active');
	} else {
		page.classList.add('light-mode');
		page.classList.remove('dark-mode');
		lightBtn.classList.add('active');
		darkBtn.classList.remove('active');
	}

	lightBtn.addEventListener('click', () => {
		page.classList.remove('dark-mode');
		page.classList.add('light-mode');
		localStorage.setItem('theme', 'light');

		lightBtn.classList.add('active');
		darkBtn.classList.remove('active');
	});

	darkBtn.addEventListener('click', () => {
		page.classList.remove('light-mode');
		page.classList.add('dark-mode');
		localStorage.setItem('theme', 'dark');

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
		{ image: 'BG-IMGS/Los-angles.png', title: 'LOS ANGLES' },
		{ image: 'BG-IMGS/Riyadh.jpg', title: 'RIYADH' },
		{ image: 'BG-IMGS/Dubai.jpg', title: 'DUBAI' }
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

		const locationValue = locationInput ? locationInput.value.trim().toLowerCase() : '';

		if (locationValue) {
			filtered = filtered.filter(place =>
				(place.title && place.title.toLowerCase().includes(locationValue)) ||
				(place.short_description && place.short_description.toLowerCase().includes(locationValue)) ||
				(place.description && place.description.toLowerCase().includes(locationValue)) ||
				(place.city && place.city.toLowerCase().includes(locationValue))
			);
		}

		if (selectedGuests > 0) {
			filtered = filtered.filter(place => Number(place.max_guests) >= selectedGuests);
		}

		displayPlaces(filtered);
	});
}

/* =========================
   Gallery Lightbox
========================= */
function setupGalleryLightbox(images = []) {
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
		if (e.target === lightbox) closeLightbox();
	};

	document.addEventListener('keydown', (e) => {
		if (!lightbox.classList.contains('open')) return;

		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowLeft') showPrev();
		if (e.key === 'ArrowRight') showNext();
	});
}

/* =========================
   Booking Date Picker
========================= */
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
		},
		onChange: function (dates) {
			selectedDates = dates;
		}
	});

	function updateBookingTotal(fromDate, toDate) {
		if (!fromDate || !toDate) {
			nightsEl.textContent = '0';
			totalEl.textContent = `$${pricePerNight || 0}`;
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

/* =========================
   Inline Review Form
========================= */
function setupInlineReviewForm(placeId) {
	const form = document.getElementById('inline-review-form');
	const message = document.getElementById('inline-review-message');
	const token = getToken();

	const stars = document.querySelectorAll('#star-rating .star');
	const ratingInput = document.getElementById('inline-review-rating');

	let currentRating = 0;

	if (stars.length) {
		stars.forEach(star => {
			star.addEventListener('mouseenter', () => {
				highlightStars(Number(star.dataset.value));
			});

			star.addEventListener('mouseleave', () => {
				highlightStars(currentRating);
			});

			star.addEventListener('click', () => {
				currentRating = Number(star.dataset.value);
				if (ratingInput) ratingInput.value = currentRating;
				highlightStars(currentRating);
			});
		});
	}

	function highlightStars(rating) {
		stars.forEach(star => {
			star.classList.toggle('active', Number(star.dataset.value) <= Number(rating));
		});
	}

	if (!form || !message || !token || !placeId) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const rating = Number(ratingInput?.value);
		const text = document.getElementById('inline-review-text')?.value.trim();

		if (!rating) {
			message.textContent = 'Please select a rating.';
			return;
		}

		message.textContent = '';

		try {
			const response = await fetch(`${API_BASE_URL}/reviews/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					text,
					rating,
					place_id: placeId
				})
			});

			const data = await safeJson(response);

			if (!response.ok) {
				message.textContent = data?.message || data?.error || 'Failed to submit review.';
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

/* =========================
   Amenities
========================= */
async function loadAmenities() {
	const container = document.getElementById('amenities-list');
	if (!container) return;

	try {
		const res = await fetch(`${API_BASE_URL}/amenities/`);
		if (!res.ok) throw new Error();

		const data = await safeJson(res);

		container.innerHTML = '';

		data.forEach(a => {
			container.innerHTML += `
				<label class="amenity-item">
					<input type="checkbox" value="${a.id}">
					${a.name}
				</label>
			`;
		});
	} catch {
		container.innerHTML = '<p>Failed to load amenities.</p>';
	}
}

function loadAmenitiesForAddPlace() {
	const container = document.getElementById('amenities-list');
	if (!container) return;

	fetch(`${API_BASE_URL}/amenities/`)
		.then(res => {
			if (!res.ok) throw new Error();
			return res.json();
		})
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

/* =========================
   Add Place Page
========================= */
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

	gallery.innerHTML = '';

	const allImages = [
		...(addPlaceMainImage ? [{ url: addPlaceMainImage, type: 'main' }] : []),
		...addPlaceOtherImages.map((url, index) => ({
			url,
			type: 'other',
			index
		}))
	];

	allImages.forEach((image, index) => {
		const label = image.type === 'main' ? 'Main Photo' : `Photo ${index + 1}`;

		gallery.innerHTML += `
			<div class="preview-gallery-item">
				<img src="${image.url}" alt="Preview ${index + 1}">
				
				<button
					type="button"
					class="remove-preview-btn"
					data-type="${image.type}"
					${image.type === 'other' ? `data-index="${image.index}"` : ''}
					aria-label="Remove image"
				>
					×
				</button>

				<span class="preview-badge">${label}</span>
			</div>
		`;
	});

	gallery.querySelectorAll('.remove-preview-btn').forEach(button => {
		button.addEventListener('click', () => {
			const type = button.dataset.type;

			if (type === 'main') {
				addPlaceMainImage = '';
			} else if (type === 'other') {
				const imageIndex = Number(button.dataset.index);
				addPlaceOtherImages.splice(imageIndex, 1);
			}

			renderAddPlacePreviewGallery();
		});
	});
}

function setupAddPlaceForm() {
	const form = document.getElementById('add-place-form');
	const message = document.getElementById('add-place-message');

	if (!form) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const token = getToken();

		if (!token) {
			window.location.href = 'login.html';
			return;
		}

		const title = document.getElementById('title')?.value.trim();
		const shortDescription = document.getElementById('short-description')?.value.trim();
		const description = document.getElementById('description')?.value.trim();
		const price = Number(document.getElementById('price')?.value);
		const guests = Number(document.getElementById('guests')?.value);
		const city = document.getElementById('city')?.value.trim();

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
			image_url: addPlaceMainImage || '',
			images: addPlaceOtherImages,
			amenities: selectedAmenities,
			latitude: 0,
			longitude: 0
		};

		if (message) message.textContent = '';

		try {
			const response = await fetch(`${API_BASE_URL}/places/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			});

			const data = await safeJson(response);

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

/* =========================
   Admin Page
========================= */
function protectAdminPage() {
	if (!document.body.classList.contains('admin-page')) return;

	const token = getToken();
	if (!token) {
		window.location.href = 'login.html';
		return;
	}

	const payload = parseJwt(token);
	if (!payload || !payload.is_admin) {
		window.location.href = 'index.html';
	}
}

async function loadAdminAmenities() {
	const container = document.getElementById('admin-amenities-list');
	if (!container) return;

	try {
		const res = await fetch(`${API_BASE_URL}/amenities/`);
		if (!res.ok) throw new Error();

		const amenities = await safeJson(res);
		container.innerHTML = '';

		amenities.forEach(amenity => {
			container.innerHTML += `
				<div class="admin-amenity-item">
					<span class="admin-amenity-name">${amenity.name}</span>
					<button
						type="button"
						class="delete-mini-btn"
						data-amenity-id="${amenity.id}"
						aria-label="Delete amenity"
					>−</button>
				</div>
			`;
		});

		container.querySelectorAll('.delete-mini-btn').forEach(btn => {
			btn.addEventListener('click', () => deleteAmenity(btn.dataset.amenityId));
		});
	} catch {
		container.innerHTML = '<p>Failed to load amenities.</p>';
	}
}

function setupAdminAmenityForm() {
	const btn = document.getElementById('add-amenity-btn');
	const input = document.getElementById('new-amenity-name');
	const message = document.getElementById('admin-amenity-message');

	if (!btn || !input) return;

	btn.addEventListener('click', async () => {
		const token = getToken();
		const name = input.value.trim();

		if (!name) return;

		if (message) message.textContent = '';

		try {
			const res = await fetch(`${API_BASE_URL}/amenities/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ name })
			});

			const data = await safeJson(res);

			if (!res.ok) {
				if (message) message.textContent = data?.message || data?.error || 'Failed to add amenity.';
				return;
			}

			input.value = '';
			if (message) message.textContent = 'Amenity added successfully.';
			loadAdminAmenities();
			loadAmenitiesForAddPlace();
		} catch {
			if (message) message.textContent = 'Server error.';
		}
	});
}

async function deleteAmenity(amenityId) {
	const token = getToken();
	if (!token || !amenityId) return;

	try {
		const res = await fetch(`${API_BASE_URL}/amenities/${amenityId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) return;

		loadAdminAmenities();
		loadAmenitiesForAddPlace();
	} catch {
		console.log('Failed to delete amenity');
	}
}

async function loadAdminReviews(placeId = '') {
	const container = document.getElementById('admin-reviews-list');
	if (!container) return;

	try {
		const query = placeId ? `?place_id=${encodeURIComponent(placeId)}` : '';
		const res = await fetch(`${API_BASE_URL}/reviews/${query}`);
		if (!res.ok) throw new Error();

		const reviews = await safeJson(res);
		container.innerHTML = '';

		if (!reviews.length) {
			container.innerHTML = '<p>No reviews found.</p>';
			return;
		}

		reviews.forEach(review => {
			container.innerHTML += `
				<div class="admin-review-card">
					<div class="admin-review-place">Place ID: ${review.place_id}</div>
					<div class="admin-review-title">Review</div>
					<div class="admin-review-text">${review.text}</div>

					<div class="admin-review-footer">
						<div class="admin-review-meta">
							Rating: ${review.rating} | User ID: ${review.user_id}
						</div>
						<button
							type="button"
							class="review-delete-btn"
							data-review-id="${review.id}"
						>
							Delete review
						</button>
					</div>
				</div>
			`;
		});

		container.querySelectorAll('.review-delete-btn').forEach(btn => {
			btn.addEventListener('click', () => deleteAdminReview(btn.dataset.reviewId));
		});
	} catch {
		container.innerHTML = '<p>Failed to load reviews.</p>';
	}
}

function setupAdminReviewSearch() {
	const searchBtn = document.getElementById('search-reviews-btn');
	const loadAllBtn = document.getElementById('load-all-reviews-btn');
	const input = document.getElementById('review-place-id-search');

	if (searchBtn && input) {
		searchBtn.addEventListener('click', () => {
			loadAdminReviews(input.value.trim());
		});
	}

	if (loadAllBtn) {
		loadAllBtn.addEventListener('click', () => {
			if (input) input.value = '';
			loadAdminReviews();
		});
	}
}

async function deleteAdminReview(reviewId) {
	const token = getToken();
	if (!token || !reviewId) return;

	try {
		const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) return;

		const input = document.getElementById('review-place-id-search');
		loadAdminReviews(input ? input.value.trim() : '');
	} catch {
		console.log('Failed to delete review');
	}
}

function generateStars(rating) {
	const fullStars = Math.floor(rating);
	const emptyStars = 5 - fullStars;

	return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
}

function setupSignupForm() {
	const loginForm = document.getElementById('login-form');
	const signupForm = document.getElementById('signup-form');
	const showSignupBtn = document.getElementById('show-signup-btn');
	const showLoginBtn = document.getElementById('show-login-btn');
	const signupMessage = document.getElementById('signup-message');

	if (!loginForm || !signupForm || !showSignupBtn || !showLoginBtn) return;

	showSignupBtn.addEventListener('click', () => {
		loginForm.classList.add('hidden-form');
		signupForm.classList.remove('hidden-form');
	});

	showLoginBtn.addEventListener('click', () => {
		signupForm.classList.add('hidden-form');
		loginForm.classList.remove('hidden-form');
	});

	signupForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const email = document.getElementById('signup-email')?.value.trim();
		const firstName = document.getElementById('signup-first-name')?.value.trim();
		const lastName = document.getElementById('signup-last-name')?.value.trim();
		const password = document.getElementById('signup-password')?.value.trim();
		const confirmPassword = document.getElementById('signup-confirm-password')?.value.trim();

		if (signupMessage) signupMessage.textContent = '';

		if (password !== confirmPassword) {
			if (signupMessage) signupMessage.textContent = 'Passwords do not match.';
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/users/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					first_name: firstName,
					last_name: lastName,
					password
				})
			});

			const data = await safeJson(response);

			if (!response.ok) {
				if (signupMessage) {
					signupMessage.textContent = data?.message || data?.error || 'Failed to create account.';
				}
				return;
			}

			if (signupMessage) {
				signupMessage.textContent = 'Account created successfully. You can login now.';
			}

			signupForm.reset();

			setTimeout(() => {
				signupForm.classList.add('hidden-form');
				loginForm.classList.remove('hidden-form');
			}, 1000);

		} catch {
			if (signupMessage) {
				signupMessage.textContent = 'Server connection error.';
			}
		}
	});
}