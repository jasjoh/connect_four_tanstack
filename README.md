## Connect Four - TanStack Refactor
#### A refactor of my previous Connect Four Super project
##### Key Features
- Leverages TanStack to manage all client -> server communications

##### Stack
- React Front-End
- TanStack
- Node.js / Express.js Back-End
- TypeScript (server)
- PostgreSQL Database

##### Notable Engineering
- 80%+ unit server test coverage (via Jest)
- Factory Functions to support testing

### Local Setup / How To Run / How to Test
- run `npm install` in /client to install client dependencies
- run `npm install` in /server to install server dependencies
- install postgresql (V14.8 or later)
- setup databases: `psql -f /server/connect-four-init.sql` and accept prompts
- run the server in dev mode (`node srv/server/ts`) or retail (`npx tsc` to build then `node dist/server.js` to run server)
- server runs at `http://localhost:3000/`
- to test server, from `/server` run `jest`

##### Future Feature Ideas
- add identity and auth
- add online multiplayer
- add high scores / statistics
- add instrumentation / telemetry
- advanced ai algorithms