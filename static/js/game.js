const socket = io('http://localhost:8000');

const btn_a = document.getElementById("testa")

const btn_b = document.getElementById("testb")

btn_a.addEventListener('click', ()=>{
    dropPlatform("A")
})

btn_b.addEventListener('click', ()=>{
    dropPlatform("B")
})


//initializing the canvas
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext('2d'),
    W = window.innerWidth,
    H = window.innerHeight;

canvas.width = W 
canvas.height = H 

function clearScreen(){
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, W, H);
}

var keys = {};

window.addEventListener('keydown', function(e){
    keys[e.keyCode] = true;
}, false);

//check if key is not being pressed or has lifted up
window.addEventListener('keyup', function(e){
    delete keys[e.keyCode];
}, false);


function draw_platformA(){
    ctx.fillStyle = "white"
    ctx.fillRect(0,500+10,W/2,20)
}

function draw_platformB(){
    ctx.fillStyle = "lightblue"
    ctx.fillRect(W/2,500+10,W/2,20)

}

//game loop to make the game smoother
function gameLoop() {
    if(keys[38]) {
        socket.emit('pressed', 38);
        console.log('You are UP');
    }
    if(true) {
        socket.emit('pressed', 40);
        // console.log('You are DOWN');
    }
    if(keys[37]) {
        socket.emit('pressed', 37);
        console.log('You are LEFT');
    }
    if(keys[39]) {
        socket.emit('pressed', 39);
        console.log('You are RIGHT');
    }
    draw_platformA()
    draw_platformB()
    
    window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop);

function dropPlatform(platform){
    socket.emit('drop-platform', platform)
    
}

//the connected user joins and gets all the players on server
socket.on('welcome', function(currentUser, currentUsers){
    console.log(currentUser);

    ctx.globalCompositeOperation = "source-over";
    //Lets reduce the opacity of the BG paint to give the final touch
    clearScreen()

    //Lets blend the particle with the BG
    ctx.globalCompositeOperation = "lighter";

    //players in lobby
    for(var i = 0; i < currentUsers.length; i++){

        ctx.beginPath();

        //Time for some colors
        ctx.fillStyle = currentUsers[i].color;
        ctx.arc(currentUsers[i].x, currentUsers[i].y, currentUsers[i].radius, Math.PI*2, false);
        ctx.fill();
    }

    //player
    ctx.beginPath();
    ctx.arc(currentUser.x, currentUser.y, currentUser.radius, Math.PI*2, false);
    ctx.fill();
});

//other users get updated with new players when teh new player joins
socket.on('currentUsers', function(currentUsers){
    ctx.globalCompositeOperation = "source-over";
    //Lets reduce the opacity of the BG paint to give the final touch
    clearScreen()

    //Lets blend the particle with the BG
    ctx.globalCompositeOperation = "lighter";

    for(var i = 0; i < currentUsers.length; i++){

        ctx.beginPath();

      
        ctx.fillStyle = currentUsers[i].color;
        ctx.arc(currentUsers[i].x, currentUsers[i].y, currentUsers[i].radius, Math.PI*2, false);
        ctx.fill();
    }
    console.log('A new User has joined');
});

//if a player leaves, everyone gets new set of players
socket.on('playerLeft', function(currentUsers){
    ctx.globalCompositeOperation = "source-over";
    //Lets reduce the opacity of the BG paint to give the final touch
    clearScreen()

    //Lets blend the particle with the BG
    ctx.globalCompositeOperation = "lighter";

    for(var i = 0; i < currentUsers.length; i++){

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(currentUsers[i].x, currentUsers[i].y, currentUsers[i].radius, Math.PI*2, false);
        ctx.fill();
    }
    console.log('A Player Has left');
});


socket.on('PlayersMoving', function(players){
    ctx.globalCompositeOperation = "source-over";
    //Lets reduce the opacity of the BG paint to give the final touch
    clearScreen()

    //Lets blend the particle with the BG

    var players = players;
    var i = 0;
    function allPlayers(){
        for(i; i < players.length; i ++) {

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(players[i].x, players[i].y, players[i].radius, Math.PI*2, false);
        ctx.fill();
        }
    }
    allPlayers();

});
