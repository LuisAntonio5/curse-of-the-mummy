var canvasWidth = 800;
var canvasHeight = 600;

class GameEngine {
  constructor() {
    this.sprites = {};
    this.player = null;
    this.currentLevel = null;
    this.phaser = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, "");
    this.lilPeanut = null;
    this.bigMack = null;
  }

  loadFonts() {
    this.phaser.load.bitmapFont(
      "myfont",
      "assets/font/font.png",
      "assets/font/font.fnt"
    );
  }

  loadImages(list) {
    list.map((key) => {
      this.phaser.load.image(key[0], key[1]);
    });
  }

  loadSpritesheet(list) {
    list.map((key) => {
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
    this.phaser.physics.arcade.enable(torch);
    torch.body.bounce.y = 0.01;
    torch.body.gravity.y = 0;
    torch.body.collideWorldBounds = true;
    torch.body.immovable = true;
    //torch.body.immovable = true;
    torch.scale.setTo(3, 3);
    torch.smoothed = false;
    const newTorch = new Torch(x, y, torch);
    map.immovableObjects.push(newTorch);
  }

  addTorchInverted(x, y, map) {
    const torch = this.phaser.add.sprite(x, y, "torchInverted");
    this.phaser.physics.arcade.enable(torch);
    torch.body.bounce.y = 0.01;
    torch.body.gravity.y = 0;
    torch.body.collideWorldBounds = true;
    torch.body.immovable = true;
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
    newCharacter.body.bounce.y = 0.01;
    newCharacter.body.gravity.y = 800;
    newCharacter.body.collideWorldBounds = true;
    return newCharacter;
  }

  colisionsWithImovableObjects(level) {
    //AQUI SAO FEITAS TODAS AS COLISOES ENTRE OBJETOS MOVABLE E NAO MOVABLE
    level.map.immovableObjects.map((key) => {
      console.log(
        this.phaser.physics.arcade.collide(level.lilPeanut.obj, key.data)
      );
      //this.phaser.physics.arcade.collide(level.bigMack.obj, key.data);
      level.map.movableObjects.map((chave) => {
        this.phaser.physics.arcade.collide(chave.data, key.data);
      });
    });
  }

  colisionWithBounds(level) {
    var colision = false;
    level.map.movableObjects.map((key) => {
      if (this.phaser.physics.arcade.collide(key.data, level.bounds)) {
        colision = true;
      }
    });
    this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.bounds);
    level.lilPeanut.obj;
    return true;
  }

  levelUpdate(level) {
    //VARIAVEIS
    var lilPeanutBoundColision = null;
    var bigMackBoundColision = null;
    //LILPEANUT
    //this.colisionsWithImovableObjects(level);
    lilPeanutBoundColision = this.colisionWithBounds(level);
    level.lilPeanut.obj.body.velocity.x = 0;
    if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
      level.lilPeanut.doWalkRightAnimation();
    } else if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
      level.lilPeanut.doWalkLeftAnimation();
    } else {
      level.lilPeanut.stopAnimation();
    }

    //  Allow the player to jump if they are touching the ground.
    if (
      this.phaser.input.keyboard.isDown(Phaser.KeyCode.UP) &&
      level.lilPeanut.obj.body.touching.down
    ) {
      level.lilPeanut.jump();
    }
    if (
      level.lilPeanut.obj.body.velocity.x < 1 &&
      level.lilPeanut.obj.body.velocity.x > -1 &&
      level.lilPeanut.obj.body.velocity.y < 1 &&
      level.lilPeanut.obj.body.velocity.y > -1 &&
      lilPeanutBoundColision
    ) {
      //rest
      console.log("aaa");
      level.lilPeanut.restAnimation();
    }
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
    this.lilPeanut = null;
    this.bounds = null;
    //desenha todo o primeiro nivel
  }

  drawMap(game) {
    var bounds = game.phaser.add.group();
    bounds.enableBody = true;
    //PASSR TUDO PARA A FUNÇAO DRAW BOUND
    game.drawBound(0, game.phaser.world.height - 38, 800, bounds);
    game.drawBound(273, game.phaser.world.height - 400, 600, bounds);
    game.drawBound(0, game.phaser.world.height - 216, 430, bounds);
    game.drawBound(0, game.phaser.world.height - 201, 430, bounds);
    game.drawBound(273, game.phaser.world.height - 392, 600, bounds);
    game.drawBound(0, 54, 800, bounds);
    game.drawBound(425, 385, 15, bounds, 1);
    game.drawBound(287, 200, 15, bounds, 1);
    game.drawBound(16, 0, 600, bounds, 1);
    game.drawBound(game.phaser.world.width - 18, 0, 600, bounds, 1);

    var background = game.phaser.add.sprite(0, 0, "backgroundLevel");
    background.scale.setTo(0.5, 0.5);
    //game.addTorch(50, 50, this.map);
    game.addTorchInverted(
      game.phaser.world.width - 50,
      game.phaser.world.height - 300,
      this.map
    );
    game.addTorch(20, 100, this.map);
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
  }
}

