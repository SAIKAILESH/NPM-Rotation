// A minimal HTTP app that fetches the npm token from Secret Manager by *name*
// and returns only whether it exists (never logs/returns the value).

import express from 'express';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const app = express();
const port = process.env.PORT || 8080;
const client = new SecretManagerServiceClient();

// Pass only the secret *name* as env var, not the value.
// e.g., NPM_TOKEN_SECRET=projects/<PROJECT_ID>/secrets/npm-token
const secretName = process.env.NPM_TOKEN_SECRET;

async function fetchLatest(secretResourceName) {
  if (!secretResourceName) {
    throw new Error('NPM_TOKEN_SECRET env var is not set');
  }
  const name = `${secretResourceName}/versions/latest`;
  const [version] = await client.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

app.get('/', async (_req, res) => {
  try {
    const token = await fetchLatest(secretName);
    // Demonstrate presence (never log the token)
    res.status(200).send({ ok: true, token_present: Boolean(token && token.length > 0) });
  } catch (err) {
    console.error(err);
    res.status(500).send({ ok: false, error: String(err) });
  }
});

app.listen(port, () => console.log(`Listening on :${port}`));
