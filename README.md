# Exam Buster

A web app to help students prepare for an exam.
Just uploading past assignments from the semester and get tailored feedback along with a study plan and sample problems to solve.
Supercharged with Cerebras inference.

Made for [Cerebras.ai](https://www.cerebras.ai/) + OpenRouter hackathon.

## Features

- User authentication and data storage via **PocketBase**
- Upload and list assignments with AI generated summaries
- Create interactive study plans with
  - Taylored problems
  - Step-by-step solutions
- Responsive UI built with tailwind and shadcn

## Tech Stack

- Frontend: React, TypeScript, Bun, Tailwind CSS
- Backend: PocketBase (embedded), Bun

## Getting Started

- [Bun](https://bun.sh) (v1.x or newer)
- [PocketBase](https://pocketbase.io/) (binary not included in this repo)


### Running the PocketBase

Start the PocketBase server:

```bash
./pocketbase/pocketbase serve
```

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
├── pocketbase/           # PocketBase binary, data, and migrations
├── src/
│   ├── frontend/         # React application (App.tsx, pages, components)
│   ├── components/ui/    # Shadcn UI component wrappers
│   ├── lib/              # PocketBase client configuration
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
