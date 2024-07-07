## Connect Four - TanStack Refactor
#### A refactor of my previous [Connect Four Super](https://github.com/jasjoh/connect_four_super) project
##### Key Features
- Leverages TanStack to manage all client -> server communications

##### Stack
- React Front-End
- TanStack
- Node.js / Express.js Back-End
- TypeScript (server)
- PostgreSQL Database
- Jest

##### Notable Engineering
- Server unit test coverage 80%
- Client unit test coverage 40%
- Factory Functions to support testing
- Singleton usage for server interactions

### Local Setup
- use `npm install` in /client to install client dependencies
- use `npm install` in /server to install server dependencies
- install postgresql (V14.8 or later) and start it
- setup databases using: `psql -f /server/connect-four-init.sql` and accept prompts

## Server Execution
- run the server in dev mode, use `/server/npm run dev`
- run the server in retail, use `/server/npm run live`
- server runs at `http://localhost:3001/`

## Tests
- to run client tests, use `/client/jest`
- to run server tests, use `/server/jest`

## Client Execution
- run the server in dev mode, use `/client/npm run start`
- use `npm run build` to create a build folder for deployment

##### Future Feature Ideas
- add identity and auth
- add online multiplayer
- add high scores / statistics
- add instrumentation / telemetry
- advanced ai algorithms
