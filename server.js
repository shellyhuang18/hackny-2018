const express = require('express');
app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
const path = require('path');
const default_port = 8000;
    server.listen(process.env.PORT || default_port, ()=>{
        console.log(`Listening to port ${(process.env.PORT || default_port)}`);
    });

//set view engine and static folder
app.set('view engine', 'pug');
app.set('views', __dirname + '/views')
app.use(express.static('static'))
app.use(express.static(__dirname + '/static'));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/templates/index.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/control', (req,res)=>{
    res.sendFile(path.join(__dirname+'/templates/controller.html'))
})

app.get('/game',function(req,res){
  res.sendFile(path.join(__dirname+'/templates/game.html'));
  //__dirname : It will resolve to your project folder.
});

var players = [];
const questions = [
  {"question":"Bubblesort is best sort", "answer":true},
  {"question":"The 2017 HackNY hackathon was located at NYU Courant", "answer":true},
  {"question":"Will I annoy people if I ask them questions?", "answer":true},
  {"question":"A parallelogram has parallel opposite sides AND it has five sides.", "answer":false},
  {"question":"Linux was first created as an alternative to Windows XP.", "answer":false},
  {"question":"The logo for Snapchat is a Bell.", "answer":false},
  {"question":"The price for the first generation of Snapchat Spectacles was $200", "answer":false},
  {"question":"Hypertext Programming Markup Language (HTML) is a programming language", "answer":true},
  {"question":"Average time complexity of Quick Sort is O(logN)", "answer":false},
  {"question":"A Stack operates in a FIFO manner", "answer":true},
]

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
    this.speed =  9;

    return {'name' : this.name,"x" : this.x,"y" : this.y,"color" : this.color, "radius" : this.radius,"speed" : this.speed}
}

let enabledPlatformA = true;
let enabledPlatformB = true;

function endRound(answer, socket){
    if(answer){
        enabledPlatformA = false
        socket.emit('drop_platform', "A")
        socket.broadcast.emit('drop_platform', "A")
    }
    else{
        enabledPlatformB = false
        socket.emit('drop_platform', "B")
        socket.broadcast.emit('drop_platform', "B")

    }
}

//calls to the server and tracking connection of each new user
io.sockets.on('connection', function(socket){
    var currentPlayer = new newPlayer(); //new player made
    players.push(currentPlayer); //push player object into array

    //create the players Array
    socket.broadcast.emit('currentUsers', players);
    socket.emit('welcome', currentPlayer, players);

    let count_until_next = 7
    let question_count = 0
    socket.on('start-round', () => {
        socket.emit('question', "Waiting for next question")
        socket.broadcast.emit('question', "Waiting for next question")
        setTimeout(()=>{
        console.log("Waiting for round to start");
        enabledPlatformA = true;
        enabledPlatformB = true;

        socket.emit('start-round', count_until_next)
        socket.broadcast.emit('start-round', count_until_next)

        socket.emit('question', questions[question_count].question)
        socket.broadcast.emit('question', questions[question_count].question)
        console.log("Emmiting", questions[question_count].question);

        
        if(question_count <= questions.length - 1){
            
                let interval = setInterval(() =>{
                    count_until_next -= 1
                    console.log("count " ,count_until_next)
                    if(count_until_next == 0) {
                        clearInterval(interval)
                        endRound(questions[question_count].answer, socket)
                        count_until_next = 7
                        question_count += 1
                    }
                    socket.emit('decrement-timer')
                    socket.broadcast.emit('decrement-timer')
                }, 1000)

        }
        }, 4000);
    })

        //disconnected
    socket.on('disconnect', function(){
        players.splice(players.indexOf(currentPlayer), 1);
        console.log(players);
        socket.broadcast.emit('playerLeft', players);
    });

    socket.on('drop-platform', (platform)=>{
        console.log("CALLED");
        if(platform === "A"){
            socket.emit('drop-platform', "A")
            socket.broadcast.emit('drop-platform', "A")
            enabledPlatformA = false;
        }

        else if(platform === "B"){
            socket.emit('drop-platform', "B")
            socket.broadcast.emit('drop-platform', "B")
            enabledPlatformB = false;
        }
    })

    socket.on('pressed', function(key){
        if(key === 38){ //up
            if(currentPlayer.y < 510 && currentPlayer.y > 470){
                currentPlayer.y -= 40;
                socket.emit('PlayersMoving', players);
                socket.broadcast.emit('PlayersMoving', players);
            }

        }
        if(key === 40){ //Down
            //if platform disabled and on that side fall
            if ((!enabledPlatformA && currentPlayer.x < 1440/2) ||(!enabledPlatformB && currentPlayer.x > 1440/2)) {
                const FALL_SPEED = 5;
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
