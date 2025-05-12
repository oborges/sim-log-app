// arquivo: index.js

const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

// Configurações via ambiente ou arquivo montado
const ES_HOST = process.env.ES_HOST || '4f41b27c-c2f9-48a2-b9a8-d0d71c60007f.c38qvnlz04atmdpus310.databases.appdomain.cloud';
const ES_PORT = process.env.ES_PORT || '32169';
const ES_USER = fs.readFileSync(path.join(__dirname, 'config/es/credentials/username'), 'utf8').trim();
const ES_PASS = fs.readFileSync(path.join(__dirname, 'config/es/credentials/password'), 'utf8').trim();

// Desabilita checagem de certificado (apenas para troubleshooting)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ES_URL = `https://${ES_HOST}:${ES_PORT}`;

// Instancia o client do Elasticsearch
const client = new Client({
  node: ES_URL,
  auth: { username: ES_USER, password: ES_PASS },
});

// Lista de nomes brasileiros
const users = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana', 'Lucas', 'Mariana', 'Neto', 'Patrícia', 'Rafael', 'Sofia', 'Tiago', 'Vanessa', 'Wesley', 'Yasmin', 'Zeca'];
// Ações possíveis
const actions = ['transferencia', 'saque', 'consultaSaldo', 'consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendAndVerify() {
  const entry = {
    usuario: randomItem(users),
    acao: randomItem(actions),
    timestamp: new Date().toISOString()
  };

  try {
    // Indexa o documento
    const indexRes = await client.index({
      index: 'app-logs',
      body: entry,
      refresh: 'wait_for'
    });

    const docId = indexRes.body._id;
    console.log(`✅ Sent to ES, id=${docId}`);

    // Busca o mesmo documento
    const getRes = await client.get({ index: 'app-logs', id: docId });
    console.log('🔍 Fetched from ES:', getRes.body._source);
  } catch (err) {
    console.error('⛔️ Elasticsearch error:', err.message || err);
    console.error('🔄 Original entry:', entry);
  }
}

// Executa imediatamente e depois a cada 30s
sendAndVerify();
setInterval(sendAndVerify, 30 * 1000);

