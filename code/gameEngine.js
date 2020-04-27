var canvasWidth = 800;
var canvasHeight = 600;

class GameEngine {
  constructor() {
    this.sprites = {};
    this.player = null;
    this.currentLevel = null;
    this.phaser = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, "");
    this.lilPeanut = null;
    this.bigMack = null;
  }

  loadImages(list) {
    list.map(key => {
      this.phaser.load.image(key[0], key[1]);
    });
  }

  loadSpritesheet(list) {
    list.map(key => {
      this.phaser.load.spritesheet(key[0], key[1], 32, 32);
    });
  }

  placeObject(x, y, character) {
    var newObj = this.phaser.add.sprite(x, y, character);
    newObj.scale.setTo(2, 2);
    newObj.smoothed = false;
  }

  addTorch(x, y, map) {
    const torch = this.phaser.add.sprite(x, y, "torch");
    //torch.body.immovable = true;
    torch.scale.setTo(3, 3);
    torch.smoothed = false;
    const newTorch = new Torch(x, y, torch);
    map.immovableObjects.push(newTorch);
  }

  addTorchInverted(x, y, map) {
    const torch = this.phaser.add.sprite(x, y, "torchInverted");
    //torch.body.immovable = true;
    torch.scale.setTo(3, 3);
    torch.smoothed = false;
    const newTorch = new Torch(x, y, torch);
    map.immovableObjects.push(newTorch);
  }

  drawBound(x, y, width, group, vertical) {
    if (vertical) {
      var platform = group.create(x, y, "boundsVertical");
      platform.body.immovable = true;
      platform.height = width;
    } else {
      var platform = group.create(x, y, "boundsHorizontal");
      platform.width = width;
      platform.body.immovable = true;
    }
  }

  placeCharacter(x, y, character) {
    var newCharacter = this.phaser.add.sprite(x, y, character);
    newCharacter.scale.setTo(2, 2);
    newCharacter.smoothed = false;
    this.phaser.physics.arcade.enable(newCharacter);
    newCharacter.body.gravity.y = 800;
    newCharacter.body.collideWorldBounds = true;
    this.phaser.debug.body("lilPeanut");
    return newCharacter;
  }

  boxcollision(box, character) {
    box.body.velocity.x = 0;
    box.body.acceleration.x = 0;
  }

  collisionObjects(level) {
    //AQUI SAO FEITAS TODAS AS COLISOES ENTRE OBJETOS MOVABLE E NAO MOVABLE

    //BIG BOXES COM ELEVADORES E CHARACTERS E SMALL BOXES
    level.map.bigBox.map(key => {
      //BIG BOX COM LILPEANUT
      this.phaser.physics.arcade.collide(
        key.data,
        level.lilPeanut.obj,
        this.boxcollision,
        (box, lilPeanut) => {
          //COLOCAR so ha colisao em cima
          box.body.moves = false;
          return true;
        }
      );

      //BIG BOX COM SMALL BOX e COM BIGMACK
      this.phaser.physics.arcade.collide(
        key.data,
        level.bigMack.obj,
        this.boxcollision,
        (box, bigMack) => {
          box.body.moves = true;
          //se a box nao tiver a tocar noutra
          for (var i = 0; i < level.map.smallBox.length; i++) {
            if (
              this.phaser.physics.arcade.collide(
                box,
                level.map.smallBox[i].data
              )
            ) {
              if (level.map.smallBox[i].data.x < box.body.x) {
                box.body.x += 1;
                bigMack.body.x += 5;
                bigMack.body.velocity.x = 0;
              } else {
                box.body.x -= 1;
                bigMack.body.x -= 5;
                bigMack.body.velocity.x = 0;
              }
              return false;
            } else {
              return true;
            }
          }
        },
        this
      );
      //BIG BOX COM ELEVADOR
      for (var i = 0; i < level.map.elevators.length; i++) {
        this.phaser.physics.arcade.collide(
          key.data,
          level.map.elevators[i].data
        );
      }
    });

    //SMALL BOXES COM ELEVVADORES E CHARACTERS
    level.map.smallBox.map(key => {
      key.data.body.velocity.x = 0;
      //SMALL BOX COM BIGMACK
      this.phaser.physics.arcade.collide(
        key.data,
        level.bigMack.obj,
        this.boxcollision,
        (box, bigMack) => {
          if (
            box.body.x + 6 < bigMack.body.x + bigMack.body.width &&
            box.body.x + box.body.width > bigMack.body.x + 6
          ) {
            return true;
          }
          box.kill();
          level.map.addSmallBox(key.x, key.y);
          //TODO: TIRAR DO ARRAY
        }
      );
      //SMALL BOX COM BIG BOX
      this.phaser.physics.arcade.collide(
        key.data,
        level.lilPeanut.obj,
        this.boxcollision,
        (box, lilPeanut) => {
          //se a box nao tiver a tocar noutra
          for (var i = 0; i < level.map.bigBox.length; i++) {
            if (
              this.phaser.physics.arcade.collide(box, level.map.bigBox[i].data)
            ) {
              if (level.map.bigBox[i].data.x < box.body.x) {
                box.body.x += 1;
                lilPeanut.body.x += 5;
                lilPeanut.body.velocity.x = 0;
              } else {
                box.body.x -= 1;
                lilPeanut.body.x -= 5;
                lilPeanut.body.velocity.x = 0;
              }
              return false;
            } else {
              return true;
            }
          }
        },
        this
      );
      //SMALL BOX COM ELEVADOR
      for (var i = 0; i < level.map.elevators.length; i++) {
        this.phaser.physics.arcade.collide(
          key.data,
          level.map.elevators[i].data
        );
      }
    });
    //LILPENAUT E BIGMACK COM ELEVADORES
    for (var i = 0; i < level.map.elevators.length; i++) {
      this.phaser.physics.arcade.collide(
        level.lilPeanut.obj,
        level.map.elevators[i].data
      );
      this.phaser.physics.arcade.collide(
        level.bigMack.obj,
        level.map.elevators[i].data
      );
    }
  }

  prevent;

  collisionWithBounds(level) {
    var collision = false;
    level.map.movableObjects.map(key => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    level.map.bigBox.map(key => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    level.map.smallBox.map(key => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.bounds);
    this.phaser.physics.arcade.collide(level.bigMack.obj, level.bounds);
  }

  addElevator(x, y, map, num, maxX, maxY) {
    const elevator = this.phaser.add.sprite(x, y, "elevator");
    this.phaser.physics.arcade.enable(elevator);
    elevator.body.gravity.y = 0;
    elevator.enableBody = true;
    elevator.body.immovable = true;
    const newElevator = new Elevator(x, y, elevator, num, maxX, maxY);
    elevator.scale.setTo(10, 2.5);
    elevator.smoothed = false;
    map.elevators.push(newElevator);
  }

  addChain(x, y, chains) {
    const chain = this.phaser.add.sprite(x, y, "chain");
    const newChain = new Chain(x, y, chain);
    chain.scale.setTo(1.5, 1.2);
    chain.smoothed = false;
    chains.push(newChain);
  }

  elevatorUp(elevator, chains) {
    //elevator.data.body.gravity.y = 800;
    elevator.data.body.velocity.y = -50;
    chains.map((key, index) => {
      if (elevator.data.body.y < key.data.y) {
        key.data.visible = false;
      }
    });
  }

  elevatorDown(elevator, chains) {
    elevator.data.body.velocity.y = 50;
    chains.map(key => {
      if (elevator.data.body.y >= key.y && key.data.visible === false) {
        key.data.visible = true;
      }
    });
  }

  checkElevatorStatus(level) {
    level.map.elevators.map(key => {
      if (key.num == 2) {
        //CHECKA 2 colisoes para subir
        if (
          key.data.body.y >= key.maxY &&
          key.data.body.x <
            level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width &&
          key.data.body.x + key.data.body.width > level.lilPeanut.obj.body.x &&
          key.data.body.y >=
            level.lilPeanut.obj.body.y + level.lilPeanut.obj.body.height
        ) {
          this.elevatorUp(key, level.map.chains);
        } else {
          if (
            key.data.body.x + key.data.body.width >
              level.lilPeanut.obj.body.x &&
            key.data.body.x <
              level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width
          ) {
            key.data.body.velocity.y = 0;
          } else {
            if (key.data.body.y <= key.y)
              this.elevatorDown(key, level.map.chains);
            else {
              key.data.body.velocity.y = 0;
            }
          }
        }
      } else {
        //CHEGA UMA COLISAO EM CIMA PARA SUBIR
      }
    });
  }

  checkCanJumo(map) {
    for (var i = 0; i < map.elevators.length; i++) {}
  }

  levelUpdate(level) {
    //VARIAVEIS

    //COLISOES
    this.collisionObjects(level);
    this.collisionWithBounds(level);
    //CHECK NOS ELEVADORES
    this.checkElevatorStatus(level);

    //LILPEANUT
    level.lilPeanut.obj.body.velocity.x = 0;
    if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
      level.lilPeanut.doWalkRightAnimation();
    } else if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
      level.lilPeanut.doWalkLeftAnimation();
    } else {
      level.lilPeanut.restAnimation();
    }
    //  Allow the player to jump if they are touching the ground.
    if (
      this.phaser.input.keyboard.isDown(Phaser.KeyCode.UP) &&
      level.lilPeanut.obj.body.touching.down
    ) {
      level.lilPeanut.jump();
    }

    //BIGMACK
    level.bigMack.obj.body.velocity.x = 0;
    if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.D)) {
      level.bigMack.doWalkRightAnimation();
    } else if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.A)) {
      level.bigMack.doWalkLeftAnimation();
    } else {
      level.bigMack.restAnimation();
    }
    //  Allow the player to jump if they are touching the ground.
    if (
      this.phaser.input.keyboard.isDown(Phaser.KeyCode.W) &&
      level.bigMack.obj.body.touching.down
    ) {
      level.bigMack.jump();
    }

    level.debug();
  }
}

