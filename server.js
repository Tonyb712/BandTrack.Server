// server.js
// Simple BandTrack demo backend (no real database, in-memory only)

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ===== "Database" (in-memory demo data) =====

let users = [
  {
    id: 1,
    username: 'demo',
    password: 'password',
    role: "user",
    followedArtists: [1],
  },
  
  {
  id: 999,
  username: "admin",
  password: "admin123",
  role: "admin",
  followedArtists: []
},

];

let artists = [
  { id: 1, name: 'The Weekend Vibes' },
  { id: 2, name: 'City Lights Band' },
  { id: 3, name: 'Acoustic Souls' },
 
  // ==== NEW ARTIST AND CONCERT ====
  { id: 4, name: "Neon Skyline" },
];

let concerts = [
  {
    id: 1,
    title: 'Weekend Vibes Live in NYC',
    date: '2025-12-01',
    artistId: 1,
    ticketUrl: 'https://tickets.example.com/concert/1',
  },
  {
    id: 2,
    title: 'City Lights at LA Arena',
    date: '2025-12-15',
    artistId: 2,
    ticketUrl: 'https://tickets.example.com/concert/2',
  },
  {
    id: 3,
    title: 'Acoustic Night with Acoustic Souls',
    date: '2025-11-30',
    artistId: 3,
    ticketUrl: 'https://tickets.example.com/concert/3',
  },
  // ===== New Concert Push =====
  {
   id: 4,
  title: "Neon Skyline World Tour",
  date: "2026-01-10",
  artistId: 4,
  ticketUrl: "https://tickets.example.com/concert/4"
},
];

let reviews = [
  {
    id: 1,
    rating: 5,
    comment: 'Amazing performance!',
    userId: 1,
    artistId: 1,
  },
];

// ===== Helper functions =====

function findUserByUsername(username) {
  return users.find((u) => u.username === username);
}

function findUserById(id) {
  return users.find((u) => u.id === Number(id));
}

function findArtistById(id) {
  return artists.find((a) => a.id === Number(id));
}

function findConcertById(id) {
  return concerts.find((c) => c.id === Number(id));
}

// ===== Routes =====

// Basic health check
app.get('/', (req, res) => {
  res.send('BandTrack backend is running!');
});

// --- USER: login ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      role: user.role,
      username: user.username,
      followedArtists: user.followedArtists,
    },
  });
});

// --- USER: register ---
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (findUserByUsername(username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    followedArtists: [],
  };

  users.push(newUser);

  res.status(201).json({
    message: 'User registered',
    user: {
      id: newUser.id,
      username: newUser.username,
      followedArtists: newUser.followedArtists,
    },
  });
});

// --- ARTIST: list all ---
app.get('/artists', (req, res) => {
  res.json(artists);
});

// --- ARTIST: details + reviews ---
app.get('/artists/:artistId', (req, res) => {
  const artist = findArtistById(req.params.artistId);
  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }

  const artistReviews = reviews.filter(
    (r) => r.artistId === Number(req.params.artistId)
  );

  res.json({
    artist,
    reviews: artistReviews,
  });
});

// --- FOLLOW ARTIST ---
app.post('/users/:userId/follow/:artistId', (req, res) => {
  const user = findUserById(req.params.userId);
  const artist = findArtistById(req.params.artistId);

  if (!user || !artist) {
    return res.status(404).json({ message: 'User or artist not found' });
  }

  if (!user.followedArtists.includes(artist.id)) {
    user.followedArtists.push(artist.id);
  }

  res.json({
    message: `User ${user.username} now follows ${artist.name}`,
    followedArtists: user.followedArtists,
  });
});

// --- UNFOLLOW ARTIST ---
app.delete('/users/:userId/follow/:artistId', (req, res) => {
  const user = findUserById(req.params.userId);
  const artist = findArtistById(req.params.artistId);

  if (!user || !artist) {
    return res.status(404).json({ message: 'User or artist not found' });
  }

  user.followedArtists = user.followedArtists.filter(
    (id) => id !== artist.id
  );

  res.json({
    message: `User ${user.username} unfollowed ${artist.name}`,
    followedArtists: user.followedArtists,
  });
});

// --- CONCERTS: list (optional filter by artist) ---
app.get('/concerts', (req, res) => {
  const { artistId } = req.query;

  if (artistId) {
    return res.json(
      concerts.filter((c) => c.artistId === Number(artistId))
    );
  }

  res.json(concerts);
});

