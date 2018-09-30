const express = require('express');
app = express(),
    http = require('http').createServer(app),
    io = require('socket.io').listen(http);
const path = require('path');
const port = 8000;
    http.listen(port);

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




    var players = [];

    //Lets create a function which will help us to create multiple players
    function newPlayer() {
        this.name;
        this.id = 1;
        this.x = Math.random() * 500;
        this.y =  200;
        //Random colors
        var r = Math.random()*255>>0;
        var g = Math.random()*255>>0;
        var b = Math.random()*255>>0;
        this.color = "rgba(" + r + ", " + g + ", " + b + ", 0.5)";

        //Random size
        this.radius = 10
        this.speed =  5;

        return {'name' : this.name,"x" : this.x,"y" : this.y,"color" : this.color, "radius" : this.radius,"speed" : this.speed}
    }


    //calls to the server and tracking connection of each new user
    io.sockets.on('connection', function(socket){
        var currentPlayer = new newPlayer(); //new player made
        players.push(currentPlayer); //push player object into array

        //create the players Array
        socket.broadcast.emit('currentUsers', players);
        socket.emit('welcome', currentPlayer, players);

            //disconnected
        socket.on('disconnect', function(){
            players.splice(players.indexOf(currentPlayer), 1);
            console.log(players);
            socket.broadcast.emit('playerLeft', players);
        });

        socket.on('pressed', function(key){
            if(key === 38){
                currentPlayer.y -= currentPlayer.speed;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
            if(key === 40){
                currentPlayer.y += currentPlayer.speed;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
            if(key === 37){
                currentPlayer.x -= currentPlayer.speed;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
            if(key === 39){
                currentPlayer.x += currentPlayer.speed;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
        });
    });

    console.log('NodeJS Server started on port 8000...');