class Map {
  constructor() {
    this.bounds = null;
    this.immovableObjects = [];
    this.movableObjects = [];
    this.elevators = [];
    this.chains = [];
    this.bigBox = [];
    this.smallBox = [];
  }

  addBigBox(x, y) {
    const box = game.phaser.add.sprite(x, y, "bigBox");
    game.phaser.physics.arcade.enable(box);
    box.body.gravity.y = 600;
    box.enableBody = true;
    box.body.immovable = false;
    const newBox = new BigBox(x, y, box);
    box.scale.setTo(3.5, 3.5);
    box.smoothed = false;
    this.bigBox.push(newBox);
  }

  addSmallBox(x, y) {
    const box = game.phaser.add.sprite(x, y, "smallBox");
    game.phaser.physics.arcade.enable(box);
    box.body.gravity.y = 6000;
    box.enableBody = true;
    box.body.immovable = false;
    const newBox = new SmallBox(x, y, box);
    box.scale.setTo(2, 2);
    box.smoothed = false;
    this.smallBox.push(newBox);
  }
}

class Level {
  constructor() {
    this.map = new Map();
    this.bigMack = null;
    this.lilPeanut = null;
    this.bounds = null;
  }

  debug() {
    game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.map.elevators[0].data, "rgba(0, 255, 0, 0.5)");
    game.phaser.debug.body(this.map.smallBox[0].data, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.map.bigBox[0].data, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.bigMack.obj, "rgba(255, 255, 0, 0.6)");
  }
}

