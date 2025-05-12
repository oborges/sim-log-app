// index.js

const { Client } = require('@elastic/elasticsearch');
const fs         = require('fs');
const path       = require('path');

// Lista de nomes brasileiros
const users = [
  'Ana', 'Bruno', 'Carla', 'Daniel', 'Eduardo', 'Fernanda',
  'Gabriel', 'Helena', 'Igor', 'Juliana', 'Lucas', 'Mariana',
  'Neto', 'Patrícia', 'Rafael', 'Sofia', 'Tiago', 'Vanessa',
  'Wesley', 'Yasmin', 'Zeca'
];

// Ações possíveis
const actions = [
  'transferencia', 'saque', 'consultaSaldo', 'consultaChavePix'
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- read Elasticsearch credentials & CA from mounted secrets ---
const ES_URL  = process.env.ES_URL || 'https://your-host:your-port'; 
// mounts: /opt/app-root/src/config/es/credentials/{username,password}
const credDir = path.join(__dirname, 'config/es/credentials');
const CA_PATH = path.join(__dirname, 'config/es/ca/ca.crt');

const ES_USER = fs.readFileSync(path.join(credDir, 'username'), 'utf8').trim();
const ES_PASS = fs.readFileSync(path.join(credDir, 'password'), 'utf8').trim();

// build Elasticsearch client
const client = new Client({
  node: ES_URL,
  auth: {
    username: ES_USER,
    password: ES_PASS
  },
  tls: {
    ca: fs.readFileSync(CA_PATH),
    // if you want to strictly verify, set to true and ensure CA is correct
    rejectUnauthorized: false
  }
});

async function logAction() {
  const entry = {
    usuario:   randomItem(users),
    acao:      randomItem(actions),
    timestamp: new Date().toISOString()
  };

  try {
    // index the new document into "app-logs"
    const indexResp = await client.index({
      index:    'app-logs',
      document: entry
    });

    // immediately fetch it back to verify/store in stdout
    const getResp = await client.get({
      index: 'app-logs',
      id:    indexResp._id
    });

    console.log('✅ sent & got:', JSON.stringify(getResp._source));
  }
  catch (err) {
    console.error('⛔️ Elasticsearch error:', err.message);
    console.log('🔄 Original entry:', JSON.stringify(entry));
  }
}

// initial run & schedule every 30 seconds
logAction();
setInterval(logAction, 30 * 1000);

