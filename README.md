FEATURES

Users:

Register

Log in

Follow an artist

Unfollow an artist

Artists:

View all artists

View artist details

View artist reviews

Concerts:

View all concerts

Filter concerts by artist

View concert details

Get ticket purchase link (demo)

Get shareable concert link

Reviews:

Add a review

List reviews for an artist

PROJECT STRUCTURE

BandTrackServer/
server.js
package.json
package-lock.json
README.md
.gitignore

HOW TO INSTALL

Install Node.js from https://nodejs.org

Open a terminal inside the BandTrackServer folder

Run:

npm install

HOW TO RUN THE SERVER

Start the server:

npm start

You should see:

BandTrack backend listening on http://localhost:3000

Open in browser:

http://localhost:3000/

API ENDPOINTS

Users:
POST /login
POST /register
POST /users/:userId/follow/:artistId
DELETE /users/:userId/follow/:artistId

Artists:
GET /artists
GET /artists/:artistId
GET /artists/:artistId/reviews

Concerts:
GET /concerts
GET /concerts?artistId=ID
GET /concerts/:concertId
POST /concerts/:concertId/purchase
GET /concerts/:concertId/share

Reviews:
POST /reviews