class Level1 extends Level {
  constructor() {
    super();

    //desenha todo o primeiro nivel
  }

  drawMap(game) {
    var bounds = game.phaser.add.group();
    bounds.enableBody = true;
    //PASSR TUDO PARA A FUNÇAO DRAW BOUND
    game.drawBound(0, game.phaser.world.height - 38, 800, bounds);
    game.drawBound(273, game.phaser.world.height - 402, 600, bounds);
    game.drawBound(0, game.phaser.world.height - 216, 430, bounds);
    game.drawBound(0, game.phaser.world.height - 201, 430, bounds);
    game.drawBound(273, game.phaser.world.height - 388, 600, bounds);
    game.drawBound(0, 54, 800, bounds);
    game.drawBound(426, 385, 15, bounds, 1);
    game.drawBound(272, 200, 15, bounds, 1);
    game.drawBound(16, 0, 600, bounds, 1);
    game.drawBound(game.phaser.world.width - 18, 0, 600, bounds, 1);

    var background = game.phaser.add.sprite(0, 0, "backgroundLevel");
    background.scale.setTo(0.5, 0.5);
    //game.addTorch(50, 50, this.map);

    //TOCHAS
    game.addTorchInverted(
      game.phaser.world.width - 50,
      game.phaser.world.height - 300,
      this.map
    );
    game.addTorch(20, 100, this.map);

    //ELEVADOR
    //MAIOR INDICE MAIOR y
    for (var i = 0; i < 19; i++) {
      game.addChain(500, 550 - 19 * (18 - i), this.map.chains);
    }
    game.addElevator(
      430,
      561.99,
      this.map,
      2,
      null,
      game.phaser.world.height - 216
    );

    //BOXES
    this.map.addBigBox(300, 250);
    this.map.addSmallBox(500, 250);

    //PLATAFORMAS
    game.phaser.add.sprite(0, 0, "level1");

    //Adicionar os limites do mapa para as colisoes
    this.bounds = bounds;
  }