// --- CONCERT DETAILS ---
app.get('/concerts/:concertId', (req, res) => {
  const concert = findConcertById(req.params.concertId);
  if (!concert) {
    return res.status(404).json({ message: 'Concert not found' });
  }

  const artist = findArtistById(concert.artistId);
  res.json({
    ...concert,
    artistName: artist ? artist.name : null,
  });
});

// --- PURCHASE TICKET (demo) ---
app.post('/concerts/:concertId/purchase', (req, res) => {
  const concert = findConcertById(req.params.concertId);
  if (!concert) {
    return res.status(404).json({ message: 'Concert not found' });
  }

  res.json({
    message: 'Ticket purchase link',
    ticketUrl: concert.ticketUrl,
  });
});

// --- SHARE EVENT ---
app.get('/concerts/:concertId/share', (req, res) => {
  const concert = findConcertById(req.params.concertId);
  if (!concert) {
    return res.status(404).json({ message: 'Concert not found' });
  }

  const shareLink = `https://bandtrack.example.com/concert/${concert.id}`;
  res.json({
    message: 'Share this link with your friends',
    shareLink,
  });
});

// --- ADD REVIEW ---
app.post('/reviews', (req, res) => {
  const { rating, comment, userId, artistId } = req.body;

  const user = findUserById(userId);
  const artist = findArtistById(artistId);

  if (!user || !artist) {
    return res.status(404).json({ message: 'User or artist not found' });
  }

  const newReview = {
    id: reviews.length + 1,
    rating,
    comment,
    userId: user.id,
    artistId: artist.id,
  };

  reviews.push(newReview);

  res.status(201).json({
    message: 'Review added',
    review: newReview,
  });
});

// --- LIST REVIEWS ---
app.get('/artists/:artistId/reviews', (req, res) => {
  const artist = findArtistById(req.params.artistId);
  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }

  const artistReviews = reviews.filter(
    (r) => r.artistId === Number(req.params.artistId)
  );

  res.json(artistReviews);
});

function requireAdmin(req, res, next) {
  const { userId } = req.body;

  const user = findUserById(userId);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ 
      message: "Access denied: admin only" 
    });
  }

  next();
}

// =====================================================
// ADMIN ROUTES
// =====================================================

// GET ALL USERS
app.post("/admin/users", requireAdmin, (req, res) => {
  res.json(users);
});

// DELETE USER
app.post("/admin/user/delete", requireAdmin, (req, res) => {
  const { deleteId } = req.body;

  users = users.filter(u => u.id !== deleteId);

  res.json({ message: "User deleted", users });
});

// ADD ARTIST
app.post("/admin/artist/add", requireAdmin, (req, res) => {
  const { name } = req.body;

  const newArtist = {
    id: artists.length + 1,
    name
  };

  artists.push(newArtist);

  res.json({ message: "Artist added", artist: newArtist });
});

// DELETE ARTIST
app.post("/admin/artist/delete", requireAdmin, (req, res) => {
  const { artistId } = req.body;

  artists = artists.filter(a => a.id !== artistId);
  concerts = concerts.filter(c => c.artistId !== artistId);
  reviews = reviews.filter(r => r.artistId !== artistId);

  res.json({ message: "Artist deleted" });
});

// ADD CONCERT
app.post("/admin/concert/add", requireAdmin, (req, res) => {
  const { title, date, artistId } = req.body;

  const newConcert = {
    id: concerts.length + 1,
    title,
    date,
    artistId,
    ticketUrl: `https://tickets.example.com/concert/${concerts.length + 1}`
  };

  concerts.push(newConcert);

  res.json({ message: "Concert added", concert: newConcert });
});

// DELETE CONCERT
app.post("/admin/concert/delete", requireAdmin, (req, res) => {
  const { concertId } = req.body;

  concerts = concerts.filter(c => c.id !== concertId);
  reviews = reviews.filter(r => r.concertId !== concertId);

  res.json({ message: "Concert deleted" });
});

// DELETE REVIEW
app.post("/admin/review/delete", requireAdmin, (req, res) => {
  const { reviewId } = req.body;

  reviews = reviews.filter(r => r.id !== reviewId);

  res.json({ message: "Review deleted" });
});


// ===== Start server =====

app.listen(PORT, () => {
  console.log(`BandTrack backend listening on http://localhost:${PORT}`);
});

