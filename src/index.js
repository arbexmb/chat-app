const { app, server, io } = require ('./app')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require ('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, getRoomsList } = require('./utils/users')

const port = process.env.PORT || 3000

io.on('connection', (socket) => {
  console.log('New Web Socket connection')
  // Get list of Rooms
  socket.on('roomInputKeyUp', () => {
    socket.emit('roomsList', getRoomsList())
  })
  // Listen for join
  socket.on('join', ({ username, room }, callback) => {
    // Add user, check for validation
    const { error, user } = addUser({ id: socket.id, username, room })
    if(error) {
      return callback(error)
    }
    // Join a room
    socket.join(user.room)
    // Emit message to the user on connection
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    // Emit message to all user, except the one who is connecting
    socket
      .broadcast
      .to(user.room)
      .emit('message', generateMessage('Admin', `<i>${user.username}</i> has joined the room!`))
    // Update users list
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    // Return callback without error
    callback()
  })
  // Listen to sendMessage
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter()
    if(filter.isProfane(message)) {
      return callback('Profanity is not allowed.')
    }
    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    const url = 'https://google.com/maps?q='+coords.latitude+','+coords.longitude
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if(user) {
      io.to(user.room).emit('message', generateMessage('Admin', `<i>${user.username}</i> has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log('Server is listening on port ' + port)
})