  initializeCharacters(game) {
    //character creation
    var lilPeanutObj = game.placeCharacter(
      50,
      game.phaser.world.height - 150,
      "lilPeanut"
    );
    this.lilPeanut = new lilPeanut(lilPeanutObj);

    var bigMackObj = game.placeCharacter(
      50,
      game.phaser.world.height - 200,
      "bigMack"
    );
    this.bigMack = new bigMack(bigMackObj);
  }
}

class Character {
  constructor(charObj) {
    this.obj = charObj;
    this.lastAnimation = null;
  }
}

class bigMack extends Character {
  constructor(charObj) {
    super(charObj);
    charObj.body.setSize(16, 42, 1, 3);
  }

  doWalkLeftAnimation() {
    this.obj.body.velocity.x = -150;
  }

  doWalkRightAnimation() {
    this.obj.body.velocity.x = 150;
  }

  stopAnimation() {
    this.obj.animations.stop();
  }

  jump() {
    this.obj.body.velocity.y = -400;
  }

  restAnimation() {}
}

class lilPeanut extends Character {
  constructor(charObj) {
    super(charObj);
    charObj.body.setSize(13, 26, 10, 5);
    charObj.frame = 3;
    charObj.animations.add("walkLeft", [0, 1, 2], 10, true);
    charObj.animations.add("walkRight", [3, 4, 5], 10, true);
    charObj.animations.add("jump", [7], 1, true);
    charObj.animations.add("restRight", [8, 9], 5, true);
    charObj.animations.add("restLeft", [10, 11], 5, true);
  }

  doWalkLeftAnimation() {
    this.obj.body.velocity.x = -150;
    this.obj.play("walkLeft");
    this.lastAnimation = "left";
  }

  doWalkRightAnimation() {
    this.obj.body.velocity.x = 150;
    this.obj.play("walkRight");
    this.lastAnimation = "right";
  }

  stopAnimation() {
    if (this.lastAnimation == "right" || this.lastAnimation == null) {
      this.obj.frame = 3;
    } else if (this.lastAnimation == "left") {
      this.obj.frame = 0;
    }
    this.obj.animations.stop();
  }

  jump() {
    this.obj.play("jump");
    this.obj.body.velocity.y = -400;
  }

  restAnimation() {
    if (this.lastAnimation == "right" || this.lastAnimation == null) {
      this.obj.play("restRight");
    } else if (this.lastAnimation == "left") {
      this.obj.play("restLeft");
    }
  }
}

//SPRITE CLASS DEF
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

class Elevator extends Sprite {
  constructor(x, y, data, num, maxX, maxY) {
    super(x, y, data);
    this.num = num;
    this.maxX = maxX;
    this.maxY = maxY;
  }
}

class Chain extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class SmallBox extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class BigBox extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}
