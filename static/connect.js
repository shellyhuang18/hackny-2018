//make connection for socketio on frontend

var socket = io.connect('localhost:8000')

var input = document.getElementById('message')
var button = document.getElementById('send')

var room1 = document.getElementById('room1')
var room2 = document.getElementById('room2')

//set up custom namespace - for socket connections that do different things
//var namespace = io.of('/namespace')



//socket.on - listen for change in server(events)