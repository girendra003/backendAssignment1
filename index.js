//my name is girendra sinsinwar

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const gameSocketHandler = require('./sockets/gameHandler');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  gameSocketHandler(io, socket);
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
