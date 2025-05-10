// Draw image to canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//load and render room and room overlay
var room = new Image();
room.src = "sprites/room.png";
var overlay = new Image();
overlay.src = "sprites/room-overlay.png";

//global variables
var G = 2;

//platform variables
var platArr = [
  new platform(1, 1, 'sm'),
  new platform(1, 3, 'sm'),
  new platform(2, 2, 'md'),
];

//load Rory's sprite
var rorySprite = new Image();
rorySprite.src = "sprites/prraow!.png";

rorySprite.addEventListener("load", onLoad, false);
function onLoad() {
	render();	
};

//Rory object construction
var Rory = {
    sX: 0,
    sY: 0,
    sWidth: 150,
    sHeight: 116,
    x: 200,
    y: 0,
    xV: 0,
    yV: 0,
    grounded: false, 
    landing: false,
    speed: 5,
    jumpForce: -40,
    friction: 0.9,
    width: 150,
    height: 116,
    xBoxOffset: 33,
    yBoxOffset: 56,
    boxWidth: 84,
    boxHeight: 60,
    frames: 10,
    index: 0,
    row: 2,
    sprite: function() {
        if (this.grounded == false) {
            if (lastKey == 'L') { this.jumpLeft(); };
            if (lastKey == 'R') { this.jumpRight(); };
        } else if (spacebar && this.grounded) {
            console.log("jumping!");
            this.yV += this.jumpForce;
            this.grounded = false;
        } else if (this.landing) { 
          this.land();
        } else if (leftKey && this.grounded) { 
          this.runLeft(); 
          lastKey = 'L';
        } else if (rightKey && this.grounded) { 
          this.runRight(); 
          lastKey = 'R';
        } else if (Math.abs(this.xV) < 30 && this.grounded) { 
          this.stand(); 
        };
        this.landing = false;
        this.setSCoords();
    },
    setSCoords: function() {
        this.sX = this.index * this.width;
        this.sY = this.row * this.height;
        if (this.row == 0 || this.row == 1) {this.index++;};
    },
    runLeft: function() {
        if (this.index > 9) { this.index = 0; };
        if (this.row != 0) {
            this.index = 2;
            this.row = 0;
        };
        console.log(".runLeft() was called");
    },
    runRight: function() {
        if (this.index > 9) { this.index = 0; };
        if (this.row != 1) {
            this.index = 2;
            this.row = 1;
        };
        console.log(".runRight() was called");
    },
    stand: function() {
        this.row = 2;
        if (lastKey == 'L') { this.index = 0;};
        if (lastKey == 'R') { this.index = 1;};
        console.log(".stand() was called");
    },
    getVAngle: function() {
        var rad = Math.atan2(this.yV, this.xV);
        var deg = rad * (180 / Math.PI);
        // Math.atan2(this.yV, this.yX) * (180 / Math.PI)
        return deg;
        /*
        TRIG OUTPUT GUIDE
        up = -90
        left = 180
        right = 0
        down = 90
        */
    },
    jumpLeft: function() {
        var theta = this.getVAngle();
        console.log("Theta = " + theta);
        if (this.row != 3) {
            this.row = 3;
            this.index = 0;
        } else if (this.index < 2) {
            this.index++;
        } else if (theta < -135) {
            this.index = 3;
        } else if (theta > 90) {
            this.index = 4;
        };
        
    },
    jumpRight: function() {
        var theta = this.getVAngle();
        console.log("Theta = " + theta);
        if (this.row != 4) {
            this.row = 4;
            this.index = 0;
        } else if (this.index < 2) {
            this.index++;
        } else if (theta > -45 && theta < 0) {
            this.index = 3;
        } else if (theta > 0) {
            this.index = 4;
        };
    },
    land: function() {
        if (lastKey == 'L') { this.row = 0; };
        if (lastKey == 'R') { this.row = 1; };
        this.index = 1;
        console.log(".land() was called");
    },
    setLocalBoxCoords: function() {
        var coords = [];
        
        //top left box coord
        coords[0] = [this.xBoxOffset, this.yBoxOffset];
        //top right box coord
        coords[1] = [this.xBoxOffset + this.boxWidth, this.yBoxOffset];
        //bottom right box coord
        coords[2] = [this.xBoxOffset + this.boxWidth, this.yBoxOffset + this.boxHeight];
        //bottom left box coord
        coords[3] = [this.xBoxOffset, this.yBoxOffset + this.boxHeight]; 
        
        this.boxLocalCoords = coords;
    },
    boxLocalCoords: [],
    getGlobalBoxCoords: function() {
        //add global coords
        var globalCoords = [];
        for (c in this.boxLocalCoords) {
            globalCoords[c] = [];
            globalCoords[c][0] = this.boxLocalCoords[c][0] + this.x;
            globalCoords[c][1] = this.boxLocalCoords[c][1] + this.y;
        };
        return globalCoords;
    },
    collide: function() {
        var box = this.getGlobalBoxCoords();
        if (!(this.grounded) && box[2][1] + this.yV >= 583) {
            this.yV = 0;
            this.place(2, 1, 583);
            this.grounded = true;
            this.landing = true;
        };
    },
    place: function(point, axis, coord) {
        var pointOffset = this.boxLocalCoords[point][axis];
        if (axis == 0) {
            this.x = coord - pointOffset;
        } else {
            this.y = coord - pointOffset;
        };
    }
};