class Character {
  constructor(charObj) {
    this.obj = charObj;
    this.lastAnimation = null;
  }
}

class lilPeanut extends Character {
  constructor(charObj) {
    super(charObj);
    charObj.frame = 3;
    charObj.animations.add("walkLeft", [0, 1, 2], 10, true);
    charObj.animations.add("walkRight", [3, 4, 5], 10, true);
    charObj.animations.add("jump", [7], 1, true);
    charObj.animations.add("rest", [8, 9], 10, true);
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
    console.log(this.lastAnimation);
    if (this.lastAnimation == "right" || this.lastAnimation == null) {
      this.obj.frame = 3;
    } else if (this.lastAnimation == "left") {
      this.obj.frame = 0;
    }
    this.obj.animations.stop();
  }

  jump() {
    this.obj.play("jump");
    this.obj.body.velocity.y = -300;
  }

  restAnimation() {
    //this.obj.play("rest");
  }
}

class Menu {
  constructor() {
    this.buttons = [];
    this.sprites = [];
  }

  toOptions() {
    game.phaser.state.start("Options");
  }

  toStart() {
    game.phaser.state.start("Level1");
  }

  toRanking() {
    game.phaser.state.start("Ranking");
  }

  toMainMenu() {
    game.phaser.state.start("MainMenu");
  }

  addSprite(x, y, name) {
    var sprite = game.phaser.add.sprite(x, y, name);
    sprite.smoothed = false;
    this.sprites.push(sprite);
    return sprite;
  }

  addButton(x, y, name, callToAction) {
    var button = game.phaser.add.button(
      x,
      y,
      name,
      callToAction,
      this,
      0,
      0,
      0
    );
    button.smoothed = false;
    this.buttons.push(button);
    return button;
  }
}

class Options extends Menu {
  constructor() {
    super();
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(175, -100, "optionsTitle").scale.setTo(0.75, 0.75);
    this.addSprite(50, 150, "optionsSoundEffects").scale.setTo(0.6, 0.6);
    this.addSprite(65, 300, "optionsGameMusic").scale.setTo(0.6, 0.6);
    this.addSprite(65, 450, "optionsMenuMusic").scale.setTo(0.6, 0.6);
  }

  addButtons(game) {
    this.addButton(200, 130, "SoundLessSoundEffects").scale.setTo(1.5, 1.5);
    this.addButton(200, 280, "SoundLessGameMusic").scale.setTo(1.5, 1.5);
    this.addButton(200, 430, "SoundLessMenuMusic").scale.setTo(1.5, 1.5);
  }
}

class MainMenu extends Menu {
  constructor() {
    super();
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(100, -75, "titleInline").scale.setTo(0.6, 0.6);
    this.addSprite(600, 350, "lilPeanutImg").scale.setTo(6, 6);
    this.addSprite(110, 255, "bigMackImg").scale.setTo(6, 6);
  }

  addButtons(game) {
    this.addButton(330, 150, "startBtn", this.toStart).scale.setTo(2.8, 2.8);
    this.addButton(330, 220, "optionsBtn", this.toOptions).scale.setTo(
      2.8,
      2.8
    );
    this.addButton(330, 290, "helpBtn").scale.setTo(2.8, 2.8);
    this.addButton(330, 360, "rankingBtn", this.toRanking).scale.setTo(
      2.8,
      2.8
    );
  }
}

class Ranking extends Menu {
  constructor() {
    super();
  }

  addText(game, t1, t2, t3, t4, t5) {
    t1 = game.phaser.add.bitmapText(50, 150, "myfont", t1, 32);
    t2 = game.phaser.add.bitmapText(50, 220, "myfont", t2, 32);
    t3 = game.phaser.add.bitmapText(50, 290, "myfont", t3, 32);
    t4 = game.phaser.add.bitmapText(50, 360, "myfont", t4, 32);
    t5 = game.phaser.add.bitmapText(50, 430, "myfont", t5, 32);
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(45, -255, "rankingInline").scale.setTo(0.6, 0.6);
  }

  addButtons(game) {
    this.addButton(30, -20, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);
  }
}
