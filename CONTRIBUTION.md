# Contributing to 척척발표

Thank you for taking the time to contribute. This document covers everything you need to get started.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)

---
  
## Prerequisites

| Tool    | Version                     | Install                            |
| ------- | --------------------------- | ---------------------------------- |
| Node.js | ≥ 22                        | [nodejs.org](https://nodejs.org)   |
| npm     | ≥ 10 (bundled with Node.js) | —                                  |
| Git     | any                         | [git-scm.com](https://git-scm.com) |

**Recommended IDE:** VS Code with the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd SSA

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
SSA/
├── src/
│   ├── components/      # Shared UI components
│   │   ├── AnalysisReport.tsx
│   │   ├── Header.tsx
│   │   ├── SlideUploader.tsx
│   │   ├── SlideViewer.tsx
│   │   └── SpeechPanel.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useSSAAnalysis.ts
│   │   └── useSpeechRecognition.ts
│   ├── data/            # Static demo data
│   ├── types/           # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── public/
├── eslint.config.js     # ESLint (typescript-eslint + react-hooks + react-refresh)
├── tailwind.config.js   # Tailwind CSS v4 config
├── vite.config.ts       # Vite config (base path switches for GitHub Pages vs local)
├── tsconfig.app.json
└── tsconfig.json
```

---

## Development Workflow

### Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start local dev server with HMR      |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint across all source files   |

### Before Opening a PR

Run these in order and make sure all pass:

```bash
npm run lint      # no lint errors
npm run build     # type-check + production build must succeed
```

### GitHub Pages Deployment

The `vite.config.ts` switches the base path automatically:

- **Local dev**: `/`
- **GitHub Actions**: `/SSA/`

Do not hardcode absolute paths in source — use relative imports and Vite's `import.meta.env.BASE_URL` when referencing public assets.

---

## Code Standards

This project uses **ESLint** with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Format consistently with your editor's ESLint integration.

Key rules enforced:

- React hooks rules (no conditional hook calls, exhaustive deps)
- React Refresh rules for fast HMR
- TypeScript type checking via `tseslint.configs.recommended`

**Immutability** — never mutate objects or arrays directly:

```typescript
// Wrong
user.name = "Alice";

// Correct
const updated = { ...user, name: "Alice" };
```

**File size** — keep files under 800 lines; extract utilities when a file grows large.

**No `console.log`** in committed code. Use proper error handling instead.

**Tailwind CSS v4** — use utility classes and CSS custom properties from `index.css`. Do not add inline styles for values that belong in the design token layer.

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>: <short description>

<optional body>
```

| Type       | Use when                                                |
| ---------- | ------------------------------------------------------- |
| `feat`     | Adding a new feature                                    |
| `fix`      | Fixing a bug                                            |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `docs`     | Documentation only changes                              |
| `chore`    | Build process, dependency updates, tooling              |
| `perf`     | Performance improvements                                |
| `ci`       | CI/CD configuration changes                             |

Examples:

```
feat: add speech recognition panel
fix: resolve base path on GitHub Pages
docs: update contributing guide
```

---

## Pull Request Process

1. **Branch** off `main` using a descriptive name: `feat/analysis-export`, `fix/slide-render`
2. **Keep PRs focused** — one feature or fix per PR
3. **Pass all checks** — `npm run lint` and `npm run build` must both succeed
4. **Write a clear description** — explain the _why_, not just the _what_
5. **Request a review** — at least one approval required before merging
6. **Squash merge** into `main` to keep history clean

---

## Questions?

Open an issue or start a discussion in the repository. We're happy to help.
