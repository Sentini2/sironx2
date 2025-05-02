const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Armazenando os IPs dos usuários conectados
let connectedClients = {};

app.use(express.static('public'));

// Quando um usuário se conecta
io.on('connection', (socket) => {
  const userIp = socket.request.connection.remoteAddress;
  console.log(`${userIp} se conectou`);

  // Adicionar o cliente à lista de clientes conectados
  connectedClients[userIp] = socket.id;

  // Enviar a lista de IPs para todos os clientes conectados
  io.emit('update-client-list', Object.keys(connectedClients));

  // Receber imagens do cliente
  socket.on('image', (imageData) => {
    // Enviar a imagem para o IP selecionado
    socket.broadcast.emit('new-image', { ip: userIp, imageData });
  });

  // Quando o usuário se desconectar
  socket.on('disconnect', () => {
    console.log(`${userIp} desconectou`);
    delete connectedClients[userIp];
    io.emit('update-client-list', Object.keys(connectedClients)); // Atualizar a lista de IPs
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});