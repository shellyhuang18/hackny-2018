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
    this.x = Math.random() * 1440;
    this.y =  400; //Horizontal spawn location
    //Random colors
    var r = Math.random()*255>>0;
    var g = Math.random()*255>>0;
    var b = Math.random()*255>>0;
    this.color = "rgba(" + r + ", " + g + ", " + b + ", 0.5)";

    //Random size
    this.radius = 10
    this.speed =  7;

    return {'name' : this.name,"x" : this.x,"y" : this.y,"color" : this.color, "radius" : this.radius,"speed" : this.speed}
}

let enabledPlatformA = true;
let enabledPlatformB = true;

function endRound(){
    Math.random() < 0.5 ? enabledPlatformA = false : enabledPlatformB = false
}

//calls to the server and tracking connection of each new user
io.sockets.on('connection', function(socket){
    var currentPlayer = new newPlayer(); //new player made
    players.push(currentPlayer); //push player object into array

    //create the players Array
    socket.broadcast.emit('currentUsers', players);
    socket.emit('welcome', currentPlayer, players);

    let count_until_next = 10

    socket.on('start-round', () => {
        enabledPlatformA = true;
        enabledPlatformB = true;

        socket.emit('start-timer', count_until_next)
        socket.broadcast.emit('start-timer', count_until_next)
        let interval = setInterval(() =>{
            count_until_next -= 1
            console.log("count " ,count_until_next)
            if(count_until_next === 0) {
                clearInterval(interval)
                endRound()
                count_until_next = 10
            }
            socket.emit('decrement-timer')
            socket.broadcast.emit('decrement-timer')
        }, 1000)
    })

        //disconnected
    socket.on('disconnect', function(){
        players.splice(players.indexOf(currentPlayer), 1);
        console.log(players);
        socket.broadcast.emit('playerLeft', players);
    });

    socket.on('drop-platform', (platform)=>{
        if(platform === "A"){
            enabledPlatformA = false;
        }

        else if(platform === "B"){
            enabledPlatformB = false;
        }
    })

    socket.on('pressed', function(key){
        if(key === 38){ //up
            currentPlayer.y -= 40;
            socket.emit('PlayersMoving', players);
            socket.broadcast.emit('PlayersMoving', players);
            
        }
        if(key === 40){ //Down
            //if platform disabled and on that side fall
            if ((!enabledPlatformA && currentPlayer.x < 1440/2) ||(!enabledPlatformB && currentPlayer.x > 1440/2)) {
                const FALL_SPEED = 10;
                currentPlayer.y += FALL_SPEED;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
            else if((currentPlayer.y + currentPlayer.speed) < 500){
                const FALL_SPEED = 10;
                currentPlayer.y += FALL_SPEED;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
        }
        if(key === 37){ //left
            if(currentPlayer.x - currentPlayer.speed >= 0){
                currentPlayer.x -= currentPlayer.speed;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
        }
        if(key === 39){//right
            if(currentPlayer.x + currentPlayer.speed < 1440){
                currentPlayer.x += currentPlayer.speed;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }
        }
    });
});

console.log('NodeJS Server started on port 8000...');
