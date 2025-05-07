// No topo do seu arquivo src/server.ts (ou app.ts)
import connectDB from './config/database'; // Importa a função

// Função para iniciar o servidor e conectar ao banco
const startApp = async () => {
  await connectDB(); // Chama a função para conectar ao banco DE DADOS

  // AQUI VOCÊ COLOCARIA O RESTANTE DO CÓDIGO DA SUA APLICAÇÃO
  // Exemplo:
  // import express from 'express';
  // const app = express();
  // app.get('/', (req, res) => res.send('API Rodando e Conectada ao DB!'));
  // app.listen(3000, () => console.log('Servidor Express rodando na porta 3000'));
  console.log('Aplicação iniciada. Se você tiver um servidor web, ele pode ser configurado e iniciado aqui.');
};

startApp(); // Executa a função para iniciar tudo