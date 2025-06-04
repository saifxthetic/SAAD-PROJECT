const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 4190;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

let socketsConnected = new Set();
let chatHistory = []; 

io.on('connection', (socket) => {
  console.log('🔌 New connection:', socket.id);
  socketsConnected.add(socket.id);

  io.emit('clients-total', socketsConnected.size);
  socket.emit('chat-history', chatHistory);

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
    socketsConnected.delete(socket.id);
    io.emit('clients-total', socketsConnected.size);
  });

  socket.on('message', (data) => {
    if (data && (data.message || data.image) && data.name) {
      chatHistory.push(data);
      if (chatHistory.length > 100) {
        chatHistory.shift(); 
      }

      socket.broadcast.emit('chat-message', data);
    }
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
});
