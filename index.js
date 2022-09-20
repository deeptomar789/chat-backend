const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');
// const { Socket } = require('dgram');

const app = express();
const port = process.env.PORT || 3000;
const users = [{}];

app.use(cors());
app.get('/', (req, res) => {
  res.send('server is working');
});
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3001',
  },
});
io.on('connection', (socket) => {
  console.log('New Connection');

  socket.on('joined', ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.broadcast.emit('userJoined', {
      user: 'Admin',
      message: `${users[socket.id]} has joined`,
    });
    socket.emit('welcome', {
      user: 'Admin',
      message: `welcome to the chat,${users[socket.id]} `,
    });
    socket.on('message', ({current,message, id}) => {
      console.log(current,message,id);
      io.emit('sendMessage', { current, message, id });
    });
  });

  socket.on('disconnected', () => {
    socket.broadcast.emit('leave', {
      user: 'Admin',
      message: `${users[socket.id]} has left`,
    });
    console.log('user left');
  });
});

server.listen(port, () => {
  console.log(`server is connected on http://localhost:${port}`);
});
