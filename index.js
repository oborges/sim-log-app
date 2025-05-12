// index.js
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const ES_HOST = process.env.ES_HOST;
const ES_PORT = process.env.ES_PORT;
const INDEX_NAME = 'app-logs';

const CRED_DIR = '/opt/app-root/src/config/es/credentials';
const CA_PATH  = '/opt/app-root/src/config/es/ca/ca.crt';

const username = fs.readFileSync(path.join(CRED_DIR, 'username'), 'utf8').trim();
const password = fs.readFileSync(path.join(CRED_DIR, 'password'), 'utf8').trim();
const ca       = fs.readFileSync(CA_PATH);

const client = new Client({
  node: `https://${ES_HOST}:${ES_PORT}`,
  auth: { username, password },
  tls: { ca, rejectUnauthorized: false }
});

const users = ['Ana','Bruno','Carla','Daniel','Eduardo','Fernanda','Gabriel','Helena','Igor','Juliana','Lucas','Mariana','Neto','Patrícia','Rafael','Sofia','Tiago','Vanessa','Wesley','Yasmin','Zeca'];
const actions = ['transferencia','saque','consultaSaldo','consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function logAction() {
  const entry = {
    usuario:   randomItem(users),
    acao:      randomItem(actions),
    timestamp: new Date().toISOString()
  };

  try {
    // index & wait for refresh
    const resp = await client.index({
      index: INDEX_NAME,
      body:  entry,
      refresh: 'wait_for'
    });

    // dump the raw body so we can see what's in it
    console.log('ℹ️ index response body:', JSON.stringify(resp.body, null, 2));

    const docId = resp.body && resp.body._id;
    if (!docId) {
      throw new Error('no _id in index response');
    }

    console.log(`✅ Indexed, id=${docId}`);

    const got = await client.get({
      index: INDEX_NAME,
      id:    docId
    });

    console.log('🔍 Fetched:', got.body && got.body._source);

  } catch (err) {
    console.error('⛔️ Elasticsearch error:', err);
    console.log('🔄 Original entry:', entry);
  }
}

logAction();
setInterval(logAction, 30_000);