//platform object construction
function platform(level, position, size) {
    
    this.level = level;
    this.position = position;
    this.size = size;
    
};

function cheerio(level, position) {
    
    this.level = level;
    this.position = position;
    
};

var charArr = [Rory];

//set local box coordinates
for (c in charArr) {
    var char = charArr[c];
    char.setLocalBoxCoords();
};

//variables that indicate whether or not keys are being held down at any given moment
var rightKey = false,
    leftKey = false,
    lastKey = 'L',
    spacebar = false;

//if left, right, or space is down, make their respective booleans true
$( window ).keydown(function(e) {
    if ( e.which == 39 ) {
        //right
        rightKey = true;
    } else if (e.which == 37) {
        //left
        leftKey = true;
    };
    if ( e.which == 32 ) { spacebar = true; };
    e.preventDefault();
});

//if left, right, or space is released, make their respective booleans false
$( window ).keyup(function(e) {
    if ( e.which == 39 ) {
        //right
        rightKey = false;
    } else if (e.which == 37) {
        //left
        leftKey = false;
    };
    if ( e.which == 32 ) { spacebar = false; };
    e.preventDefault();
});

var frameCount = 0; //use to count animation frames
var frameFactor = 3; //animation frames occur at about 60 fps; use this to change frame rate -- 4 would be 60/4 = 15 fps

//render the canvas
function render() {
	
	//animation loop
	window.requestAnimationFrame(render, canvas);
	
    //accelerate Rory according to which keys are held down
    if (Rory.grounded) {
        if (rightKey) { Rory.xV += Rory.speed; };
        if (leftKey) { Rory.xV -= Rory.speed; };
    };
    
    //apply friction to Rory's new xV
    if (Rory.grounded) {
        Rory.xV *= Rory.friction;
        if (Math.abs(Rory.xV) < 1) { Rory.xV = 0; };
    };
    
    //apply gravity to Rory's yV
    if (Rory.grounded == false) { Rory.yV += G; };
    
    //if animation is to occur on this frame...
    if (frameCount % frameFactor == 0) {
        
        // ...draw the room...
        ctx.drawImage(room,0,0);
        // ...then iterate through each character, applying changes in position
        for (i in charArr) {
            //clear canvas
            ctx.clearRect(0,0,canvas.width,canvas.height);
            
            char = charArr[i];
            char.collide();
            char.x += char.xV;
            char.x = Math.round(char.x);
            char.y += char.yV;
            char.y = Math.round(char.y);
            char.sprite();
            console.log("Rory @ (" + Math.round(Rory.x) + ", " + Math.round(Rory.y) + ") & Rory vector = (" + Math.round(Rory.xV) + ", " + Math.round(Rory.yV) + ")");
            if (char.x > 960) { char.x = char.width * -1 };
            if (char.x < char.width * -1) { char.x = 960 };
            
            ctx.drawImage(rorySprite, char.sX, char.sY, char.sWidth, char.sHeight, char.x, char.y, char.width, char.height);
        };
        
        ctx.drawImage(overlay,0,0);
	};
	
	frameCount ++;
	
}; //end render