var canvasWidth = 800;
var canvasHeight = 600;

class GameEngine {
  constructor() {
    this.sprites = {};
    this.player = null;
    this.currentLevel = null;
    this.phaser = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, "");
  }

  loadImages(list) {
    list.map(key => {
      this.phaser.load.image(key[0], key[1]);
    });
  }

  placeObject(x, y, character) {
    var newObj = this.phaser.add.sprite(x, y, character);
    newObj.scale.setTo(2, 2);
    newObj.smoothed = false;
  }

  addTorch(x, y, map) {
    const torch = this.phaser.add.sprite(50, 50, "torch");
    torch.scale.setTo(4, 4);
    torch.smoothed = false;
    const newTorch = new Torch(50, 50, this.sprites.torch);
    map.immovableObjects.push(newTorch);
  }

  drawBound(x, y, width, group, vertical) {
    var platform = group.create(x, y, "bounds");
    platform.width = width;
    platform.body.immovable = true;
    if (vertical) {
      platform.angle = 90;
    }
  }

  placeCharacter(x, y, character) {
    var newCharacter = this.phaser.add.sprite(x, y, character);
    newCharacter.scale.setTo(2, 2);
    newCharacter.smoothed = false;
    this.phaser.physics.arcade.enable(newCharacter);
    newCharacter.body.bounce.y = 0.01;
    newCharacter.body.gravity.y = 600;
    newCharacter.body.collideWorldBounds = true;
    return newCharacter;
  }
}

class Map {
  constructor() {
    this.bounds = null;
    this.immovableObjects = [];
    this.movableObjects = [];
  }
}

class Sprite {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

class Platform extends Sprite {
  constructor() {
    super();
  }
}

class Torch extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class Bounds extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class Level {
  constructor() {
    this.map = new Map();
  }
}

class Level1 extends Level {
  constructor() {
    super();
    this.bigMack = null;
    this.lilPearnut = null;
    this.bounds = null;
    //desenha todo o primeiro nivel
  }

  drawMap(game) {
    var bounds = game.phaser.add.group();
    bounds.enableBody = true;
    //PASSR TUDO PARA A FUNÇAO DRAW BOUND
    game.drawBound(0, game.phaser.world.height - 80, 800, bounds);
    game.drawBound(273, game.phaser.world.height - 406, 600, bounds);
    game.drawBound(0, game.phaser.world.height - 222, 430, bounds);
    game.drawBound(0, game.phaser.world.height - 206, 430, bounds);
    game.drawBound(273, game.phaser.world.height - 392, 600, bounds);
    game.drawBound(0, 48, 800, bounds);
    game.drawBound(435, 385, 15, bounds, 1);
    game.drawBound(281, 200, 15, bounds, 1);
    game.drawBound(24, 0, 600, bounds, 1);
    game.drawBound(game.phaser.world.width - 10, 0, 600, bounds, 1);

    var background = game.phaser.add.sprite(0, 0, "backgroundLevel");
    background.scale.setTo(0.5, 0.5);
    game.addTorch(50, 50, this.map);
    game.addTorch(400, 400, this.map);

    //character creation
    this.bigMack = game.placeCharacter(
      50,
      game.phaser.world.height - 250,
      "bigMack"
    );
    game.phaser.add.sprite(0, 0, "level1");
    //Adicionar os limites do mapa para as colisoes
    this.bounds = bounds;
    console.log(bounds);
  }
}
