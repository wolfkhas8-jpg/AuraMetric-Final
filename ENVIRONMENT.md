Vite & Env Guidance

- Server secrets (Stripe secret keys, PayPal secret) must live in a server-side `.env` and never be exposed to the client.
- For client-side config with Vite, use variables prefixed with `VITE_` and access them via `import.meta.env.VITE_MY_VAR`.
- Example: create `.env` (server) with `STRIPE_SECRET_KEY=sk_test_...` and start the server with `node server.js`.
- Example client env: `.env` (project root) -> `VITE_API_BASE=http://localhost:4242` then use `import.meta.env.VITE_API_BASE`.
