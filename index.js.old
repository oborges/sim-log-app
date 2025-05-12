// index.js

// Lista de nomes brasileiros
const users = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana', 'Lucas', 'Mariana', 'Neto', 'Patrícia', 'Rafael', 'Sofia', 'Tiago', 'Vanessa', 'Wesley', 'Yasmin', 'Zeca'];

// Ações possíveis
const actions = ['transferencia', 'saque', 'consultaSaldo', 'consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function logAction() {
  const entry = {
    usuario: randomItem(users),
    acao: randomItem(actions),
    timestamp: new Date().toISOString()
  };
  console.log(JSON.stringify(entry));
}

// Log inicial e depois a cada 10s
logAction();
setInterval(logAction, 10 * 1000);

