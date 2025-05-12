// index.js
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

// -- config from mounted volumes/env --
const ES_HOST = process.env.ES_HOST;
const ES_PORT = process.env.ES_PORT;
const INDEX_NAME = 'app-logs';

// secrets mounted at /opt/app-root/src/config/es/credentials
const CRED_DIR = '/opt/app-root/src/config/es/credentials';
const CA_PATH = '/opt/app-root/src/config/es/ca/ca.crt';

const username = fs.readFileSync(path.join(CRED_DIR, 'username'), 'utf8').trim();
const password = fs.readFileSync(path.join(CRED_DIR, 'password'), 'utf8').trim();
const ca = fs.readFileSync(CA_PATH);

// -- build the client --
const client = new Client({
  node: `https://${ES_HOST}:${ES_PORT}`,
  auth: { username, password },
  tls: { ca, rejectUnauthorized: false }   // NODE_TLS_REJECT_UNAUTHORIZED=0 style
});

// Brazilian names & actions
const users = ['Ana','Bruno','Carla','Daniel','Eduardo','Fernanda','Gabriel','Helena','Igor','Juliana','Lucas','Mariana','Neto','Patrícia','Rafael','Sofia','Tiago','Vanessa','Wesley','Yasmin','Zeca'];
const actions = ['transferencia','saque','consultaSaldo','consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function logAction() {
  const entry = {
    usuario: randomItem(users),
    acao:    randomItem(actions),
    timestamp: new Date().toISOString()
  };

  try {
    // index + refresh so we can immediately GET it
    const { body: indexed } = await client.index({
      index: INDEX_NAME,
      body:  entry,
      refresh: 'wait_for'
    });

    console.log(`✅ Indexed, id=${indexed._id}`);

    // now fetch it back by id
    const { body: got } = await client.get({
      index: INDEX_NAME,
      id:    indexed._id
    });

    console.log('🔍 Fetched:', got._source);

  } catch (err) {
    console.error('⛔️ Elasticsearch error:', err);
    console.log('🔄 Original entry:', entry);
  }
}

// run one now, then every 30s
logAction();
setInterval(logAction, 30_000);

