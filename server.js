const express = require('express'), app = express()
const socket = require('socket.io')
const path    = require("path");

//set view engine and static folder
app.set('view engine', 'pug');
app.set('views', __dirname + '/views')
app.use(express.static('static'))
app.use(express.static(__dirname + '/static'));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/templates/index.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/game',function(req,res){
  res.sendFile(path.join(__dirname+'/templates/game.html'));
  //__dirname : It will resolve to your project folder.
});

var port = 8000
const server = app.listen(port, () =>{
    console.log('Running on port ', port)
})

//set up Socket(on backend)
//need to also setup on frontend
var io = socket(server)

//once a connection has been made, do something,
//socket param is the particular socket that connects(from someone else)
io.on('connection', (socket) => {
    //socket.id
    console.log("made a connection")

    //when connection from client was made with "data" message (name)
    socket.on('join-room', (room) =>{
        socket.join(room)
        console.log('joined ', room, " with id: ", socket.id)
    })

    //io.sockets - refer to all sockets connected to server
})
