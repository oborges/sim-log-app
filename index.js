onst fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

// Load Elasticsearch connection info from environment
const ES_HOST = process.env.ES_HOST;
const ES_PORT = process.env.ES_PORT;
const ES_USER_FILE = process.env.ES_CREDENTIALS_FILE;
const ES_PW_FILE = process.env.ES_PASSWORD_FILE;
const ES_CA_FILE = process.env.ES_CA_FILE;

// Read credentials and CA
const username = fs.readFileSync(ES_USER_FILE, 'utf8').trim();
const password = fs.readFileSync(ES_PW_FILE, 'utf8').trim();
const ca = fs.readFileSync(ES_CA_FILE, 'utf8');

// Initialize Elasticsearch client
const client = new Client({
  node: `https://${ES_HOST}:${ES_PORT}`,
  auth: { username, password },
  tls: { ca, rejectUnauthorized: true }
});

// Lista de nomes brasileiros
const users = [
  'Ana', 'Bruno', 'Carla', 'Daniel', 'Eduardo',
  'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana',
  'Lucas', 'Mariana', 'Neto', 'Patrícia', 'Rafael',
  'Sofia', 'Tiago', 'Vanessa', 'Wesley', 'Yasmin', 'Zeca'
];

// Ações possíveis
const actions = ['transferencia', 'saque', 'consultaSaldo', 'consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function logAction() {
  const entry = {
    usuario: randomItem(users),
    acao: randomItem(actions),
    timestamp: new Date().toISOString()
  };

  // Log to console
  console.log(JSON.stringify(entry));

  try {
    // Index into Elasticsearch
    await client.index({
      index: 'app-logs',
      document: entry
    });
  } catch (err) {
    console.error('Elasticsearch indexing error:', err);
  }
}

// Initial log and schedule every 10s
logAction();
setInterval(logAction, 10 * 1000);
