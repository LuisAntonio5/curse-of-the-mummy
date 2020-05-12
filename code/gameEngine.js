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

  loadSpritesheet(list, size) {
    list.map((key) => {
      this.phaser.load.spritesheet(key[0], key[1], size, size);
    });
  }

  //TODO: MUDAR ISTO PARA CLASSE MAPA

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
    level.lilPeanut.obj.kill();
    console.log(level.lilPeanut.obj);
    this.phaser.paused = false;
    game.phaser.state.start("Level1");
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

  addElevator(x, y, map, num, maxX, maxY) {
    const elevator = game.phaser.add.sprite(x, y, "elevator");
    game.phaser.physics.arcade.enable(elevator);
    elevator.body.gravity.y = 0;
    elevator.enableBody = true;
    elevator.body.immovable = true;
    const newElevator = new Elevator(x, y, elevator, num, maxX, maxY);
    elevator.scale.setTo(10, 2.5);
    elevator.smoothed = false;
    this.elevators.push(newElevator);
  }

  addChain(x, y, chains) {
    const chain = game.phaser.add.sprite(x, y, "chain");
    const newChain = new Chain(x, y, chain);
    chain.scale.setTo(1.5, 1.2);
    chain.smoothed = false;
    chains.push(newChain);
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

  addTorch(x, y) {
    const torch = game.phaser.add.sprite(x, y, "torch");
    //torch.body.immovable = true;
    torch.scale.setTo(3, 3);
    torch.smoothed = false;
    const newTorch = new Torch(x, y, torch);
    this.immovableObjects.push(newTorch);
  }

  addTorchInverted(x, y) {
    const torch = game.phaser.add.sprite(x, y, "torchInverted");
    //torch.body.immovable = true;
    torch.scale.setTo(3, 3);
    torch.smoothed = false;
    const newTorch = new Torch(x, y, torch);
    this.immovableObjects.push(newTorch);
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

  addMenuBoards(x, y) {
    const scale = 2;
    const offSetX = 100;
    var board = game.phaser.add.button(x, y, "restartBoard", () => {
      game.phaser.state.start(game.phaser.state.current);
    });
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    board = game.phaser.add.button(x + offSetX, y, "menuBoard", () => {
      //var menuInGame = new menuInGame();
      game.phaser.paused = true;
      //menuInGame.draw();
    });
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
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
    this.map.drawBound(0, game.phaser.world.height - 38, 800, bounds);
    this.map.drawBound(273, game.phaser.world.height - 402, 600, bounds);
    this.map.drawBound(0, game.phaser.world.height - 216, 430, bounds);
    this.map.drawBound(0, game.phaser.world.height - 201, 430, bounds);
    this.map.drawBound(273, game.phaser.world.height - 388, 600, bounds);
    this.map.drawBound(0, 54, 800, bounds);
    this.map.drawBound(426, 385, 15, bounds, 1);
    this.map.drawBound(272, 200, 15, bounds, 1);
    this.map.drawBound(16, 0, 600, bounds, 1);
    this.map.drawBound(game.phaser.world.width - 18, 0, 600, bounds, 1);

    var background = game.phaser.add.sprite(0, 0, "backgroundLevel");
    background.scale.setTo(0.5, 0.5);
    //game.addTorch(50, 50, this.map);

    //TOCHAS
    this.map.addTorchInverted(
      game.phaser.world.width - 75,
      game.phaser.world.height - 300,
      this.map
    );
    this.map.addTorch(-8, 100, this.map);

    //ELEVADOR
    //MAIOR INDICE MAIOR y
    for (var i = 0; i < 19; i++) {
      this.map.addChain(500, 550 - 19 * (18 - i), this.map.chains);
    }
    this.map.addElevator(
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
    this.addCollectableBoards(30, -2);

    //BOARD PARA RESTART E MENU
    this.addMenuBoards(580, -2);

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
    const posX = 400 - 60;
    const posY = -8;
    const gravity = 0;
    const scale = 3;
    const board = game.phaser.add.sprite(posX, posY, "timerBoard");
    const xCoords = [361, 381, 416, 436];
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

  toHelp() {
    game.phaser.state.start("Help");
  }

  toLevelSelector() {
    game.phaser.state.start("LevelSelector");
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
    /*this.soundEffectsVolume = game.player.soundEffectsVolume;
    this.gameMusicVolume = game.player.gameMusicVolume;
    this.menuMusicVolume = game.player.menuMusicVolume;*/
    this.SoundEffectsEmptySoundBars = [];
    this.SoundEffectsFilledSoundBars = [];
    this.GameMusicEmptySoundBars = [];
    this.GameMusicFilledSoundBars = [];
    this.MenuMusicEmptySoundBars = [];
    this.MenuMusicFilledSoundBars = [];
  }

  addButton(x, y, name, callToAction) {
    var button = game.phaser.add.button(
      x,
      y,
      name,
      callToAction,
      { this: this, x: x, y: y },
      0,
      0,
      0
    );
    button.smoothed = false;
    this.buttons.push(button);
    return button;
  }

  setVolume(sound, volume, y) {
    if (volume <= 10 && volume >= 0) {
      if (sound == this.SoundEffectsFilledSoundBars) {
        this.soundEffectsVolume = volume;
        /*game.player.soundEffectsVolume = volume;*/
      } else if (sound == this.GameMusicFilledSoundBars) {
        this.gameMusicVolume = volume;
        /*game.player.gameMusicVolume = volume;*/
      } else if (sound == this.MenuMusicFilledSoundBars) {
        this.menuMusicVolume = volume;
        /*game.player.menuMusicVolume = volume;*/
      }

      for (let i = 0; i < volume; i++) {
        if (!sound[i].alive) {
          sound[i].reset(285 + 30 * i, y);
        }
      }
      for (let i = volume; i < 10; i++) {
        if (sound[i].alive) {
          sound[i].kill();
        }
      }

      //Update db
      //TODO - mudar para o trigger do backbutton
      // game.player.docRef
      // 	.set({
      // 		name: game.player.name,
      // 		score: game.player.score,
      // 		soundEffectsVolume: 10,
      // 		gameMusicVolume: game.player.gameMusicVolume,
      // 		menuMusicVolume: game.player.menuMusicVolume,
      // 	})
      // 	.then(() => {
      // 		console.log("success");
      // 	})
      // 	.catch((err) => {
      // 		console.log("error", err);
      // 	});
    }
  }

  changeVolume() {
    var volume;
    if (this.y == 147) {
      volume = (this.x - 285) / 30 + 1;
      this.this.setVolume(this.this.SoundEffectsFilledSoundBars, volume, 147);
    } else if (this.y == 297) {
      volume = (this.x - 285) / 30 + 1;
      this.this.setVolume(this.this.GameMusicFilledSoundBars, volume, 297);
    } else if (this.y == 447) {
      volume = (this.x - 285) / 30 + 1;
      this.this.setVolume(this.this.MenuMusicFilledSoundBars, volume, 447);
    }
  }

  decreaseVolume() {
    if (this.y == 150) {
      this.this.setVolume(
        this.this.SoundEffectsFilledSoundBars,
        this.this.soundEffectsVolume - 1,
        147
      );
    } else if (this.y == 300) {
      this.this.setVolume(
        this.this.GameMusicFilledSoundBars,
        this.this.gameMusicVolume - 1,
        297
      );
    } else if (this.y == 450) {
      this.this.setVolume(
        this.this.MenuMusicFilledSoundBars,
        this.this.menuMusicVolume - 1,
        447
      );
    }
  }
  increaseVolume() {
    if (this.y == 150) {
      this.this.setVolume(
        this.this.SoundEffectsFilledSoundBars,
        this.this.soundEffectsVolume + 1,
        147
      );
    } else if (this.y == 300) {
      this.this.setVolume(
        this.this.GameMusicFilledSoundBars,
        this.this.gameMusicVolume + 1,
        297
      );
    } else if (this.y == 450) {
      this.this.setVolume(
        this.this.MenuMusicFilledSoundBars,
        this.this.menuMusicVolume + 1,
        447
      );
    }
  }

  muteVolume() {
    if (this.y == 150) {
      this.this.setVolume(this.this.SoundEffectsFilledSoundBars, 0, 147);
    } else if (this.y == 300) {
      this.this.setVolume(this.this.GameMusicFilledSoundBars, 0, 297);
    } else if (this.y == 450) {
      this.this.setVolume(this.this.MenuMusicFilledSoundBars, 0, 447);
    }
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground");
    this.addSprite(175, -100, "optionsTitle").scale.setTo(0.75, 0.75);
    this.addSprite(50, 150, "optionsSoundEffects").scale.setTo(0.6, 0.6);
    this.addSprite(65, 300, "optionsGameMusic").scale.setTo(0.6, 0.6);
    this.addSprite(65, 450, "optionsMenuMusic").scale.setTo(0.6, 0.6);
  }

  addButtons(game) {
    this.addButton(210, 150, "SoundLess", this.decreaseVolume).scale.setTo(
      1.5,
      1.5
    );
    this.addButton(210, 300, "SoundLess", this.decreaseVolume).scale.setTo(
      1.5,
      1.5
    );
    this.addButton(210, 450, "SoundLess", this.decreaseVolume).scale.setTo(
      1.5,
      1.5
    );

    this.addButton(605, 150, "SoundPlus", this.increaseVolume).scale.setTo(
      1.5,
      1.5
    );
    this.addButton(605, 300, "SoundPlus", this.increaseVolume).scale.setTo(
      1.5,
      1.5
    );
    this.addButton(605, 450, "SoundPlus", this.increaseVolume).scale.setTo(
      1.5,
      1.5
    );

    this.addButton(680, 150, "SoundOff", this.muteVolume).scale.setTo(1.5, 1.5);
    this.addButton(680, 300, "SoundOff", this.muteVolume).scale.setTo(1.5, 1.5);
    this.addButton(680, 450, "SoundOff", this.muteVolume).scale.setTo(1.5, 1.5);

    //back button nao tem de ser necessariamente de volta para o main menu
    this.addButton(50, 30, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(
        285 + 30 * i,
        147,
        "SoundBarEmpty",
        this.changeVolume
      );
      bar.scale.setTo(2.5, 2.2);
      this.SoundEffectsEmptySoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(
        285 + 30 * i,
        147,
        "SoundBarFilled",
        this.changeVolume
      );
      bar.scale.setTo(2.6, 2.2);

      this.SoundEffectsFilledSoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(
        285 + 30 * i,
        297,
        "SoundBarEmpty",
        this.changeVolume
      );
      bar.scale.setTo(2.5, 2.2);
      this.GameMusicEmptySoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(
        285 + 30 * i,
        297,
        "SoundBarFilled",
        this.changeVolume
      );
      bar.scale.setTo(2.6, 2.2);
      this.GameMusicFilledSoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(
        285 + 30 * i,
        447,
        "SoundBarEmpty",
        this.changeVolume
      );
      bar.scale.setTo(2.5, 2.2);
      this.MenuMusicEmptySoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(
        285 + 30 * i,
        447,
        "SoundBarFilled",
        this.changeVolume
      );
      bar.scale.setTo(2.6, 2.2);
      this.MenuMusicFilledSoundBars.push(bar);
    }

    this.setVolume(
      this.SoundEffectsFilledSoundBars,
      this.soundEffectsVolume,
      147
    );
    this.setVolume(this.GameMusicFilledSoundBars, this.gameMusicVolume, 297);
    this.setVolume(this.MenuMusicFilledSoundBars, this.menuMusicVolume, 447);
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
    this.addButton(330, 200, "startBtn", this.toLevelSelector).scale.setTo(
      2.8,
      2.8
    );
    this.addButton(330, 270, "optionsBtn", this.toOptions).scale.setTo(
      2.8,
      2.8
    );
    this.addButton(330, 340, "helpBtn", this.toHelp).scale.setTo(2.8, 2.8);
    this.addButton(330, 410, "rankingBtn", this.toRanking).scale.setTo(
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
    this.addButton(50, 30, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);
  }
}

class Help extends Menu {
  constructor() {
    super();
  }

  addText(game, t1, t2, t3, t4, t5, t6) {
    game.phaser.add.bitmapText(50, 200, "myfont", t1, 32);
    game.phaser.add.bitmapText(185, 300, "myfont", t2, 12);
    game.phaser.add.bitmapText(250, 300, "myfont", t3, 12);
    game.phaser.add.bitmapText(115, 460, "myfont", t4, 12);
    game.phaser.add.bitmapText(260, 460, "myfont", t5, 12);
    game.phaser.add.bitmapText(180, 460, "myfont", t6, 12);
    game.phaser.add.bitmapText(560, 300, "myfont", t2, 12);
    game.phaser.add.bitmapText(430, 300, "myfont", t3, 12);
    game.phaser.add.bitmapText(495, 460, "myfont", t4, 12);
    game.phaser.add.bitmapText(635, 460, "myfont", t5, 12);
    game.phaser.add.bitmapText(555, 460, "myfont", t6, 12);
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(-180, -50, "helpInline").scale.setTo(0.6, 0.6);
    this.addSprite(145, 350, "sKey").scale.setTo(2.5, 2.5);
    this.addSprite(145, 280, "wKey").scale.setTo(2.5, 2.5);
    this.addSprite(220, 350, "dKey").scale.setTo(2.5, 2.5);
    this.addSprite(220, 280, "eKey").scale.setTo(2.5, 2.5);
    this.addSprite(70, 350, "aKey").scale.setTo(2.5, 2.5);
    this.addSprite(520, 350, "downKey").scale.setTo(2.5, 2.5);
    this.addSprite(450, 350, "leftKey").scale.setTo(2.5, 2.5);
    this.addSprite(590, 350, "rightKey").scale.setTo(2.5, 2.5);
    this.addSprite(520, 280, "upKey").scale.setTo(2.5, 2.5);
    this.addSprite(390, 260, "rightShiftKey").scale.setTo(2.5, 2.5);
    this.addSprite(720, 400, "lilPeanutImg").scale.setTo(3, 3);
    this.addSprite(20, 350, "bigMackImg").scale.setTo(3, 3);
  }

  addButtons(game) {
    this.addButton(50, 30, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);
  }
}

class LevelSelector extends Menu {
  constructor() {
    super();
  }

  addText(game, t1) {
    t1 = game.phaser.add.bitmapText(550, 150, "myfont", t1, 24);
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(25, -160, "levelsInline").scale.setTo(0.6, 0.6);
    this.addSprite(100, 150, "pyramidLevelSelector");
  }

  addButtons(game) {
    this.addButton(50, 30, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);
    this.addButton(130, 380, "bottomleftcolor", this.toStart).scale.setTo(
      0.7,
      0.7
    );
    this.addButton(320, 380, "bottommidcolor").scale.setTo(0.7, 0.7);
    this.addButton(530, 380, "bottomrightbw").scale.setTo(0.7, 0.7);
    this.addButton(265, 285, "midleftbw").scale.setTo(0.7, 0.7);
    this.addButton(440, 285, "midrightbw").scale.setTo(0.7, 0.7);
    this.addButton(330, 185, "topbw").scale.setTo(0.7, 0.7);
  }
}

class MenuInGame extends Menu {
  constructor() {
    super();
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(25, -160, "levelsInline").scale.setTo(0.6, 0.6);
    this.addSprite(100, 150, "pyramidLevelSelector");
  }

  destroy() {
    for (var i = 0; i < this.buttons; i++) {
      console.log("aa");
    }
    for (var i = 0; i < this.sprites; i++) {
      console.log("aa");
    }
  }
}
