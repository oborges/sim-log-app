const faker = require('faker');

// Lista de nomes (exemplo)
const users = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana', 'Lucas', 'Mariana', 'Neto', 'Patrícia', 'Rafael', 'Sofia', 'Tiago', 'Vanessa', 'Wesley', 'Yasmin', 'Zeca'];

// Ações possíveis
const actions = ['transferencia', 'saque', 'consultaSaldo', 'consultaChavePix'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function logAction() {
  const entry = {
    usuario: randomItem(users),
    acao:   randomItem(actions),
    timestamp: new Date().toISOString()
  };
  console.log(JSON.stringify(entry));
}

// A cada 10 segundos
setInterval(logAction, 10 * 1000);

// Log inicial
logAction();

