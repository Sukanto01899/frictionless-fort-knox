# Frictionless Fort Knox Frontend

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Stacks & Chainhooks

This project integrates:
- `@stacks/connect` for wallet connections (Stacks Connect + WalletConnect).
- `@stacks/transactions` for transaction signing (see `src/lib/stacks-tx`).
- `@hirosystems/chainhooks-client` for event listening (see `src/lib/chainhooks`).

To enable WalletConnect, set `VITE_WALLETCONNECT_PROJECT_ID` in `frontend/.env`.

## Chainhooks Demo

This demo highlights the Fort Knox `execute-action` flow by streaming contract-call events into the UI.

1. Start a public tunnel to your local webhook (example uses ngrok):

```bash
ngrok http 3999
```

2. In one terminal, run the webhook receiver:

```bash
cd frontend
node scripts/chainhooks-demo.mjs
```

3. In another terminal, register the chainhook (requires an API key):

```bash
cd frontend
set CHAINHOOKS_API_KEY=your_key
set CHAINHOOK_WEBHOOK_URL=https://your-public-url/webhook
set VITE_STACKS_NETWORK=testnet
set VITE_CONTRACT_ADDRESS=ST1...
set VITE_CONTRACT_NAME=frictionless-fort-knox
node scripts/chainhooks-demo.mjs register
```

4. Start the frontend and trigger `execute-action` calls. New activity will appear in the Action Ledger panel.
