require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'system', message: 'Conectado al chat Homelab' }));
  broadcast({ type: 'system', message: 'Nuevo usuario conectado' }, ws);

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      broadcast({ type: 'message', from: data.from || 'anon', text: data.text });
    } catch(e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Mensaje inválido' }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast({ type: 'system', message: 'Usuario desconectado' });
  });
});

function broadcast(data, exclude) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => console.log(`WebSocket corriendo en puerto ${PORT}`));
