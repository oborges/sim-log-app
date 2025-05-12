// index.js
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const ES_HOST    = process.env.ES_HOST;
const ES_PORT    = process.env.ES_PORT;
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

const users   = ['Ana','Bruno','Carla','Daniel','Eduardo','Fernanda','Gabriel','Helena','Igor','Juliana','Lucas','Mariana','Neto','Patrícia','Rafael','Sofia','Tiago','Vanessa','Wesley','Yasmin','Zeca'];
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
    // Index and force refresh so it’s searchable immediately
    const indexResp = await client.index({
      index: INDEX_NAME,
      body:  entry,
      refresh: 'wait_for'
    });

    console.log('ℹ️ full index response:', JSON.stringify(indexResp, null, 2));

    const docId = indexResp._id;
    console.log(`✅ Indexed with id=${docId}`);

    // Now GET the document back
    const getResp = await client.get({ index: INDEX_NAME, id: docId });
    console.log('ℹ️ full get response:', JSON.stringify(getResp, null, 2));

    if (getResp.body && getResp.body.found) {
      console.log('🔍 Fetched _source:', getResp.body._source);
    } else {
      console.warn('⚠️ Document not found or no body._source');
    }

  } catch (err) {
    console.error('⛔️ Elasticsearch error:', err);
    console.log('🔄 Original entry:', entry);
  }
}

logAction();
setInterval(logAction, 30_000);

