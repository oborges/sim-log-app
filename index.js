// index.js

const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

// configuration via env vars (or file paths)
const ES_HOST = process.env.ES_HOST;
const ES_PORT = process.env.ES_PORT || '9200';
const ES_USER = process.env.ES_USER;
const ES_PASS = process.env.ES_PASS;
const ES_CA_PATH = process.env.ES_CA_PATH; // e.g. "/opt/app-root/src/config/es/ca.crt"

// build the client
const client = new Client({
  node: `https://${ES_HOST}:${ES_PORT}`,
  auth: { username: ES_USER, password: ES_PASS },
  tls: ES_CA_PATH
    ? { ca: fs.readFileSync(path.resolve(ES_CA_PATH)) }
    : undefined
});

// your log-generator boilerplate
theExamUsers = ['Ana','Bruno','Carla','Daniel','Eduardo','Fernanda','Gabriel','Helena','Igor','Juliana','Lucas','Mariana','Neto','Patrícia','Rafael','Sofia','Tiago','Vanessa','Wesley','Yasmin','Zeca'];
const actions = ['transferencia','saque','consultaSaldo','consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function logAction() {
  const entry = {
    usuario:   randomItem(theExamUsers),
    acao:      randomItem(actions),
    timestamp: new Date().toISOString()
  };

  try {
    // push into ES index "app-logs"
    const indexResp = await client.index({
      index: 'app-logs',
      body:  entry
    });

    // immediately fetch the just-indexed document by ID
    const { _index, _id } = indexResp;
    const getResp = await client.get({ index: _index, id: _id });

    // print the fetched document
    console.log('✅ Indexed and retrieved:', JSON.stringify(getResp._source));
  } catch (err) {
    // on any ES error, dump to stderr but still keep going
    console.error('⛔️ Elasticsearch error:', err.message || err);
  }

  // always print the original entry to stdout for fallback
  console.log('🔄 Original entry:', JSON.stringify(entry));
}

// initial + every 30s
logAction();
setInterval(logAction, 30 * 1000);

