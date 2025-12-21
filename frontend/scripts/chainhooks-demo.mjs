import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = join(ROOT_DIR, '..', 'public', 'chainhook-events.json');
const MAX_EVENTS = 20;

const loadEvents = async () => {
  try {
    const data = await readFile(EVENTS_PATH, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveEvents = async (events) => {
  await mkdir(dirname(EVENTS_PATH), { recursive: true });
  await writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (error) {
        reject(error);
      }
    });
  });

const normalizeEvents = (payload) => {
  const entries = [];
  const apply = payload?.event?.apply ?? [];
  for (const block of apply) {
    const blockHeight = block?.block_identifier?.index ?? 0;
    const timestamp = block?.timestamp ?? Date.now();
    const transactions = block?.transactions ?? [];
    for (const tx of transactions) {
      const txid = tx?.transaction_identifier?.hash ?? 'unknown';
      const sender = tx?.metadata?.sender_address ?? 'unknown';
      const operations = tx?.operations ?? [];
      for (const op of operations) {
        if (op?.type !== 'contract_call') {
          continue;
        }
        const meta = op?.metadata ?? {};
        const contractIdentifier = meta.contract_identifier ?? 'unknown';
        const functionName = meta.function_name ?? 'contract_call';
        const id = `${txid}:${op?.operation_identifier?.index ?? 0}`;
        entries.push({
          id,
          txid,
          sender,
          contractIdentifier,
          functionName,
          blockHeight,
          timestamp,
        });
      }
    }
  }
  return entries;
};

const mergeEvents = (existing, incoming) => {
  const byId = new Map(existing.map((event) => [event.id, event]));
  for (const event of incoming) {
    byId.set(event.id, event);
  }
  return Array.from(byId.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_EVENTS);
};

const startServer = async () => {
  const port = Number(process.env.CHAINHOOK_WEBHOOK_PORT ?? 3999);
  const server = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
      try {
        const payload = await parseBody(req);
        const incoming = normalizeEvents(payload);
        if (incoming.length > 0) {
          const existing = await loadEvents();
          const next = mergeEvents(existing, incoming);
          await saveEvents(next);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, received: incoming.length }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid payload' }));
      }
      return;
    }

    if (req.method === 'GET' && req.url === '/events') {
      const events = await loadEvents();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(events));
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });

  server.listen(port, () => {
    console.log(`Chainhook demo webhook listening on http://localhost:${port}/webhook`);
  });
};

const registerChainhook = async () => {
  const apiKey = process.env.CHAINHOOKS_API_KEY;
  const jwt = process.env.CHAINHOOKS_JWT;
  if (!apiKey && !jwt) {
    throw new Error('Set CHAINHOOKS_API_KEY or CHAINHOOKS_JWT before registering.');
  }
  const webhookUrl = process.env.CHAINHOOK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('Set CHAINHOOK_WEBHOOK_URL to your public webhook endpoint.');
  }

  const network = process.env.CHAINHOOKS_NETWORK ?? process.env.VITE_STACKS_NETWORK ?? 'testnet';
  const contractAddress =
    process.env.VITE_CONTRACT_ADDRESS ??
    process.env.CONTRACT_ADDRESS ??
    'SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K';
  const contractName = process.env.VITE_CONTRACT_NAME ?? process.env.CONTRACT_NAME ?? 'frictionless-fort-knox';
  const contractIdentifier = `${contractAddress}.${contractName}`;

  const client = new ChainhooksClient({
    baseUrl: CHAINHOOKS_BASE_URL[network === 'mainnet' ? 'mainnet' : 'testnet'],
    apiKey,
    jwt,
  });

  const definition = {
    name: 'Fort Knox Action Monitor',
    version: '1',
    chain: 'stacks',
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
    filters: {
      events: [
        {
          type: 'contract_call',
          contract_identifier: contractIdentifier,
          function_name: 'execute-action',
        },
      ],
    },
    options: {
      enable_on_registration: true,
      decode_clarity_values: true,
      include_block_metadata: true,
    },
    action: {
      type: 'http_post',
      url: webhookUrl,
    },
  };

  const result = await client.registerChainhook(definition);
  console.log(`Chainhook registered: ${result.uuid}`);
};

const mode = process.argv[2] ?? 'server';
if (mode === 'register') {
  registerChainhook().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
} else {
  startServer().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
