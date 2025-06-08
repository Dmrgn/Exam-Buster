# Exam Buster

A web app to help students prepare for an exam.
Just upload past assignments from the semester and get tailored feedback along with a study plan and sample problems to solve.
Supercharged with Cerebras inference.

Made for [Cerebras.ai](https://www.cerebras.ai/) + OpenRouter hackathon.

## Features

- User authentication and data storage via **PocketBase**
- Upload and list assignments with AI generated summaries
- Create interactive study plans with
  - Tailored problems
  - Step-by-step solutions
- Responsive UI built with tailwind and shadcn

## Tech Stack

- Frontend: React, TypeScript, Bun, Tailwind CSS
- Backend: PocketBase (embedded), Bun

## Getting Started

- [Bun](https://bun.sh) (v1.x or newer)
- [PocketBase](https://pocketbase.io/) (binary not included in this repo)


### Environment Variables

The following variables control the application. In development, you can omit `POCKETBASE_URL` to default to `http://127.0.0.1:8090`.
- POCKETBASE_URL: URL of your PocketBase server (e.g. `http://127.0.0.1:8090`)
- CEREBRAS_API_KEY: API key for Cerebras Cloud SDK
- OPENROUTER_API_KEY: API key for OpenRouter/OpenAI
- NODE_ENV: `development` or `production` (defaults to `development`)

### Running the PocketBase

Start the PocketBase server:

```bash
# Download the PocketBase binary for your OS from https://pocketbase.io/docs and place it in ./pocketbase
./pocketbase/pocketbase serve
```

The server will create its local data directory at `pocketbase/pb_data`, which is ignored by git. Do not commit this folder.

The API will be available at `http://127.0.0.1:8090`.

### Running the Frontend

In a new terminal tab/window, start the development server:

```bash
bun run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
.
├── pocketbase/           # PocketBase migrations (schema). The PocketBase binary and local data directory (pb_data) are git-ignored.
├── src/
│   ├── client/           # React application (App.tsx, pages, components)
│   ├── server/           # Bun server entrypoint and API routes
│   ├── components/       # Shared component library
│   │   ├── ui/           # Shadcn UI component wrappers
│   │   └── app/          # App-specific components (cards, nav, forms)
│   ├── lib/              # PocketBase client configuration & utilities
│   ├── hooks/            # Custom React hooks
│   └── styles/           # Tailwind CSS imports
├── styles/               # Global CSS
├── package.json          # Project dependencies and scripts
├── bunfig.toml           # Bun configuration
└── tsconfig.json         # TypeScript configuration
```

## Usage Notes

- On first load, you will be redirected to `/login` if not authenticated.
- Use the Upload Assignment button to add new assignments.
- Prep Cards display existing study plans. Expand problems and solution steps via the accordions.
