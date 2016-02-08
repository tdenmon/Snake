var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var ding = new Audio('ding.mp3');
var rip = new Audio('game-over.mp3');
var game, snake, food;

//Initializes the game itself and handles the draw functions, stop and start functions, and sound functions
game = {
  score: 0,
  fps: 15,
  gameOver: false,
  message: null,
  
  //Resets the game up after a game over or on startup
  start: function() {
    game.gameOver = false;
    game.message = null;
    game.score = 0;
    game.fps = 15;
    snake.init();
    food.set();
  },
  
  //This is what happens when the game ends
  stop: function() {
    game.soundOver();
    game.gameOver = true;
    game.message = 'GAME OVER';
  },
  
  //This draws both the snake blocks and the food block
  //Note that the actual coordinates of the blocks are in the center of the blocks being drawn
  draw: function(x, y, size, color) {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x - (size / 2), y - (size / 2));
    context.lineTo(x + (size / 2), y - (size / 2));
    context.lineTo(x + (size / 2), y + (size / 2));
    context.lineTo(x - (size / 2), y + (size / 2));
    context.closePath();
    context.fill();
  },
  
  //Self explanatory
  drawScore: function() {
    context.fillStyle = 'grey';
    context.font = (canvas.height/5) + 'px Impact, sans-serif';
    context.textAlign = 'center';
    context.fillText(game.score, canvas.width / 2, canvas.height/2 + canvas.height/5);
  },
  
  //Again, self explanatory
  drawMessage: function() {
    if (game.message !== null) {
      context.fillStyle = 'purple';
      context.strokeStyle = '#0FF';
      context.font = (canvas.height / 10) + 'px Impact';
      context.textAlign = 'center';
      context.fillText(game.message, canvas.width / 2, canvas.height / 2);
      context.strokeText(game.message, canvas.width / 2, canvas.height / 2);
    }
  },
  
  //*gasp!* It resets the canvas!
  resetCanvas: function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  },
    
  //Just for fun :)
  encouragement: function(){
    if (game.score == 1){
        game.message = 'THATS IT!';
    }
    else if (game.score == 5){
        game.message = 'NOT BAD!';
    }
    else if (game.score == 10){
        game.message = 'KEEP GOING!';
    }
    else if (game.score == 25){
        game.message = 'HOW ARE YOU EVEN DOING THIS?!?';
    }
    else if (game.score == 50){
        game.message = 'OKAY, OKAY. YOU WIN ALREADY.';
    }
    else if (game.score == 100){
        game.message = 'ARE YOU SERIOUSLY STILL HERE?';
    }
    else{
        game.message = null;
    }
  },
  
  //Plays a booping noise whenever the food is eaten by the snake
  //Has an if statement checking if the sound is still playing when it's called
  //If so, it restarts the sound so there isn't an issue with food being eaten rapidly in succession
  sound: function(){
    if (ding.paused){
        ding.play();
    }
    else{
        ding.currentTime = 0;
    }
  },
  
  //Game over sound :(
  soundOver: function(){
    if (rip.paused){
        rip.play();  
    }
    else{
        rip.currentTime = 0;
    }
  }
  
};

