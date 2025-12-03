const API_BASE = 'http://localhost:3000';

let currentUser = null;
let selectedArtistId = null;

// DOM elements
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const registerButton = document.getElementById('register-button');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');

const appSection = document.getElementById('app-section');
const userInfoSpan = document.getElementById('user-info');
const logoutButton = document.getElementById('logout-button');

const artistsListDiv = document.getElementById('artists-list');
const concertsListDiv = document.getElementById('concerts-list');
const concertsTitle = document.getElementById('concerts-title');
const reviewsListDiv = document.getElementById('reviews-list');
const reviewsTitle = document.getElementById('reviews-title');

const reviewForm = document.getElementById('review-form');
const reviewRatingInput = document.getElementById('review-rating');
const reviewCommentInput = document.getElementById('review-comment');
const reviewMessage = document.getElementById('review-message');

// --- Event listeners ---

loginForm.addEventListener('submit', handleLogin);
registerButton.addEventListener('click', handleRegister);
logoutButton.addEventListener('click', handleLogout);
reviewForm.addEventListener('submit', handleAddReview);

// --- Auth handlers ---

async function handleLogin(event) {
  event.preventDefault();
  clearMessage(loginMessage);

  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password) {
    showError(loginMessage, 'Please enter username and password.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      showError(loginMessage, 'Invalid username or password.');
      return;
    }

    const data = await res.json();
    currentUser = data.user;
    showSuccess(loginMessage, 'Login successful.');

    showApp();
    await loadArtists();

  } catch (err) {
    console.error(err);
    showError(loginMessage, 'Error connecting to server.');
  }
}

async function handleRegister() {
  clearMessage(loginMessage);

  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password) {
    showError(loginMessage, 'Enter username and password, then click Register.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(loginMessage, data.message || 'Registration failed.');
      return;
    }

    showSuccess(loginMessage, 'Registered! Now click Login to sign in.');

  } catch (err) {
    console.error(err);
    showError(loginMessage, 'Error connecting to server.');
  }
}

function handleLogout() {
  currentUser = null;
  selectedArtistId = null;
  loginSection.classList.remove('hidden');
  appSection.classList.add('hidden');
  loginForm.reset();
  clearAppViews();
}

// --- UI helpers ---
  function showApp() {
  // If admin login → redirect to admin panel
  if (currentUser.role === "admin") {
    window.location.href = "admin.html";
    return;
  }

  // Otherwise show normal user app
  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  userInfoSpan.textContent = `Logged in as: ${currentUser.username}`;
  clearAppViews();
}

function clearAppViews() {
  artistsListDiv.innerHTML = '';
  concertsListDiv.innerHTML = '';
  reviewsListDiv.innerHTML = '';
  concertsTitle.textContent = 'Select an artist to see concerts';
  reviewsTitle.textContent = 'Select an artist to see reviews';
  reviewForm.classList.add('hidden');
  reviewMessage.textContent = '';
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('success');
  element.classList.add('error');
}

function showSuccess(element, message) {
  element.textContent = message;
  element.classList.remove('error');
  element.classList.add('success');
}

function clearMessage(element) {
  element.textContent = '';
  element.classList.remove('error', 'success');
}

// --- Load & render artists ---

async function loadArtists() {
  try {
    const res = await fetch(`${API_BASE}/artists`);
    const artists = await res.json();
    renderArtists(artists);
  } catch (err) {
    console.error(err);
    artistsListDiv.innerHTML = '<p class="message error">Failed to load artists.</p>';
  }
}

function renderArtists(artists) {
  artistsListDiv.innerHTML = '';

  if (!artists.length) {
    artistsListDiv.innerHTML = '<p>No artists found.</p>';
    return;
  }

  artists.forEach((artist) => {
    const item = document.createElement('div');
    item.className = 'list-item';

    const header = document.createElement('div');
    header.className = 'list-header';

    const title = document.createElement('span');
    title.className = 'list-title';
    title.textContent = artist.name;

    // Follow badge
    if (currentUser && currentUser.followedArtists.includes(artist.id)) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Following';
      title.appendChild(badge);
    }

    header.appendChild(title);

    // Buttons
    const btnRow = document.createElement('div');

    // Follow / Unfollow button
    const followBtn = document.createElement('button');
    followBtn.className = 'small';
    if (currentUser.followedArtists.includes(artist.id)) {
      followBtn.textContent = 'Unfollow';
      followBtn.addEventListener('click', () => handleUnfollow(artist.id));
    } else {
      followBtn.textContent = 'Follow';
      followBtn.addEventListener('click', () => handleFollow(artist.id));
    }

    // View concerts button
    const concertsBtn = document.createElement('button');
    concertsBtn.className = 'small secondary';
    concertsBtn.textContent = 'Concerts';
    concertsBtn.addEventListener('click', () => handleSelectArtistConcerts(artist));

    // View reviews button
    const reviewsBtn = document.createElement('button');
    reviewsBtn.className = 'small secondary';
    reviewsBtn.textContent = 'Reviews';
    reviewsBtn.addEventListener('click', () => handleSelectArtistReviews(artist));

    btnRow.appendChild(followBtn);
    btnRow.appendChild(concertsBtn);
    btnRow.appendChild(reviewsBtn);
    header.appendChild(btnRow);

    item.appendChild(header);
    artistsListDiv.appendChild(item);
  });
}

// --- Follow / Unfollow ---

async function handleFollow(artistId) {
  if (!currentUser) return;

  try {
    const res = await fetch(
      `${API_BASE}/users/${currentUser.id}/follow/${artistId}`,
      { method: 'POST' }
    );
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to follow artist.');
      return;
    }

    currentUser.followedArtists = data.followedArtists;
    await loadArtists();

  } catch (err) {
    console.error(err);
    alert('Error connecting to server.');
  }
}

