const API = "http://localhost:3000";
const ADMIN_ID = 999; // admin user

function loadUsers() {
  fetch(API + "/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: ADMIN_ID })
  })
  .then(res => res.json())
  .then(data => {
    const div = document.getElementById("users");
    div.innerHTML = "";
    data.forEach(u => {
      div.innerHTML += `
        <div class="list-item">
          <strong>${u.username}</strong> (id: ${u.id}, role: ${u.role})
          <button class="small" onclick="deleteUser(${u.id})">Delete</button>
        </div>
      `;
    });
  });
}

function deleteUser(id) {
  fetch(API + "/admin/user/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: ADMIN_ID, deleteId: id })
  })
  .then(() => loadUsers());
}

function addArtist() {
  const name = document.getElementById("artistName").value;

  fetch(API + "/admin/artist/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: ADMIN_ID, name })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("artistMessage").textContent = data.message;
  });
}

function addConcert() {
  const title = document.getElementById("concertTitle").value;
  const date = document.getElementById("concertDate").value;
  const artistId = Number(document.getElementById("concertArtist").value);

  fetch(API + "/admin/concert/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: ADMIN_ID, title, date, artistId })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("concertMessage").textContent = data.message;
  });
}

function loadReviews() {
  fetch(API + "/artists/1/reviews") // we'll override by loading ALL below
    .then(() => {
      // Load ALL reviews with direct backend access instead
      fetch(API + "/admin/all-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ADMIN_ID })
      })
      .then(res => res.json())
      .then(data => {
        const div = document.getElementById("reviews");
        div.innerHTML = "";
        data.forEach(r => {
          div.innerHTML += `
            <div class="list-item">
              <strong>Rating:</strong> ${r.rating}<br>
              <strong>Comment:</strong> ${r.comment}<br>
              <strong>User:</strong> ${r.userId} |
              <strong>Artist:</strong> ${r.artistId}
              <br>
              <button class="small" onclick="deleteReview(${r.id})">Delete</button>
            </div>
          `;
        });
      });
    });
}

function deleteReview(id) {
  fetch(API + "/admin/review/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: ADMIN_ID, reviewId: id })
  })
  .then(() => loadReviews());
}
// GET ALL REVIEWS (admin only)
app.post("/admin/all-reviews", requireAdmin, (req, res) => {
  res.json(reviews);
});

