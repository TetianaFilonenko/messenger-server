'use strict';
// Redis connection

const express = require('express');
const socketIO = require('socket.io');
const redis = require('redis');
const path = require('path');

const PORT = process.env.PORT || 3001;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var allMessages = [];
var redisClient = redis.createClient('6379', 'redis');
redisClient.set('all_messages', JSON.stringify(allMessages));
io.on('connection', (socket) => {
  redisClient.get('all_messages', function (err, res) {
    if (!!res) {
      allMessages = JSON.parse(res);
    }
  });
  socket.emit('messages', allMessages);
  socket.on('new-message', (message) => {
    saveMessage(message); 
    redisClient.set('all_messages', JSON.stringify(allMessages), redis.print);
    socket.emit('messages', allMessages);
  })
});

function saveMessage(message) {
  message.id = uniqID();
  message.is_sent = true;
  allMessages.push(message);
}

function uniqID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