async function handleUnfollow(artistId) {
  if (!currentUser) return;

  try {
    const res = await fetch(
      `${API_BASE}/users/${currentUser.id}/follow/${artistId}`,
      { method: 'DELETE' }
    );
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to unfollow artist.');
      return;
    }

    currentUser.followedArtists = data.followedArtists;
    await loadArtists();

  } catch (err) {
    console.error(err);
    alert('Error connecting to server.');
  }
}

// --- Concerts ---

async function handleSelectArtistConcerts(artist) {
  selectedArtistId = artist.id;
  concertsTitle.textContent = `Concerts for ${artist.name}`;

  try {
    const res = await fetch(`${API_BASE}/concerts?artistId=${artist.id}`);
    const concerts = await res.json();
    renderConcerts(concerts);
  } catch (err) {
    console.error(err);
    concertsListDiv.innerHTML = '<p class="message error">Failed to load concerts.</p>';
  }
}

function renderConcerts(concerts) {
  concertsListDiv.innerHTML = '';

  if (!concerts.length) {
    concertsListDiv.innerHTML = '<p>No concerts found.</p>';
    return;
  }

  concerts.forEach((concert) => {
    const item = document.createElement('div');
    item.className = 'list-item';

    const header = document.createElement('div');
    header.className = 'list-header';

    const title = document.createElement('span');
    title.className = 'list-title';
    title.textContent = concert.title;

    const meta = document.createElement('span');
    meta.className = 'list-meta';
    meta.textContent = concert.date;

    header.appendChild(title);
    header.appendChild(meta);

    const btnRow = document.createElement('div');
    btnRow.style.marginTop = '0.35rem';

    const ticketBtn = document.createElement('button');
    ticketBtn.className = 'small';
    ticketBtn.textContent = 'Ticket Link';
    ticketBtn.addEventListener('click', () => handleTicketLink(concert.id));

    const shareBtn = document.createElement('button');
    shareBtn.className = 'small secondary';
    shareBtn.textContent = 'Share Link';
    shareBtn.addEventListener('click', () => handleShareLink(concert.id));

    btnRow.appendChild(ticketBtn);
    btnRow.appendChild(shareBtn);

    item.appendChild(header);
    item.appendChild(btnRow);
    concertsListDiv.appendChild(item);
  });
}

async function handleTicketLink(concertId) {
  try {
    const res = await fetch(`${API_BASE}/concerts/${concertId}/purchase`, {
      method: 'POST',
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to get ticket link.');
      return;
    }

    if (data.ticketUrl) {
      window.open(data.ticketUrl, '_blank');
    } else {
      alert('No ticket URL found.');
    }
  } catch (err) {
    console.error(err);
    alert('Error connecting to server.');
  }
}

async function handleShareLink(concertId) {
  try {
    const res = await fetch(`${API_BASE}/concerts/${concertId}/share`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to get share link.');
      return;
    }

    alert(`Share this link: ${data.shareLink}`);
  } catch (err) {
    console.error(err);
    alert('Error connecting to server.');
  }
}

// --- Reviews ---

async function handleSelectArtistReviews(artist) {
  selectedArtistId = artist.id;
  reviewsTitle.textContent = `Reviews for ${artist.name}`;

  reviewForm.classList.remove('hidden');
  reviewMessage.textContent = '';
  reviewRatingInput.value = '';
  reviewCommentInput.value = '';

  try {
    const res = await fetch(`${API_BASE}/artists/${artist.id}/reviews`);
    const reviews = await res.json();
    renderReviews(reviews);
  } catch (err) {
    console.error(err);
    reviewsListDiv.innerHTML = '<p class="message error">Failed to load reviews.</p>';
  }
}

function renderReviews(reviews) {
  reviewsListDiv.innerHTML = '';

  if (!reviews.length) {
    reviewsListDiv.innerHTML = '<p>No reviews yet. Be the first!</p>';
    return;
  }

  reviews.forEach((review) => {
    const item = document.createElement('div');
    item.className = 'list-item';

    const rating = document.createElement('div');
    rating.className = 'review-rating';
    rating.textContent = `Rating: ${review.rating} / 5`;

    const comment = document.createElement('div');
    comment.className = 'review-comment';
    comment.textContent = review.comment;

    const user = document.createElement('div');
    user.className = 'review-user';
    user.textContent = `User ID: ${review.userId}`;

    item.appendChild(rating);
    item.appendChild(comment);
    item.appendChild(user);

    reviewsListDiv.appendChild(item);
  });
}

async function handleAddReview(event) {
  event.preventDefault();
  clearMessage(reviewMessage);

  if (!currentUser || !selectedArtistId) {
    showError(reviewMessage, 'Select an artist and be logged in to post a review.');
    return;
  }

  const rating = Number(reviewRatingInput.value);
  const comment = reviewCommentInput.value.trim();

  if (!rating || rating < 1 || rating > 5 || !comment) {
    showError(reviewMessage, 'Please enter a rating (1–5) and a comment.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        comment,
        userId: currentUser.id,
        artistId: selectedArtistId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(reviewMessage, data.message || 'Failed to add review.');
      return;
    }

    showSuccess(reviewMessage, 'Review added!');
    reviewForm.reset();

    // Reload reviews
    const reviewsRes = await fetch(`${API_BASE}/artists/${selectedArtistId}/reviews`);
    const reviews = await reviewsRes.json();
    renderReviews(reviews);

  } catch (err) {
    console.error(err);
    showError(reviewMessage, 'Error connecting to server.');
  }
}
