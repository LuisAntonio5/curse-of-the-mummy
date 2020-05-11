var canvasWidth = 800;
var canvasHeight = 600;
const debug = false;
//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
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
    list.map((key) => {
      this.phaser.load.image(key[0], key[1]);
    });
  }

  loadSpritesheet(list, size) {
    list.map((key) => {
      this.phaser.load.spritesheet(key[0], key[1], size, size);
    });
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
    newCharacter.body.gravity.y = 900;
    newCharacter.body.collideWorldBounds = true;
    this.phaser.debug.body("lilPeanut");
    return newCharacter;
  }

  animateAllObjects(level) {
    level.map.eletricSaw.map((key) => {
      key.doAnimation();
    });

    level.map.immovableObjects.map((key) => {
      key.doAnimation();
    });

    level.map.collectables.map((key) => {
      key.doAnimation();
    });
  }

  boxcollision(box, character) {
    box.body.velocity.x = 0;
    box.body.acceleration.x = 0;
  }

  collisionObjects(level) {
    //AQUI SAO FEITAS TODAS AS COLISOES ENTRE OBJETOS MOVABLE E NAO MOVABLE
    let buttonsCheck = false;
    //BIG BOXES COM ELEVADORES E CHARACTERS E SMALL BOXES
    level.map.bigBox.map((key) => {
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
          if (
            !(
              box.body.x + 6 < bigMack.body.x + bigMack.body.width &&
              box.body.x + box.body.width > bigMack.body.x + 6
            )
          ) {
            box.body.moves = true;
          }
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
    level.map.smallBox.map((key) => {
      key.data.body.velocity.x = 0;
      //SMALL BOX COM BIGMACK
      this.phaser.physics.arcade.collide(
        key.data,
        level.bigMack.obj,
        this.boxcollision,
        (box, bigMack) => {
          if (this.checkIfOnTopPartial(bigMack, box)) {
            return true;
          }
          box.kill();
          level.map.addSmallBox(key.x, key.y);
          //TODO: TIRAR DO ARRAY
        }
      );
      //SMALL BOX COM BIG BOX
      if (
        this.phaser.physics.arcade.collide(
          key.data,
          level.lilPeanut.obj,
          this.boxcollision,
          (box, lilPeanut) => {
            //se a box nao tiver a tocar noutra
            for (var i = 0; i < level.map.bigBox.length; i++) {
              if (
                this.phaser.physics.arcade.collide(
                  box,
                  level.map.bigBox[i].data
                )
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
        )
      ) {
        if (
          level.lilPeanut.boxAnim == false &&
          !this.checkIfOnTopPartial(level.lilPeanut.obj, key.data)
        ) {
          level.lilPeanut.boxAnim = true;
          if (level.lilPeanut.obj.body.velocity.x > 0)
            level.lilPeanut.doBoxRightAnimation();
          else {
            //ESQUERDA BOX TODO
          }
        }
      } else {
        level.lilPeanut.boxAnim = false;
      }
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

    //LILPEANUT E BIGMACK COM BOTOES
    const objPressed = {};
    for (var i = 0; i < level.map.buttons.length; i++) {
      this.phaser.physics.arcade.collide(
        level.lilPeanut.obj,
        level.map.buttons[i].data
      );
      this.phaser.physics.arcade.collide(
        level.bigMack.obj,
        level.map.buttons[i].data
      );
      if (
        this.checkIfOnTopPartial(
          level.lilPeanut.obj,
          level.map.buttons[i].data
        ) ||
        this.checkIfOnTopPartial(level.bigMack.obj, level.map.buttons[i].data)
      ) {
        if (!objPressed[level.map.buttons[i].actionObj]) {
          level.map.buttons[i].buttonPressed();
          objPressed[level.map.buttons[i].actionObj] = 1;
        } else {
          level.map.buttons[i].buttonPressed();
          objPressed[level.map.buttons[i].actionObj] += 1;
        }
      } else {
        if (!objPressed[level.map.buttons[i].actionObj]) {
          level.map.buttons[i].buttonUnpressed();
        }
      }
      /* if (
        this.phaser.physics.arcade.collide(
          level.lilPeanut.obj,
          level.map.buttons[i].data
        )
      ) {
        level.map.buttons[i].on(level.lilPeanut.obj);
        buttonsCheck = true;
      } else {
        level.map.buttons[i].on(level.lilPeanut.obj);
      }
      if (
        this.phaser.physics.arcade.collide(
          level.bigMack.obj,
          level.map.buttons[i].data
        ) &&
        !buttonsCheck
      ) {
        level.map.buttons[i].on(level.bigMack.obj);
      } else if (!buttonsCheck) {
        level.map.buttons[i].on(level.bigMack.obj);
      }*/
    }

    //LILPEANUT E BIGMACK COM SERRA
    for (var i = 0; i < level.map.eletricSaw.length; i++) {
      if (
        this.phaser.physics.arcade.collide(
          level.lilPeanut.obj,
          level.map.eletricSaw[i].data
        )
      ) {
        this.gameover(level);
      }

      if (
        this.phaser.physics.arcade.collide(
          level.bigMack.obj,
          level.map.eletricSaw[i].data
        )
      ) {
        this.gameover(level);
      }
    }

    //BOXES COM BOTOES
    for (var i = 0; i < level.map.buttons.length; i++) {
      for (var k = 0; k < level.map.smallBox.length; k++) {
        this.phaser.physics.arcade.collide(
          level.map.smallBox[k].data,
          level.map.buttons[i].data
        );
      }
      for (var k = 0; k < level.map.bigBox.length; k++) {
        this.phaser.physics.arcade.collide(
          level.map.smallBox[k].data,
          level.map.buttons[i].data
        );
      }
    }
  }

  collisionWithBounds(level) {
    var collision = false;
    level.map.bigBox.map((key) => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    level.map.smallBox.map((key) => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    //level.map.buttons.map((key) => {
    //  this.phaser.physics.arcade.collide(key.data, level.bounds);
    //});
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
    chains.map((key) => {
      if (elevator.data.body.y >= key.y && key.data.visible === false) {
        key.data.visible = true;
      }
    });
  }

  checkIfOnTopTotal(obj1, obj2) {
    //VERIFICA SE O OBJ1 esta em CIMA DO OBJ2
    const offset = 5;
    if (
      Math.round(obj1.body.x) >= Math.round(obj2.body.x) &&
      Math.round(obj1.body.x) + Math.round(obj1.body.width) <=
        Math.round(obj2.body.x) + Math.round(obj2.body.width) &&
      Math.abs(
        Math.round(obj1.body.y) +
          Math.round(obj1.body.height) -
          Math.round(obj2.body.y)
      ) <= offset
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIfOnTopPartial(obj1, obj2) {
    const offset = 5;
    if (
      Math.round(obj1.body.x) + Math.round(obj1.body.width) >=
        Math.round(obj2.body.x) &&
      Math.round(obj1.body.x) <=
        Math.round(obj2.body.x) + Math.round(obj2.body.width) &&
      Math.abs(
        Math.round(obj1.body.y) +
          Math.round(obj1.body.height) -
          Math.round(obj2.body.y)
      ) <= offset
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkElevatorStatus(level) {
    level.map.elevators.map((key) => {
      if (key.num == 2) {
        //CHECKA 2 colisoes para subir
        if (
          this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
          this.checkIfOnTopTotal(level.bigMack.obj, key.data) &&
          key.data.body.y >= key.maxY
        ) {
          /*key.data.body.y >= key.maxY &&
          key.data.body.x <
            level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width &&
          key.data.body.x + key.data.body.width > level.lilPeanut.obj.body.x &&
          key.data.body.y >=
            level.lilPeanut.obj.body.y + level.lilPeanut.obj.body.height */
          this.elevatorUp(key, level.map.chains);
        } else {
          if (
            key.data.body.y <= key.y &&
            !this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
            !this.checkIfOnTopTotal(level.bigMack.obj, key.data)
          )
            this.elevatorDown(key, level.map.chains);
          else {
            key.data.body.velocity.y = 0;
          }
        }
      } else {
        //CHEGA UMA COLISAO EM CIMA PARA SUBIR
      }
    });
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

    //VERIFICA FIM DO JOGO
    //CASO OS DOIS ESTEJAM CADA UM NA SUA PORTA
    if (level.checkCompleted()) {
      console.log("nextLevel");
      //TODO: NEXT LEVEL
    }

    //COLOCA SERRAS EM MOVIMENTO
    level.map.eletricSaw.map((key) => {
      key.moveSaw();
    });

    //ANIMA OS OBJECTOS TODOS
    this.animateAllObjects(level);
    if (debug) {
      level.debug();
    }

    //CHECKA OVERLAP NOS OBJETOS QUE AINDA FORAM APANHADOS
    this.checkCollected(level);

    //TIMER UPDATE
    level.timer.updateTimer();
  }

  gameover(level) {
    //GAME OVER
    console.log("GAME OVER");
    //TODO: MENU DE GAME OVER
  }

  checkCollected(level) {
    const scale = 2;
    const yBigMack = 20;
    const xBigMack = 46;
    const yLilPeanut = 20;
    const xLilPeanut = 146;
    const offset = 22;
    for (let i = 0; i < level.map.collectables.length; i++) {
      if (level.map.collectables[i].target == "bigmack") {
        this.phaser.physics.arcade.overlap(
          level.bigMack.obj,
          level.map.collectables[i].data,
          (player, obj) => {
            //SE EXISTIR OVERLAP
            obj.scale.setTo(scale, scale);
            obj.x = xBigMack + offset * level.nBigMackCollected;
            obj.y = yBigMack;
            obj.fixedToCamera = true;
            level.nBigMackCollected++;
          },
          null,
          this
        );
      }
      if (level.map.collectables[i].target == "lilpeanut") {
        this.phaser.physics.arcade.overlap(
          level.lilPeanut.obj,
          level.map.collectables[i].data,
          (player, obj) => {
            //SE EXISTIR OVERLAP
            obj.scale.setTo(scale, scale);
            obj.x = xLilPeanut + offset * level.nLilPeanutCollected;
            obj.y = yLilPeanut;
            obj.fixedToCamera = true;
            level.nLilPeanutCollected++;
          },
          null,
          this
        );
      }
    }
  }
}

class Map {
  constructor() {
    this.bounds = null;
    this.immovableObjects = [];
    this.elevators = [];
    this.chains = [];
    this.bigBox = [];
    this.smallBox = [];
    this.lilPeanutDoor = null;
    this.bigMackDoor = null;
    this.eletricSaw = [];
    this.buttons = [];
    this.collectables = [];
    this.coll;
  }

  addBigBox(x, y) {
    const gravity = 600;
    const scale = 3.5;
    const box = game.phaser.add.sprite(x, y, "bigBox");
    game.phaser.physics.arcade.enable(box);
    box.body.gravity.y = gravity;
    box.enableBody = true;
    box.body.immovable = false;
    const newBox = new BigBox(x, y, box);
    box.scale.setTo(scale, scale);
    box.smoothed = false;
    this.bigBox.push(newBox);
  }

  addSmallBox(x, y) {
    const gravity = 600;
    const scale = 2;
    const box = game.phaser.add.sprite(x, y, "smallBox");
    game.phaser.physics.arcade.enable(box);
    box.body.gravity.y = gravity;
    box.enableBody = true;
    box.body.immovable = false;
    const newBox = new SmallBox(x, y, box);
    box.scale.setTo(scale, scale);
    box.smoothed = false;
    this.smallBox.push(newBox);
  }

  addLilDoor(x, y) {
    const gravity = 0;
    const scale = 2;
    const door = game.phaser.add.sprite(x, y, "portaLil");
    game.phaser.physics.arcade.enable(door);
    door.body.gravity.y = gravity;
    door.enableBody = true;
    door.body.immovable = false;
    const newDoor = new LilDoor(x, y, door);
    door.scale.setTo(scale, scale);
    door.smoothed = false;
    this.lilPeanutDoor = newDoor;
  }

  addBigDoor(x, y) {
    const gravity = 0;
    const scale = 3.5;
    const door = game.phaser.add.sprite(x, y, "portaBig");
    game.phaser.physics.arcade.enable(door);
    door.body.gravity.y = gravity;
    door.enableBody = true;
    door.body.immovable = false;
    const newDoor = new BigDoor(x, y, door);
    door.scale.setTo(scale, scale);
    door.smoothed = false;
    this.bigMackDoor = newDoor;
  }

  addEletricSaw(x, y, maxX, maxY, velocity) {
    const gravity = 0;
    const scale = 3.5;
    const eletricSaw = game.phaser.add.sprite(x, y, "eletricSaw");
    game.phaser.physics.arcade.enable(eletricSaw);
    eletricSaw.body.gravity.y = gravity;
    eletricSaw.enableBody = true;
    eletricSaw.body.immovable = true;
    const newEletricSaw = new EletricSaw(
      x + 5,
      y,
      eletricSaw,
      maxX,
      maxY,
      velocity
    );
    eletricSaw.scale.setTo(scale, scale);
    eletricSaw.body.setCircle(10, 5, 5);
    eletricSaw.smoothed = false;
    this.eletricSaw.push(newEletricSaw);
  }

  addButton(x, y, actionObj) {
    const gravity = 50;
    const scale = 3;
    const button = game.phaser.add.sprite(x, y, "button");
    game.phaser.physics.arcade.enable(button);
    button.body.gravity.y = gravity;
    button.enableBody = true;
    button.body.immovable = true;
    button.body.moves = false;
    button.body.setSize(6, 3, 13, 14);
    const newButton = new Button(x, y, button, actionObj);
    button.scale.setTo(scale, scale);
    button.smoothed = false;
    button.frame = 1;
    this.buttons.push(newButton);
  }

  addCollectableLilPeanut(x, y) {
    const gravity = 0;
    const scale = 3.5;
    const target = "lilpeanut";
    const collectable = game.phaser.add.sprite(x, y, "collectableLilPeanut");
    game.phaser.physics.arcade.enable(collectable);
    collectable.body.gravity.y = gravity;
    collectable.enableBody = true;
    collectable.body.immovable = false;
    collectable.body.moves = true;
    const newCollectable = new Collectable(x, y, collectable, target);
    collectable.scale.setTo(scale, scale);
    collectable.smoothed = false;
    this.collectables.push(newCollectable);
  }
  addCollectableBigMack(x, y) {
    const gravity = 0;
    const scale = 3.5;
    const target = "bigmack";
    const collectable = game.phaser.add.sprite(x, y, "collectableBigMack");
    game.phaser.physics.arcade.enable(collectable);
    collectable.body.gravity.y = gravity;
    collectable.enableBody = true;
    collectable.body.immovable = false;
    collectable.body.moves = true;
    const newCollectable = new Collectable(x, y, collectable, target);
    collectable.scale.setTo(scale, scale);
    collectable.smoothed = false;
    this.collectables.push(newCollectable);
  }

  addCollectableBoards(x, y) {
    const scale = 2;
    const offSetX = 100;
    let board = game.phaser.add.sprite(x, y, "collectableBigMackBoard");
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    board = game.phaser.add.sprite(x + offSetX, y, "collectableLilPeanutBoard");
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
  }
}

class Level {
  constructor() {
    this.map = new Map();
    this.bigMack = null;
    this.lilPeanut = null;
    this.bounds = null;
    this.timer = new Timer();
    this.nLilPeanutCollected = 0;
    this.nBigMackCollected = 0;
  }

  debug() {
    game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.map.elevators[0].data, "rgba(0, 255, 0, 0.5)");
    game.phaser.debug.body(this.map.smallBox[0].data, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.map.bigBox[0].data, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.bigMack.obj, "rgba(255, 255, 0, 0.6)");
    game.phaser.debug.body(this.map.buttons[0].data, "rgba(255, 255, 0, 0.6)");
    game.phaser.debug.body(
      this.map.eletricSaw[0].data,
      "rgba(255, 255, 0, 0.6)"
    );
  }
}

class Level1 extends Level {
  constructor() {
    super();
  }

  checkCompleted() {
    let lilPeanutCheck = false;
    let bigMackCheck = false;
    if (
      game.phaser.physics.arcade.overlap(
        this.lilPeanut.obj,
        this.map.lilPeanutDoor.data
      )
    ) {
      lilPeanutCheck = true;
    }
    if (
      game.phaser.physics.arcade.overlap(
        this.bigMack.obj,
        this.map.bigMackDoor.data
      )
    ) {
      bigMackCheck = true;
    }
    if (lilPeanutCheck && bigMackCheck) {
      return true;
    }
    return false;
  }

  drawMap(game) {
    var nEletricSaw = 0;
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
      game.phaser.world.width - 75,
      game.phaser.world.height - 300,
      this.map
    );
    game.addTorch(-8, 100, this.map);

    //ELEVADOR
    //MAIOR INDICE MAIOR y
    for (var i = 0; i < 19; i++) {
      game.addChain(500, 550 - 19 * (18 - i), this.map.chains);
    }
    game.addElevator(
      430,
      561,
      this.map,
      2,
      null,
      game.phaser.world.height - 216
    );

    //BOXES
    this.map.addBigBox(300, 250);
    this.map.addSmallBox(640, 250);

    //ELETRIC SAW
    this.map.addEletricSaw(160, 505, 280, 505, 400);
    //BOTOES
    this.map.addButton(90, 511, this.map.eletricSaw[nEletricSaw]);
    this.map.addButton(350, 511, this.map.eletricSaw[nEletricSaw]);
    //PLATAFORMAS
    game.phaser.add.sprite(0, 0, "level1");

    //Adicionar os limites do mapa para as colisoes
    this.bounds = bounds;

    //PORTAS FINAIS
    this.map.addLilDoor(550, 132);
    this.map.addBigDoor(650, 82);

    //CIRA TIMER
    this.timer.createTimer();

    //BOARD PARA COLECTAVEIS
    this.map.addCollectableBoards(30, -2);

    //COLLECTAVEIS
    this.map.addCollectableLilPeanut(140, 220);
    this.map.addCollectableLilPeanut(387, 510);
    this.map.addCollectableLilPeanut(730, 510);
    this.map.addCollectableBigMack(370, 130);
    this.map.addCollectableBigMack(180, 490);
    this.map.addCollectableBigMack(460, 380);
  }

  initializeCharacters(game) {
    //character creation
    var lilPeanutObj = game.placeCharacter(
      60,
      game.phaser.world.height - 175,
      "lilPeanut"
    );
    this.lilPeanut = new lilPeanut(lilPeanutObj);

    var bigMackObj = game.placeCharacter(
      30,
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
    charObj.body.setSize(16, 42, 22, 13);
    charObj.animations.add("walkRight", [0, 1, 2], 11, true);
    charObj.animations.add("restRight", [0, 3], 4, true);
    //charObj.animations.add("restLeft", [10, 11], 5, true);
  }

  doWalkLeftAnimation() {
    this.obj.body.velocity.x = -200;
  }

  doWalkRightAnimation() {
    this.obj.body.velocity.x = 200;
    this.obj.play("walkRight");
    this.lastAnimation = "right";
  }

  stopAnimation() {
    this.obj.animations.stop();
  }

  jump() {
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

class lilPeanut extends Character {
  constructor(charObj) {
    super(charObj);
    this.boxAnim = false;
    charObj.body.setSize(13, 26, 10, 5);
    charObj.frame = 3;
    charObj.animations.add("walkLeft", [0, 1, 2], 10, true);
    charObj.animations.add("walkRight", [3, 4, 5], 10, true);
    charObj.animations.add("jump", [7], 1, true);
    charObj.animations.add("restRight", [8, 9], 5, true);
    charObj.animations.add("restLeft", [10, 11], 5, true);
    charObj.animations.add("boxRight", [12, 13], 10, false);
    charObj.animations.add("walkBoxRight", [13, 14], 10, true);
  }

  doWalkLeftAnimation() {
    if (this.boxAnim == false) {
      this.obj.play("walkLeft");
      this.lastAnimation = "left";
    } else {
    }
    this.obj.body.velocity.x = -200;
  }

  doWalkRightAnimation() {
    this.obj.body.velocity.x = 200;
    if (this.boxAnim == false) {
      this.obj.play("walkRight");
    } else {
      this.obj.play("walkBoxRight");
    }
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

  doBoxRightAnimation() {
    this.obj.play("boxRight");
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
  doAnimation() {
    this.data.play("animation");
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
    this.data.animations.add("animation", [0, 1], 5, true);
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

class LilDoor extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class BigDoor extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class EletricSaw extends Sprite {
  constructor(x, y, data, maxX, maxY, velocity) {
    super(x, y, data);
    this.maxX = maxX;
    this.maxY = maxY;
    this.velocity = velocity;
    this.stop = false;
    data.animations.add("rotate", [0, 1, 2], 8, true);
    data.body.velocity.x = velocity;
  }

  doAnimation() {
    this.data.play("rotate");
  }

  press() {
    this.data.body.moves = false;
  }

  unpress() {
    this.data.body.moves = true;
  }

  moveSaw(x, y) {
    if (this.maxX == this.x) {
      if (this.data.body.y >= this.maxY) {
        this.data.body.velocity.y = -this.velocity;
      } else if (this.data.body.y <= this.y) {
        this.data.body.velocity.y = this.velocity;
      }
    }
    if (this.maxY == this.y) {
      //MOVIMENTO NA HORIZNTAL

      if (this.data.body.x >= this.maxX) {
        this.data.body.velocity.x = -this.velocity;
      } else if (this.data.body.x <= this.x) {
        this.data.body.velocity.x = this.velocity;
      }
    }
  }
}

class Button extends Sprite {
  constructor(x, y, data, actionObj) {
    super(x, y, data);
    this.actionObj = actionObj;
  }

  buttonPressed() {
    if (this.actionObj.constructor.name === "EletricSaw") {
      //PARA A SAW
      this.data.frame = 1;
      this.actionObj.press();
    }

    //if(typeof(this.actionObj))
  }

  buttonUnpressed() {
    if (this.actionObj.constructor.name === "EletricSaw") {
      this.data.frame = 0;
      this.actionObj.unpress();
    }
  }
}

class Collectable extends Sprite {
  constructor(x, y, data, target) {
    super(x, y, data);
    this.velocity = 20;
    this.target = target;
  }

  doAnimation() {
    if (this.data.body.y >= this.y + 10) {
      this.data.body.velocity.y = -this.velocity;
    } else if (this.data.body.y <= this.y) {
      this.data.body.velocity.y = this.velocity;
    }
  }
}

class Timer {
  constructor() {
    this.slot1 = {};
    this.slot2 = {};
    this.slot3 = {};
    this.slot4 = {};
  }

  createTimer() {
    const posX = 400 - 48;
    const posY = -8;
    const gravity = 0;
    const scale = 3;
    const board = game.phaser.add.sprite(posX, posY, "timerBoard");
    const xCoords = [373, 393, 428, 448];
    const yCoord = 19;
    const nNums = 10;
    const nSlots = 4;
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    var date = new Date();
    this.startTime = date.getTime();
    for (let i = 1; i <= nSlots; i++) {
      for (let k = 0; k < nNums; k++) {
        this["slot" + String(i)][k] = game.phaser.add.sprite(
          xCoords[i - 1],
          yCoord,
          String(k)
        );
        this["slot" + String(i)][k].visible = false;
        this["slot" + String(i)][k].scale.setTo(scale, scale);
        this["slot" + String(i)][k].smoothed = false;
      }
    }
  }

  updateDigit(digit, slot) {
    const nNums = 10;
    if (slot[digit].visible == false) {
      for (let k = 0; k < nNums; k++) {
        slot[k].visible = false;
      }
      slot[digit].visible = true;
    }
  }

  updateTimer() {
    var date = new Date();
    var currentTime = date.getTime();
    var timerValue = Math.round((currentTime - this.startTime) / 1000);
    var minutes = String(Math.floor(timerValue / 60));
    var seconds = String(timerValue % 60);
    if (parseInt(seconds) > 9) {
      this.updateDigit(seconds[0], this.slot3);
      this.updateDigit(seconds[1], this.slot4);
    } else {
      this.updateDigit("0", this.slot3);
      this.updateDigit(seconds[0], this.slot4);
    }
    if (parseInt(minutes) > 9) {
      this.updateDigit(minutes[0], this.slot1);
      this.updateDigit(minutes[1], this.slot2);
    } else {
      this.updateDigit("0", this.slot1);
      this.updateDigit(minutes[0], this.slot2);
    }
  }
}
