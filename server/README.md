Goal: Transition the Game model and logic from the client to the server

Initial Approach:
- All game interactions exposed via JSON REST APIs
- APIs consumed via polling (no push or sockets)
- App itself is stateless to allow for exploring scalability in the future
- Game state stored in PostgreSQL

Miro Docs (to-be-developed)
- DB Schema
- API Schema

How To Run
- run the command `npm install` to install all dependencies
- run in development mode via `npm run dev` OR
- run in production mode via `npm run start`

NOTE: By default, the app is hosted @ `http:/localhost:3000/`