//Our hero, ladies and gentlemen
snake = {
  size: canvas.width / 50,
  x: null,
  y: null,
  color: 'limegreen',
  direction: 'left',
  sections: [],
  
  //Initializes the snek
  init: function() {
    snake.sections = [];
    snake.direction = 'left';
    snake.x = canvas.width / 2 + snake.size / 2;
    snake.y = canvas.height / 2 + snake.size / 2;
    //The five in this next statement can be changed to any number zero or larger
    //It determines the length of the starting snek, which is fun to play around with
    for (var i = snake.x + (5 * snake.size); i >= snake.x; i -= snake.size) {
      snake.sections.push(i + ',' + snake.y); 
    }
  },
  
  //Moves the "head" block and then calls to see if a collision or grow event is happening
  //Note that it moves by pushing the blocks onto the next block's location, starting with the "tail"
  move: function() {
    switch (snake.direction) {
      case 'up':
        snake.y -= snake.size;
        break;
      case 'down':
        snake.y += snake.size;
        break;
      case 'left':
        snake.x -= snake.size;
        break;
      case 'right':
        snake.x += snake.size;
        break;
    }
    snake.checkCollision();
    snake.grow();
    snake.sections.push(snake.x + ',' + snake.y);
  },
  
  //This calls drawSection() for each block of the snek, starting at the head
  draw: function() {
    for (var i = 0; i < snake.sections.length; i++) {
      snake.drawSection(snake.sections[i].split(','));
    }    
  },
  
  //Draws the block of snek. The snek likes this.
  drawSection: function(section) {
    game.draw(parseInt(section[0]), parseInt(section[1]), snake.size, snake.color);
  },
  
  //Calls isCollision() to determine if it should end the game
  checkCollision: function() {
    if (snake.isCollision(snake.x, snake.y) == true) {
      game.stop();
    }
  },
  
  //Checks to see if the snake is out of bounds or has intersected itself
  isCollision: function(x, y) {
    if (x < snake.size / 2 ||
        x > canvas.width ||
        y < snake.size / 2 ||
        y > canvas.height ||
        snake.sections.indexOf(x + ',' + y) >= 0) {
      return true;
    }
  },
    
  /*Checks to see if the snake "head" and the food are in the same block
    If so, iterates the score, plays the ding sound, and checks if the score % 3 == 0
    If so, increases the fps by 1, speeding up the game
    Note that the snake sections only shift if this *isnt* the case
    That's what causes the growing effect*/
  grow: function() {
    if (snake.x == food.x && snake.y == food.y) {
      game.score++;
      game.sound();
      if (game.score % 3 == 0 && game.fps < 60) {
        game.fps ++;
      }
      food.set();
    } 
    else {
        snake.sections.shift();
    }
  }
  
};

//Om nom nom Macguffin
food = {
  size: null,
  x: null,
  y: null,
  color: 'salmon',
  
  //Creates the food at the same size as a snake block, ensuring collision detection works correctly
  /*Then places it randomly in the canvas, those "snake.size * 5" lines have to be manually changed
    if the aspect ratio of the canvas changes*/
  set: function() {
    food.size = snake.size;
    food.x = (Math.ceil(Math.random() * 10) * snake.size * 5) - snake.size / 2;
    food.y = (Math.ceil(Math.random() * 10) * snake.size * 5) - snake.size / 2;
  },
  
  //Calls the regular draw function for the food
  draw: function() {
    game.draw(food.x, food.y, food.size, food.color);
  }
  
};

//Just keeps track of the directions' opposites for use elsewhere
var inverseDirection = {
  'up': 'down',
  'left': 'right',
  'right': 'left',
  'down': 'up'
};

//Sets the movement keys as WSAD and the restart key as Spacebar
var keys = {
  up: [87],
  down: [83],
  left: [65],
  right: [68],
  start_game: [32]
};

//Just returns a value for a key press to be used in the next function
function getKey(value){
  for (var key in keys){
    if (keys[key] instanceof Array && keys[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
}

/*Listens for a keypress, then determines the key and acts accordingly
  If the key would change the direction to the opposite
  of the current direction, it's ignored'*/
addEventListener("keydown", function (e) {
    var lastKey = getKey(e.keyCode);
    if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0
        && lastKey != inverseDirection[snake.direction]) {
      snake.direction = lastKey;
    } else if (['start_game'].indexOf(lastKey) >= 0 && game.gameOver) {
      game.start();
    }
}, false);

var requestAnimationFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;

//Here's the game loop itself
//The "setTimeout" line slows the FPS so we can speed up or slow down the game
//at our leisure
function loop() {
  if (game.gameOver == false) {
    game.resetCanvas();
    game.drawScore();
    game.encouragement();
    snake.move();
    food.draw();
    snake.draw();
    game.drawMessage();
  }
  setTimeout(function() {
    requestAnimationFrame(loop);
  }, 1000 / game.fps);
}

//This makes the loop function go
requestAnimationFrame(loop);