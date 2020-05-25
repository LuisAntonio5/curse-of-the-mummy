const debug = false;
//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
class GameEngine {
  constructor() {
    var canvasWidth = 800;
    var canvasHeight = 600;
    this.sprites = {};
    this.player = null;
    this.currentLevel = null;
    this.phaser = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, "");
    this.lilPeanut = null;
    this.bigMack = null;
    this.menuMusic = null;
    this.gameMusic = null;
    this.soundEffects = [];
  }

  dataBaseSet() {
    // This function sets the info given by data to the object in the database
    //corresponding to the game.player instance. It assumes game.player exists
    const dataToSend = {
      name: game.player.name,
      totalScore: game.player.totalScore,
      level1: game.player.level1,
      level2: game.player.level2,
      level3: game.player.level3,
      level4: game.player.level4,
      gameMusicVolume: game.player.gameMusicVolume,
      menuMusicVolume: game.player.menuMusicVolume,
      soundEffectsVolume: game.player.soundEffectsVolume,
    };
    game.player.docRef.set(dataToSend).catch((err) => {
      console.log("error", err);
    });
  }

  dataBaseGet(name, doneFunction) {
    // Given a name, this function sets game.player data do the data
    //corresponding to the name in the databse or default values should
    //that name not yet exist, creating a new object
    const defaultVolume = 5;
    const defaultScore = 0;
    const defaultCollectables = 0;
    const defaultCutScene = false;
    var docRef = db.collection("players").doc(name);

    var doc = docRef
      .get()
      .then((doc) => {
        if (doc && doc.exists) {
          //Player exists in DB
          game.player = new Player(
            name,
            doc.data().soundEffectsVolume,
            doc.data().gameMusicVolume,
            doc.data().menuMusicVolume,
            doc.data().level1,
            doc.data().level2,
            doc.data().level3,
            doc.data().level4,
            doc.data().totalScore,
            docRef
          );
          doneFunction();
        } else {
          //Player does not exist
          var levelDefault = {
            collectablesBig: defaultCollectables,
            collectablesPeanut: defaultCollectables,
            score: defaultScore,
            cutscenesCheck: defaultCutScene,
          };
          game.player = new Player(
            name,
            defaultVolume,
            defaultVolume,
            defaultVolume,
            { ...levelDefault },
            { ...levelDefault },
            { ...levelDefault },
            { ...levelDefault },
            defaultScore,
            docRef
          );
          this.dataBaseSet();
          doneFunction();
        }
      })
      .catch((err) => {
        console.log("Error getting document", err);
      });
  }

  loadAudios(files) {
    files.map((file) => {
      var audio = new Audio(file[1]);
      if (file[0] == "menuMusic") {
        game.menuMusic = audio;
      } else if (file[0] == "gameMusic") {
        game.gameMusic = audio;
      } else {
        game.soundEffects.push([file[0], audio]);
      }
    });
  }

  loadFonts() {
    this.phaser.load.bitmapFont("myfont", "assets/font/font.png", "assets/font/font.fnt");
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

  stopOtherSoundEffects(sound) {
    this.soundEffects.map((snd) => {
      if (snd[0] == "elevatorSoundEffect") {
      }
      if (sound != snd[1]) {
        snd[1].pause();
      }
    });
  }

  collisionObjects(level) {
    //AQUI SAO FEITAS TODAS AS COLISOES ENTRE OBJETOS MOVABLE E NAO MOVABLE
    const offsetX = 6;
    const offsetCaixa = 1;
    const offsetColisao = 5;
    const setVelocity = 0;
    const limitVelocity = 0;
    const clicksPerButton = 1;
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
      if (
        this.phaser.physics.arcade.collide(
          key.data,
          level.bigMack.obj,
          this.boxcollision,
          (box, bigMack) => {
            if (
              !(
                box.body.x + offsetX < bigMack.body.x + bigMack.body.width &&
                box.body.x + box.body.width > bigMack.body.x + offsetX
              )
            ) {
              box.body.moves = true;
            }
            //se a box nao tiver a tocar noutra
            for (var i = 0; i < level.map.smallBox.length; i++) {
              if (this.phaser.physics.arcade.collide(box, level.map.smallBox[i].data)) {
                if (level.map.smallBox[i].data.x < box.body.x) {
                  box.body.x += offsetCaixa;
                  bigMack.body.x += offsetColisao;
                  bigMack.body.velocity.x = setVelocity;
                } else {
                  box.body.x -= offsetCaixa;
                  bigMack.body.x -= offsetColisao;
                  bigMack.body.velocity.x = setVelocity;
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
          level.bigMack.boxAnim == false &&
          !this.checkIfOnTopPartial(level.bigMack.obj, key.data)
        ) {
          level.bigMack.boxAnim = true;
          if (level.bigMack.obj.body.velocity.x > limitVelocity)
            level.bigMack.doBoxRightAnimation();
          else {
            level.bigMack.doBoxLeftAnimation();
          }
          game.playContinuousSound(key.moveSound);
        }
      } else {
        level.bigMack.boxAnim = false;
        game.stopContinuousSound(key.moveSound);
      }
      //BIG BOX COM ELEVADOR
      for (var i = 0; i < level.map.elevators.length; i++) {
        this.phaser.physics.arcade.collide(key.data, level.map.elevators[i].data);
      }
    });

    //SMALL BOXES COM ELEVVADORES E CHARACTERS
    level.map.smallBox.map((key) => {
      key.data.body.velocity.x = setVelocity;
      //SMALL BOX COM BIGMACK
      this.phaser.physics.arcade.collide(
        key.data,
        level.bigMack.obj,
        this.boxcollision,
        (box, bigMack) => {
          if (this.checkIfOnTopPartial(bigMack, box)) {
            return true;
          }
          this.playSingleSound(key.breakSound);
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
              if (this.phaser.physics.arcade.collide(box, level.map.bigBox[i].data)) {
                if (level.map.bigBox[i].data.x < box.body.x) {
                  box.body.x += offsetCaixa;
                  lilPeanut.body.x += offsetColisao;
                  lilPeanut.body.velocity.x = setVelocity;
                } else {
                  box.body.x -= offsetCaixa;
                  lilPeanut.body.x -= offsetColisao;
                  lilPeanut.body.velocity.x = setVelocity;
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
          if (level.lilPeanut.obj.body.velocity.x > limitVelocity)
            level.lilPeanut.doBoxRightAnimation();
          else {
            level.lilPeanut.doBoxLeftAnimation();
          }
        }
      } else {
        level.lilPeanut.boxAnim = false;
      }
      //SMALL BOX COM ELEVADOR
      for (var i = 0; i < level.map.elevators.length; i++) {
        this.phaser.physics.arcade.collide(key.data, level.map.elevators[i].data);
      }
    });
    //LILPENAUT E BIGMACK COM ELEVADORES
    for (var i = 0; i < level.map.elevators.length; i++) {
      this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.elevators[i].data);
      this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.elevators[i].data);
    }

    //LILPENAUT E BIGMACK COM PLATAFORMAS MÓVEIS
    for (var i = 0; i < level.map.platforms.length; i++) {
      this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.platforms[i].data);
      this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.platforms[i].data);
    }

    //LILPENAUT E BIGMACK COM SLIDING DOORS
    for (var i = 0; i < level.map.slidingDoors.length; i++) {
      this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.slidingDoors[i].data);
      this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.slidingDoors[i].data);
    }

    //LILPEANUT E BIGMACK COM BOTOES
    const objPressed = {};
    for (var i = 0; i < level.map.buttons.length; i++) {
      this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.buttons[i].data);
      this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.buttons[i].data);
      if (
        this.checkIfOnTopPartial(level.lilPeanut.obj, level.map.buttons[i].data) ||
        this.checkIfOnTopPartial(level.bigMack.obj, level.map.buttons[i].data)
      ) {
        if (!objPressed[level.map.buttons[i].actionObj]) {
          level.map.buttons[i].buttonPressed();
          objPressed[level.map.buttons[i].actionObj] = clicksPerButton;
        } else {
          level.map.buttons[i].buttonPressed();
          objPressed[level.map.buttons[i].actionObj] += clicksPerButton;
        }
      } else {
        if (!objPressed[level.map.buttons[i].actionObj]) {
          level.map.buttons[i].buttonUnpressed();
        }
      }
    }

    //LILPEANUT E BIGMACK COM SERRA
    for (var i = 0; i < level.map.eletricSaw.length; i++) {
      if (this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.eletricSaw[i].data)) {
        this.playSingleSound(level.map.eletricSaw[i].sound);
        this.stopOtherSoundEffects(level.map.eletricSaw[i].sound);
        this.gameover(level, "lilpeanut");
      }

      if (this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.eletricSaw[i].data)) {
        this.playSingleSound(level.map.eletricSaw[i].sound);
        this.stopOtherSoundEffects(level.map.eletricSaw[i].sound);
        this.gameover(level, "bigmack");
      }
    }

    //LILPEANUT E BIGMACK COM LAVA
    for (var i = 0; i < level.map.lavaBlocks.length; i++) {
      if (this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.lavaBlocks[i].data)) {
        if (
          this.checkIfOnTopPartial(level.lilPeanut.obj, level.map.lavaBlocks[i].data) ||
          this.checkIfOnTopPartial(level.bigMack.obj, level.map.lavaBlocks[i].data)
        ) {
          this.playSingleSound(level.map.lavaBlocks[i].sound);
          this.stopOtherSoundEffects(level.map.lavaBlocks[i].sound);
          this.gameover(level, "lilpeanut");
        }
      }
      if (this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.lavaBlocks[i].data)) {
        if (this.checkIfOnTopPartial(level.bigMack.obj, level.map.lavaBlocks[i].data)) {
          this.playSingleSound(level.map.lavaBlocks[i].sound);
          this.stopOtherSoundEffects(level.map.lavaBlocks[i].sound);
          this.gameover(level, "bigmack");
        }
      }
    }

    //LILPEANUT E BIGMACK COM SPIKES
    for (var i = 0; i < level.map.spikes.length; i++) {
      if (this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.spikes[i].data)) {
        this.gameover(level, "lilpeanut");
        this.playSingleSound(level.map.spikes[i].sound);
        this.stopOtherSoundEffects(level.map.spikes[i].sound);
      }
      if (this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.spikes[i].data)) {
        this.gameover(level, "bigmack");
        this.playSingleSound(level.map.spikes[i].sound);
        this.stopOtherSoundEffects(level.map.spikes[i].sound);
      }
    }

    //BOXES COM BOTOES
    for (var i = 0; i < level.map.buttons.length; i++) {
      for (var k = 0; k < level.map.smallBox.length; k++) {
        this.phaser.physics.arcade.collide(level.map.smallBox[k].data, level.map.buttons[i].data);
      }
      for (var k = 0; k < level.map.bigBox.length; k++) {
        this.phaser.physics.arcade.collide(level.map.bigBox[k].data, level.map.buttons[i].data);
      }
    }
  }

  collisionWithBounds(level) {
    level.map.bigBox.map((key) => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    level.map.smallBox.map((key) => {
      this.phaser.physics.arcade.collide(key.data, level.bounds);
    });
    this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.bounds);
    this.phaser.physics.arcade.collide(level.bigMack.obj, level.bounds);
  }

  checkIfOnTopTotal(obj1, obj2) {
    //VERIFICA SE O OBJ1 esta em CIMA DO OBJ2
    const offset = 5;
    if (
      Math.round(obj1.body.x) >= Math.round(obj2.body.x) &&
      Math.round(obj1.body.x) + Math.round(obj1.body.width) <=
        Math.round(obj2.body.x) + Math.round(obj2.body.width) &&
      Math.abs(Math.round(obj1.body.y) + Math.round(obj1.body.height) - Math.round(obj2.body.y)) <=
        offset
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIfOnTopPartial(obj1, obj2) {
    const offset = 5;
    if (
      Math.round(obj1.body.x) + Math.round(obj1.body.width) >= Math.round(obj2.body.x) &&
      Math.round(obj1.body.x) <= Math.round(obj2.body.x) + Math.round(obj2.body.width) &&
      Math.abs(Math.round(obj1.body.y) + Math.round(obj1.body.height) - Math.round(obj2.body.y)) <=
        offset
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkElevatorStatus(level) {
    const numMaxChars = 2;
    const setVelocity = 0;
    level.map.elevators.map((key) => {
      if (key.num == numMaxChars) {
        //CHECKA 2 colisoes para subir
        if (
          this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
          this.checkIfOnTopTotal(level.bigMack.obj, key.data) &&
          key.data.body.y >= key.y
        ) {
          key.elevatorUp(key, level.map.chains);
          if (key.data.body.moves == true) {
            this.playContinuousSound(key.sound);
          }
        } else {
          if (
            key.data.body.y <= key.minY &&
            !this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
            !this.checkIfOnTopTotal(level.bigMack.obj, key.data)
          ) {
            key.elevatorDown(key, level.map.chains);
            if (key.data.body.moves == true) {
              this.playContinuousSound(key.sound);
            }
          } else {
            key.data.body.velocity.y = setVelocity;
            this.stopContinuousSound(key.sound);
          }
        }
      } else {
        //CHEGA UMA COLISAO EM CIMA PARA SUBIR
        if (
          (this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) ||
            this.checkIfOnTopTotal(level.bigMack.obj, key.data)) &&
          key.data.body.y >= key.y
        ) {
          key.elevatorUp(key, level.map.chains);
          if (key.data.body.moves == true) {
            this.playContinuousSound(key.sound);
          }
        } else {
          if (
            key.data.body.y <= key.minY &&
            !this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
            !this.checkIfOnTopTotal(level.bigMack.obj, key.data)
          ) {
            key.elevatorDown(key, level.map.chains);
            if (key.data.body.moves == true) {
              this.playContinuousSound(key.sound);
            }
          } else {
            key.data.body.velocity.y = setVelocity;
            this.stopContinuousSound(key.sound);
          }
        }
      }
    });
  }

  levelCompletedMenu(sprite, animation) {
    var levelCompletedMenu = new LevelCompletedMenu();
    const levelStr = "level" + game.currentLevel.levelID.toString();
    const pointsPerCollectable = 1000;
    const timeDivider = 5;
    const minimumPoints = 350;
    let score = Math.round(
      ((game.currentLevel.nBigMackCollected + game.currentLevel.nLilPeanutCollected) *
        pointsPerCollectable) /
        (game.currentLevel.timer.finalTime / timeDivider) +
        minimumPoints
    );
    var minutes = String(Math.floor(game.currentLevel.timer.finalTime / 60));
    var seconds = String(game.currentLevel.timer.finalTime % 60);
    var timeToShow = { minutes, seconds };

    //PARA OBJETOS
    game.currentLevel.map.eletricSaw.map((key) => {
      key.data.body.moves = false;
    });
    levelCompletedMenu.addSprites();
    levelCompletedMenu.addButtons();
    if (score > game.player[levelStr].score) {
      levelCompletedMenu.addTexts(score, timeToShow, true);
      game.player.totalScore -= game.player[levelStr].score;
      game.player[levelStr].score = score;
      game.player[levelStr].nLilPeanutCollected = game.currentLevel.nLilPeanutCollected;
      game.player[levelStr].nBigMackCollected = game.currentLevel.nBigMackCollected;
      game.player.totalScore += score;
      game.dataBaseSet();
    } else {
      levelCompletedMenu.addTexts(score, timeToShow, false);
    }
  }

  gameOverMenu(sprite, animation) {
    var gameovermenu = new GameOverMenu();
    gameovermenu.addSprites(game);
    gameovermenu.addButtons(game);
    sprite.animations.play("gameoverMenu");
  }

  checkPlatformStatus(level) {
    const maxChars = 2;
    const setVelocity = 0;
    const initialFrame = 0;
    level.map.platforms.map((key) => {
      if (key.num == maxChars) {
        //CHECKA 2 colisoes para subir
        if (
          this.checkIfOnTopPartial(level.lilPeanut.obj, key.data) &&
          this.checkIfOnTopPartial(level.bigMack.obj, key.data)
        ) {
          key.platformDown(key, level.map.chains);
        } else {
          if (key.data.body.y >= key.minY) {
            key.platformUp(key, level.map.chains);
          } else {
            key.data.body.velocity.y = setVelocity;
          }
        }
      } else {
        //APENAS BIG MACK
        if (this.checkIfOnTopPartial(level.bigMack.obj, key.data)) {
          key.platformDown(key, level.map.chains);
          key.press();
        } else {
          if (key.data.body.y >= key.minY) {
            key.platformUp(key, level.map.chains);
          } else {
            key.data.body.velocity.y = setVelocity;
          }
          level.map.buttons.map((button) => {
            if (
              button.actionObj.constructor.name == "PlataformaMovel" &&
              button.data.frame === initialFrame
            ) {
              key.unpress();
            }
          });
        }
      }
    });
  }

  checkLevers(level) {
    const initialFrame = 0;
    level.map.levers.map((key) => {
      if (key.data.frame == initialFrame) {
        key.actionObj.down(key.actionObj, key.actionObj.chains);
      } else {
        key.actionObj.up(key.actionObj, key.actionObj.chains);
      }
    });
  }

  loadUpdate() {
    let keySPACE = game.phaser.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    keySPACE.onDown.add(() => {
      game.phaser.state.start("NameInput");
    }, this);
  }

  levelUpdate(level) {
    const setVelocity = 0;
    const bigMackSizeX = 16;
    const bigMackSizeY = 45;
    const bigMackOffsetX = 24;
    const bigMackOffsetY = 10;
    const lilPeanutSizeX = 11;
    const lilPeanutSizeY = 28;
    const lilPeanutOffsetX = 10;
    const lilPeanutOffsetY = 3;
    const difLil = 7;
    const difBig = 16;
    const initialFrame = 0;
    const finalFrame = 1;
    const offsetXLilCompleted = 30;
    const offsetXBigCompleted = 60;
    const bigMackDoorX =
      level.map.bigMackDoor.data.x + level.map.bigMackDoor.data.width / 2 - offsetXBigCompleted;
    const bigMackDoorY =
      level.map.bigMackDoor.data.y +
      level.map.bigMackDoor.data.height -
      level.bigMack.obj.body.height;
    const lilPeanutDoorX =
      level.map.lilPeanutDoor.data.x + level.map.lilPeanutDoor.data.width / 2 - offsetXLilCompleted;
    const lilPeanutDoorY =
      level.map.lilPeanutDoor.data.y +
      level.map.lilPeanutDoor.data.height -
      level.lilPeanut.obj.body.height;
    const offsetDoorLil = 20;
    const offsetDoorBig = 48;
    const limitLil = lilPeanutDoorX + offsetDoorLil;
    const limitBig = Math.round(bigMackDoorX) + offsetDoorBig;

    let flagCrouch = true;
    if (!level.animation) {
      //ANIMA OS OBJECTOS TODOS
      this.animateAllObjects(level);
      //COLISOES
      this.collisionObjects(level);
      this.collisionWithBounds(level);

      //CHECK NOS ELEVADORES
      this.checkElevatorStatus(level);
      this.checkPlatformStatus(level);

      if (!level.animation) {
        if (!level.cutscene) {
          //LILPEANUT
          level.lilPeanut.obj.body.velocity.x = setVelocity;
          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
            level.lilPeanut.doWalkRightAnimation();
          } else if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
            level.lilPeanut.doWalkLeftAnimation();
          } else {
            level.lilPeanut.restAnimation();
          }

          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
            level.lilPeanut.obj.body.setSize(
              lilPeanutSizeX,
              lilPeanutSizeY - difLil,
              lilPeanutOffsetX,
              lilPeanutOffsetY + difLil
            );
            level.lilPeanut.crouch = true;
          } else {
            const pointsToCheck = [
              { x: level.lilPeanut.obj.body.x, y: level.lilPeanut.obj.body.y - difLil },
              {
                x: level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width,
                y: level.lilPeanut.obj.body.y - difLil,
              },
              {
                x: level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width / 2,
                y: level.lilPeanut.obj.body.y - difLil,
              },
            ];
            for (let i = 0; i < level.map.slidingDoors.length; i++) {
              pointsToCheck.map((key) => {
                if (level.map.slidingDoors[i].data.getBounds().contains(key.x, key.y)) {
                  flagCrouch = false;
                }
              });
            }
            if (flagCrouch === true) {
              level.lilPeanut.obj.body.setSize(
                lilPeanutSizeX,
                lilPeanutSizeY,
                lilPeanutOffsetX,
                lilPeanutOffsetY
              );
              level.lilPeanut.crouch = false;
            }
          }
          //  Allow the player to jump if they are touching the ground.
          if (
            this.phaser.input.keyboard.isDown(Phaser.KeyCode.UP) &&
            level.lilPeanut.obj.body.touching.down
          ) {
            level.lilPeanut.jump();
          }

          //BIGMACK
          level.bigMack.obj.body.velocity.x = setVelocity;
          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.D)) {
            level.bigMack.doWalkRightAnimation();
          } else if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.A)) {
            level.bigMack.doWalkLeftAnimation();
          } else {
            level.bigMack.restAnimation();
          }

          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.S)) {
            level.bigMack.obj.body.setSize(
              bigMackSizeX,
              bigMackSizeY - difBig,
              bigMackOffsetX,
              bigMackOffsetY + difBig
            );
            level.bigMack.crouch = true;
          } else {
            let flagCrouch = true;
            const pointsToCheck = [
              { x: level.bigMack.obj.body.x, y: level.bigMack.obj.body.y - difBig },
              {
                x: level.bigMack.obj.body.x + level.bigMack.obj.body.width,
                y: level.bigMack.obj.body.y - difBig,
              },
              {
                x: level.bigMack.obj.body.x + level.bigMack.obj.body.width / 2,
                y: level.bigMack.obj.body.y - difBig,
              },
            ];
            for (let i = 0; i < level.map.slidingDoors.length; i++) {
              pointsToCheck.map((key) => {
                if (level.map.slidingDoors[i].data.getBounds().contains(key.x, key.y)) {
                  flagCrouch = false;
                }
              });
            }
            if (flagCrouch === true) {
              level.bigMack.obj.body.setSize(
                bigMackSizeX,
                bigMackSizeY,
                bigMackOffsetX,
                bigMackOffsetY
              );
              level.bigMack.crouch = false;
            }
          }

          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.E)) {
            //CHECK SE HA OVERLAP COM ALGUMA LEVER
            level.map.levers.map((key) => {
              this.phaser.physics.arcade.overlap(
                level.bigMack.obj,
                key.data,
                (player, lever) => {
                  //SE EXISTIR OVERLAP
                  if (key.data.frame == initialFrame) {
                    key.data.frame = finalFrame;
                    //SET TIMER
                    this.playSingleSound(key.sound);
                    setTimeout(key.resetLever, key.timeToReset);
                  }
                },
                null,
                this
              );
            });
          }

          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
            //CHECK SE HA OVERLAP COM ALGUMA LEVER
            level.map.levers.map((key) => {
              this.phaser.physics.arcade.overlap(
                level.lilPeanut.obj,
                key.data,
                (player, lever) => {
                  //SE EXISTIR OVERLAP
                  if (key.data.frame == initialFrame) {
                    key.data.frame = finalFrame;
                    //SET TIMER
                    this.playSingleSound(key.sound);
                    setTimeout(key.resetLever, key.timeToReset);
                  }
                },
                null,
                this
              );
            });
          }
          //  Allow the player to jump if they are touching the ground.
          if (
            this.phaser.input.keyboard.isDown(Phaser.KeyCode.W) &&
            level.bigMack.obj.body.touching.down
          ) {
            level.bigMack.jump();
          }
        } else {
          //HANDLE DE CUTSCENES
          level.cutscene.handleCutscene(level);
        }

        //VERIFICA FIM DO JOGO
        //CASO OS DOIS ESTEJAM CADA UM NA SUA PORTA
        if (level.checkCompleted()) {
          level.animation = "COMPLETED";
          level.timer.stopTimer();
        }

        //TIMER UPDATE
        level.timer.updateTimer();

        //CHECKA ALAVANCAS
        this.checkLevers(level);

        //CHECKA OVERLAP NOS OBJETOS QUE AINDA FORAM APANHADOS
        this.checkCollected(level);
      }
    } else if (level.animation === "COMPLETED") {
      level.bigMack.endAnimation(level, bigMackDoorX, bigMackDoorY);
      level.lilPeanut.endAnimation(level, lilPeanutDoorX, lilPeanutDoorY);

      if (
        Math.round(level.bigMack.obj.body.x) == limitBig &&
        Math.round(level.lilPeanut.obj.body.x) == limitLil
      ) {
        level.bigMack.doTurnAnimation();
        level.lilPeanut.doTurnAnimation();

        level.animation = "end";
      }

      //TIMER UPDATE
      level.timer.updateTimer();
    }
    this.collisionWithBounds(level);
    //ANIMA OS OBJECTOS TODOS
    this.animateAllObjects(level);
    level.map.eletricSaw.map((key) => {
      key.moveSaw();
    });

    if (debug) {
      this.currentLevel.debug();
    }
  }

  gameover(level, sprite) {
    level.animation = "GAMEOVER";
    const xLil = 80;
    const yLil = 240;
    const xBig = 35;
    const yBig = 170;
    const scaleLil = 5;
    const scaleBig = 4;
    const setGravity = 0;
    //APAGAR OS MENUS DAS BOARDS
    level.menuBoards.map((key) => {
      key.kill();
      key.destroy();
    });
    if (sprite == "lilpeanut") {
      level.stop("lilpeanut");
      level.lilPeanut.obj.body.gravity.y = setGravity;
      level.lilPeanut.obj.moves = false;
      level.lilPeanut.obj.x = xLil;
      level.lilPeanut.obj.y = yLil;
      level.lilPeanut.obj.scale.setTo(scaleLil, scaleLil);
      level.lilPeanut.obj.fixedToCamera = true;
      level.lilPeanut.obj.play("gameover");
      level.bigMack.obj.animations.stop();
      level.bigMack.obj.kill();
    } else {
      level.stop("bigmack");
      level.bigMack.obj.body.gravity.y = setGravity;
      level.bigMack.obj.moves = false;
      level.bigMack.obj.x = xBig;
      level.bigMack.obj.y = yBig;
      level.bigMack.obj.scale.setTo(scaleBig, scaleBig);
      level.bigMack.obj.fixedToCamera = true;
      level.bigMack.obj.play("gameover");
      level.lilPeanut.obj.animations.stop();
      level.lilPeanut.obj.kill();
    }
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
            game.playSingleSound(level.map.collectables[i].sound);
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
            game.playSingleSound(level.map.collectables[i].sound);
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

  playSingleSound(sound) {
    const divideSound = 10;
    sound.volume = this.player.soundEffectsVolume / divideSound;
    sound.load(); //restarts sound
    sound.play();
  }

  playContinuousSound(sound) {
    const divideSound = 10;
    if (sound.paused) {
      sound.volume = this.player.soundEffectsVolume / divideSound;
      sound.load(); //restarts sound
      sound.loop = true;
      sound.play();
    }
  }

  stopContinuousSound(sound) {
    sound.pause();
  }
}

class MapLevel {
  constructor() {
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
    this.platformsSprite = null;
    this.background = null;
    this.platforms = [];
    this.slidingDoors = [];
    this.lavaBlocks = [];
    this.spikes = [];
    this.levers = [];
  }

  addSpriteMap(x, y, scaleX, scaleY, spriteName) {
    const newObj = game.phaser.add.sprite(x, y, spriteName);
    newObj.scale.setTo(scaleX, scaleY);
    newObj.smoothed = false;
    return newObj;
  }

  addPhysicsToSprite(obj, gravity) {
    game.phaser.physics.arcade.enable(obj);
    obj.body.gravity.y = gravity;
    obj.enableBody = true;
  }

  addElevator(x, y, num, maxX, minY) {
    const scaleX = 10;
    const scaleY = 2.5;
    const gravity = 0;
    const elevator = this.addSpriteMap(x, y, scaleX, scaleY, "elevator");
    this.addPhysicsToSprite(elevator, gravity);
    elevator.body.immovable = true;
    const newElevator = new Elevator(x, y, elevator, num, maxX, minY);
    this.elevators.push(newElevator);
  }

  addChain(x, y, chains, visible) {
    const scaleX = 1.5;
    const scaleY = 1.2;
    const chain = this.addSpriteMap(x, y, scaleX, scaleY, "chain");
    chain.visible = visible;
    const newChain = new Chain(x, y, chain);
    chains.push(newChain);
  }

  addBigBox(x, y) {
    const gravity = 600;
    const scale = 3.5;
    const box = this.addSpriteMap(x, y, scale, scale, "bigBox");
    this.addPhysicsToSprite(box, gravity);
    box.body.immovable = false;
    const newBox = new BigBox(x, y, box);
    this.bigBox.push(newBox);
  }

  addLava(x, y) {
    const scaleX = 4;
    const scaleY = 2.38;
    const gravity = 0;
    const offsetX = 6;
    const mutlForScaleX = 8;
    const mutlForScaleY = 3;
    const offsetBodyLavaX = 3;
    const offsetBodyLavaY = 15;
    const newLava = this.addSpriteMap(x, y, scaleX, scaleY, "lava");
    this.addPhysicsToSprite(newLava, gravity);
    newLava.body.moves = false;
    newLava.body.setSize(
      mutlForScaleX * scaleX - offsetX,
      mutlForScaleY * scaleY,
      offsetBodyLavaX,
      offsetBodyLavaY
    );
    const newLavaObj = new Lava(x, y, newLava);
    this.lavaBlocks.push(newLavaObj);
  }

  addSpike(x, y) {
    const scaleX = 2;
    const scaleY = 3.5;
    const gravity = 0;
    const sizeX = 25;
    const sizeY = 14;
    const offsetX = 2;
    const offsetY = 6;
    const newSpike = this.addSpriteMap(x, y, scaleX, scaleY, "spikes");
    this.addPhysicsToSprite(newSpike, gravity);
    newSpike.body.moves = false;
    newSpike.body.setSize(sizeX, sizeY, offsetX, offsetY);
    const newSpikeObj = new Spike(x, y, newSpike);
    this.spikes.push(newSpikeObj);
  }

  addLever(x, y, timeToReset, actionObjIndex) {
    const scaleX = 3;
    const scaleY = 3;
    const gravity = 0;
    const sizeX = 9;
    const sizeY = 19;
    const offsetX = 12;
    const offsetY = 4;
    const newLever = this.addSpriteMap(x, y, scaleX, scaleY, "lever");
    this.addPhysicsToSprite(newLever, gravity);
    newLever.body.moves = false;
    newLever.body.setSize(sizeX, sizeY, offsetX, offsetY);
    const newLeverObj = new Lever(x, y, newLever, timeToReset, actionObjIndex);
    this.levers.push(newLeverObj);
  }

  addSmallBox(x, y) {
    const gravity = 600;
    const scale = 2;
    const box = this.addSpriteMap(x, y, scale, scale, "smallBox");
    this.addPhysicsToSprite(box, gravity);
    box.body.immovable = false;
    const newBox = new SmallBox(x, y, box);
    this.smallBox.push(newBox);
  }

  addLilDoor(x, y) {
    const gravity = 0;
    const scale = 2;
    const door = this.addSpriteMap(x, y, scale, scale, "portaLil");
    this.addPhysicsToSprite(door, gravity);
    door.body.immovable = false;
    const newDoor = new LilDoor(x, y, door);
    this.lilPeanutDoor = newDoor;
  }

  addBigDoor(x, y) {
    const gravity = 0;
    const scale = 3.5;
    const door = this.addSpriteMap(x, y, scale, scale, "portaBig");
    this.addPhysicsToSprite(door, gravity);
    door.body.immovable = false;
    const newDoor = new BigDoor(x, y, door);
    this.bigMackDoor = newDoor;
  }

  addEletricSaw(x, y, maxX, maxY, velocity) {
    const gravity = 0;
    const scale = 3.5;
    const radiusBody = 10;
    const offsetX = 5;
    const offsetY = 5;
    const eletricSaw = this.addSpriteMap(x, y, scale, scale, "eletricSaw");
    this.addPhysicsToSprite(eletricSaw, gravity);
    eletricSaw.body.immovable = true;
    const newEletricSaw = new EletricSaw(x + offsetX, y, eletricSaw, maxX, maxY, velocity);
    eletricSaw.body.setCircle(radiusBody, offsetX, offsetY);
    this.eletricSaw.push(newEletricSaw);
  }

  addButton(x, y, actionObj) {
    const gravity = 50;
    const scale = 3;
    const button = this.addSpriteMap(x, y, scale, scale, "button");
    const initialFrame = 1;
    const bodyX = 6;
    const bodyY = 3;
    const offsetBodyX = 13;
    const offsetBodyY = 14;
    this.addPhysicsToSprite(button, gravity);
    button.body.immovable = true;
    button.body.moves = false;
    button.body.setSize(bodyX, bodyY, offsetBodyX, offsetBodyY);
    const newButton = new Button(x, y, button, actionObj);
    button.frame = initialFrame;
    this.buttons.push(newButton);
  }

  addCollectableLilPeanut(x, y) {
    const gravity = 0;
    const scale = 3.5;
    const target = "lilpeanut";
    const collectable = this.addSpriteMap(x, y, scale, scale, "collectableLilPeanut");
    this.addPhysicsToSprite(collectable, gravity);
    collectable.body.immovable = false;
    const newCollectable = new Collectable(x, y, collectable, target);
    this.collectables.push(newCollectable);
  }

  addCollectableBigMack(x, y) {
    const gravity = 0;
    const scale = 3.5;
    const target = "bigmack";
    const collectable = this.addSpriteMap(x, y, scale, scale, "collectableBigMack");
    this.addPhysicsToSprite(collectable, gravity);
    collectable.body.immovable = false;
    const newCollectable = new Collectable(x, y, collectable, target);
    this.collectables.push(newCollectable);
  }

  addTorch(x, y) {
    const scale = 3;
    const torch = this.addSpriteMap(x, y, scale, scale, "torch");
    const newTorch = new Torch(x, y, torch);
    this.immovableObjects.push(newTorch);
  }

  addTorchInverted(x, y) {
    const scale = 3;
    const torch = this.addSpriteMap(x, y, scale, scale, "torchInverted");
    const newTorch = new Torch(x, y, torch);
    this.immovableObjects.push(newTorch);
  }

  drawBound(x, y, width, group, vertical) {
    if (vertical) {
      var platform = group.create(x, y, "boundsVertical");
      platform.height = width;
      platform.body.immovable = true;
    } else {
      var platform = group.create(x, y, "boundsHorizontal");
      platform.width = width;
      platform.body.immovable = true;
    }
  }

  addEletricSawVertical(x, y, maxX, maxY, velocity) {
    const gravity = 0;
    const scale = 3.5;
    const eletricSaw = this.addSpriteMap(x, y, scale, scale, "eletricSaw");
    const offsetX = 5;
    const radiusBody = 10;
    this.addPhysicsToSprite(eletricSaw, gravity);
    eletricSaw.body.immovable = true;
    const newEletricSaw = new EletricSawVertical(x + offsetX, y, eletricSaw, maxX, maxY, velocity);
    eletricSaw.body.setCircle(radiusBody, offsetX, offsetX);
    this.eletricSaw.push(newEletricSaw);
  }

  addPlataformaMovel(x, y, num, maxX, minY, actionObj) {
    const scaleX = 5;
    const scaleY = 2.5;
    const gravity = 0;
    const platform = this.addSpriteMap(x, y, scaleX, scaleY, "elevator");
    this.addPhysicsToSprite(platform, gravity);
    platform.body.immovable = true;
    const newElevator = new PlataformaMovel(x, y, platform, num, maxX, minY, actionObj);
    this.platforms.push(newElevator);
  }

  addSlidingDoor(x, y, maxX, maxY, sizeX, sizeY, velocidade, inverted, chains) {
    const gravity = 0;
    let slidingDoor = null;
    if (y == maxY) {
      slidingDoor = this.addSpriteMap(x, y, sizeX, sizeY, "slidingDoorHorizontal");
    } else {
      slidingDoor = this.addSpriteMap(x, y, sizeX, sizeY, "slidingDoor");
    }
    this.addPhysicsToSprite(slidingDoor, gravity);
    slidingDoor.body.immovable = true;
    const newElevator = new SlidingDoor(
      x,
      y,
      slidingDoor,
      maxX,
      maxY,
      velocidade,
      inverted,
      chains
    );
    this.slidingDoors.push(newElevator);
  }
}

class Level {
  constructor(numCut, numHelpers, coordsHelpers, idLevel) {
    const levelStr = "level" + idLevel.toString();
    this.map = new MapLevel();
    this.bigMack = null;
    this.lilPeanut = null;
    this.bounds = null;
    this.timer = new Timer();
    this.nLilPeanutCollected = 0;
    this.nBigMackCollected = 0;
    this.menuBoards = [];
    this.doorChains = [];
    this.cutscene = null;
    this.levelID = idLevel;
    game.currentLevel = this;
    if (numHelpers + numCut != 0 && !game.player[levelStr].cutscenesCheck)
      this.cutscene = new Cutscene(numCut, numHelpers, coordsHelpers);
  }

  addGrayFilter(lista) {
    var gray = game.phaser.add.filter("Gray");
    if (Array.isArray(this.map[lista])) {
      this.map[lista].map((key) => {
        if (key.data.body) {
          key.data.body.moves = false;
        }
        key.data.filters = [gray];
      });
    } else {
      if (lista === "lilPeanutDoor" || lista === "bigMackDoor") {
        this.map[lista].data.filters = [gray];
      } else {
        this.map[lista].filters = [gray];
      }
    }
  }

  stop(sprite) {
    var gray = game.phaser.add.filter("Gray");
    this.addGrayFilter("elevators");
    this.addGrayFilter("smallBox");
    this.addGrayFilter("bigBox");
    this.addGrayFilter("eletricSaw");
    this.addGrayFilter("collectables");
    this.addGrayFilter("buttons");
    this.addGrayFilter("immovableObjects");
    this.addGrayFilter("platformsSprite");
    this.addGrayFilter("background");
    this.addGrayFilter("lilPeanutDoor");
    this.addGrayFilter("bigMackDoor");
    this.addGrayFilter("platforms");
    this.addGrayFilter("slidingDoors");
    this.addGrayFilter("lavaBlocks");
    if (sprite === "lilpeanut") {
      this.bigMack.obj.filters = [gray];
    } else {
      this.lilPeanut.obj.filters = [gray];
    }
    this.bigMack.obj.body.moves = false;
    this.lilPeanut.obj.body.moves = false;
  }

  addCollectableBoards(x, y) {
    const scale = 2;
    const offSetX = 100;
    let board = this.map.addSpriteMap(x, y, scale, scale, "collectableBigMackBoard");
    board.fixedToCamera = true;
    board = this.map.addSpriteMap(x + offSetX, y, scale, scale, "collectableLilPeanutBoard");
    board.fixedToCamera = true;
  }

  addMenuBoards(x, y) {
    const scale = 2;
    const offSetX = 100;
    var date = new Date();
    var board = game.phaser.add.button(x, y, "restartBoard", () => {
      game.phaser.state.start(game.phaser.state.current);
    });
    this.menuBoards.push(board);
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    board = game.phaser.add.button(x + offSetX, y, "menuBoard", () => {
      if (game.phaser.paused == true) {
        game.pauseMenu.hideContent(game);
        game.phaser.paused = false;
        game.currentLevel.timer.startTime = date.getTime();
      } else {
        game.phaser.paused = true;
        game.pauseMenu.showContent(game);
        var currentTime = date.getTime();
        this.timer.timerAux += Math.round((currentTime - this.timer.startTime) / 1000);
      }
    });
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    this.menuBoards.push(board);
  }

  checkCompleted() {
    let lilPeanutCheck = false;
    let bigMackCheck = false;
    if (game.phaser.physics.arcade.overlap(this.lilPeanut.obj, this.map.lilPeanutDoor.data)) {
      lilPeanutCheck = true;
    }
    if (game.phaser.physics.arcade.overlap(this.bigMack.obj, this.map.bigMackDoor.data)) {
      bigMackCheck = true;
    }
    if (lilPeanutCheck && bigMackCheck) {
      return true;
    }
    return false;
  }

  initializeCharacters(game, xBigMack, yBigMack, xLil, yLil, side) {
    var lilPeanutObj = game.placeCharacter(xLil, yLil, "lilPeanut");
    this.lilPeanut = new lilPeanut(lilPeanutObj, side);
    var bigMackObj = game.placeCharacter(xBigMack, yBigMack, "bigMack");
    this.bigMack = new bigMack(bigMackObj, side);
  }

  debug() {
    game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    //game.phaser.debug.body(this.map.elevators[0].data, "rgba(0, 255, 0, 0.5)");
    //game.phaser.debug.body(this.map.smallBox[0].data, "rgba(255, 255, 0, 0.1)");
    // game.phaser.debug.body(this.map.bigBox[0].data, "rgba(255, 255, 0, 0.1)");
    // game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    game.phaser.debug.body(this.bigMack.obj, "rgba(255, 255, 0, 0.6)");
    // game.phaser.debug.body(this.map.buttons[0].data, "rgba(255, 255, 0, 0.6)");
    // game.phaser.debug.body(this.map.eletricSaw[0].data, "rgba(255, 255, 0, 0.6)");
    //game.phaser.debug.body(this.map.lavaBlocks[0].data, "rgba(255, 255, 0, 0.6)");
    //game.phaser.debug.body(this.map.spikes[0].data, "rgba(255, 255, 0, 0.6)");
    //game.phaser.debug.body(this.map.levers[0].data, "rgba(255, 255, 0, 0.6)");
    //game.phaser.debug.body(this.map.slidingDoors[0].data, "rgba(255, 255, 0, 0.6)");
    //game.phaser.debug.body(this.map.slidingDoors[1].data, "rgba(255, 255, 0, 0.6)");
  }

  drawMap(game, levelData) {
    var bounds = game.phaser.add.group();
    var pauseMenu = new PauseMenu();
    game.pauseMenu = pauseMenu;

    bounds.enableBody = true;
    levelData.bounds.map((bound_coords) => {
      this.map.drawBound(
        bound_coords[0],
        bound_coords[1],
        bound_coords[2],
        bounds,
        bound_coords[3]
      );
    });
    this.bounds = bounds;

    var background = game.phaser.add.sprite(
      levelData.background[0],
      levelData.background[1],
      levelData.background[2]
    );
    background.scale.setTo(levelData.background[3], levelData.background[4]);
    this.map.background = background;

    //TOCHAS
    levelData.tochas.map((tochas_coords) => {
      if (tochas_coords[2]) this.map.addTorchInverted(tochas_coords[0], tochas_coords[1], this.map);
      else this.map.addTorch(tochas_coords[0], tochas_coords[1], this.map);
    });

    //ELEVADOR
    levelData.elevadores.map((elevador) => {
      for (var i = elevador.visible_chains[0]; i < elevador.visible_chains[1]; i++) {
        this.map.addChain(
          elevador.visible_chains[2],
          elevador.visible_chains[3] + elevador.visible_chains[4] * i,
          this.map.chains,
          true
        );
      }
      for (var i = elevador.invisible_chains[0]; i < elevador.invisible_chains[1]; i++) {
        this.map.addChain(
          elevador.invisible_chains[2],
          elevador.invisible_chains[3] + elevador.invisible_chains[4] * i,
          this.map.chains,
          false
        );
      }
      this.map.addElevator(
        elevador.plataforma[0],
        elevador.plataforma[1],
        elevador.plataforma[2],
        elevador.plataforma[3],
        elevador.plataforma[4]
      );
    });

    //PORTAS
    levelData.portas_deslizantes.map((data) => {
      var chains = [];
      for (var i = data.visible_chains[0]; i < data.visible_chains[1]; i++) {
        this.map.addChain(
          data.visible_chains[2],
          data.visible_chains[3] + data.visible_chains[4] * i,
          chains,
          data.visible_chains[5]
        );
      }
      for (var i = data.invisible_chains[0]; i < data.invisible_chains[1]; i++) {
        this.map.addChain(
          data.invisible_chains[2],
          data.invisible_chains[3] + data.invisible_chains[4] * i,
          chains,
          data.invisible_chains[5]
        );
      }
      this.map.addSlidingDoor(
        data.porta[0],
        data.porta[1],
        data.porta[2],
        data.porta[3],
        data.porta[4],
        data.porta[5],
        data.porta[6],
        data.porta[7],
        chains
      );
    });

    //PLATAFORMA
    levelData.plataformas.map((plataformas_data) => {
      for (
        var i = plataformas_data.visible_chains[0];
        i < plataformas_data.visible_chains[1];
        i++
      ) {
        this.map.addChain(
          plataformas_data.visible_chains[2],
          plataformas_data.visible_chains[3] + plataformas_data.visible_chains[4] * i,
          this.map.chains,
          plataformas_data.visible_chains[5]
        );
      }
      this.map.addPlataformaMovel(
        plataformas_data.platform[0],
        plataformas_data.platform[1],
        plataformas_data.platform[2],
        plataformas_data.platform[3],
        plataformas_data.platform[4],
        this.map.slidingDoors
      );
    });

    //BOXES
    levelData.caixas.map((caixa) => {
      if (caixa[2]) {
        this.map.addBigBox(caixa[0], caixa[1]);
      } else {
        this.map.addSmallBox(caixa[0], caixa[1]);
      }
    });
    //ELETRIC SAW
    levelData.serras.map((serras_coords) => {
      if (serras_coords[5])
        this.map.addEletricSawVertical(
          serras_coords[0],
          serras_coords[1],
          serras_coords[2],
          serras_coords[3],
          serras_coords[4]
        );
      else
        this.map.addEletricSaw(
          serras_coords[0],
          serras_coords[1],
          serras_coords[2],
          serras_coords[3],
          serras_coords[4]
        );
    });

    //BOTOES
    levelData.botoes.map((botoes_coords) => {
      if (botoes_coords[3] == "serra") {
        this.map.addButton(
          botoes_coords[0],
          botoes_coords[1],
          this.map.eletricSaw[botoes_coords[2]]
        );
      } else if (botoes_coords[3] == "plataforma") {
        this.map.addButton(
          botoes_coords[0],
          botoes_coords[1],
          this.map.platforms[botoes_coords[2]]
        );
      } else if (botoes_coords[3] == "slidingDoor") {
        this.map.addButton(
          botoes_coords[0],
          botoes_coords[1],
          this.map.slidingDoors[botoes_coords[2]]
        );
      }
    });

    //SPIKES
    levelData.spikes.map((spike_coords) => {
      this.map.addSpike(spike_coords[0], spike_coords[1]);
    });

    //PLATAFORMAS;
    this.map.platformsSprite = game.phaser.add.sprite(
      levelData.sprite_plataformas[0],
      levelData.sprite_plataformas[1],
      levelData.sprite_plataformas[2]
    );

    //LAVA
    levelData.lava.map((lava_coords) => {
      this.map.addLava(lava_coords[0], lava_coords[1]);
    });

    //LEVERS
    levelData.lever.map((lever_coords) => {
      this.map.addLever(lever_coords[0], lever_coords[1], lever_coords[2], lever_coords[3]);
    });

    //PORTAS FINAIS
    this.map.addLilDoor(levelData.porta_pequena[0], levelData.porta_pequena[1]);
    this.map.addBigDoor(levelData.porta_grande[0], levelData.porta_grande[1]);

    //CIRA TIMER
    this.timer.createTimer();
    if (!this.cutscene) {
      //BOARD PARA COLECTAVEIS
      this.addCollectableBoards(levelData.quadro_coletaveis[0], levelData.quadro_coletaveis[1]);

      //BOARD PARA RESTART E MENU
      this.addMenuBoards(levelData.quadro_menu_restart[0], levelData.quadro_menu_restart[1]);
    } //COLLECTAVEIS
    levelData.coletaveis_peanut.map((coletavel) => {
      this.map.addCollectableLilPeanut(coletavel[0], coletavel[1]);
    });

    levelData.coletaveis_big.map((coletavel) => {
      this.map.addCollectableBigMack(coletavel[0], coletavel[1]);
    });
  }
}

class Character {
  constructor(charObj) {
    this.obj = charObj;
    this.lastAnimation = null;
  }

  doWalkLeftAnimation() {
    this.obj.body.velocity.x = -200;
    if (this.boxAnim == false) {
      if (this.crouch) {
        this.obj.play("walkCrouchLeft");
      } else {
        this.obj.play("walkLeft");
      }
    } else {
      this.obj.play("walkBoxLeft");
    }
    this.lastAnimation = "left";
  }

  doTurnAnimation() {
    this.obj.body.velocity.x = 0;
    this.obj.body.velocity.y = 0;
    if (this.lastAnimation == "right" || this.lastAnimation == null) {
      this.obj.play("endAnimationRight");
    } else if (this.lastAnimation == "left") {
      this.obj.play("endAnimationLeft");
    }
  }

  doWalkRightAnimation() {
    this.obj.body.velocity.x = 200;
    if (this.boxAnim == false) {
      if (this.crouch) {
        this.obj.play("walkCrouchRight");
      } else {
        this.obj.play("walkRight");
      }
    } else {
      if (this.crouch) {
        this.obj.play("walkCrouchRight");
      } else {
        this.obj.play("walkBoxRight");
      }
    }
    this.lastAnimation = "right";
  }

  doBoxRightAnimation() {
    this.obj.play("boxRight");
  }

  doBoxLeftAnimation() {
    this.obj.play("boxRight");
  }

  stopAnimation() {
    this.obj.animations.stop();
  }

  jump() {
    this.obj.body.velocity.y = -380;
  }

  endAnimation(level, x, y) {
    const finalPosX = 10;
    const finalPosY = 300;
    if (this.obj.body.x <= x) {
      //ANDA PARA LADO DIREITO
      this.obj.play("walkRight");
    } else {
      this.obj.play("walkLeft");
    }
    game.phaser.physics.arcade.moveToXY(this.obj, x, y, finalPosX, finalPosY);
  }

  restAnimation() {
    if (this.lastAnimation == "right" || this.lastAnimation == null) {
      if (this.crouch) {
        this.obj.play("restCrouchRight");
      } else {
        this.obj.play("restRight");
      }
    } else if (this.lastAnimation == "left") {
      if (this.crouch) {
        this.obj.play("restCrouchLeft");
      } else {
        this.obj.play("restLeft");
      }
    }
  }
}

class bigMack extends Character {
  constructor(charObj, side) {
    super(charObj);
    let animWalkingEnd = [24, 25, 26];
    for (let i = 0; i < 2; i++) {
      animWalkingEnd = animWalkingEnd.concat(animWalkingEnd);
    }
    const animWalkLeft = [5, 6, 7, 8, 9];
    const animWalkRight = [0, 1, 2, 3, 4];
    const animRestRight = [10, 11];
    const animRestLeft = [12, 13];
    const animRestCrouchLeft = [46, 47];
    const animRestCrouchRight = [43, 44];
    const animBoxRight = [43, 44];
    const animBoxLeft = [21, 20];
    const animWalkBoxRight = [15, 16, 17];
    const animWalkBoxLeft = [20, 19, 18];
    const animWalkCrouchLeft = [46, 47, 48];
    const animWalkCrouchRight = [43, 44, 45];
    const startEndAnimLeft = [28, 27, 24];
    const endEndAnimLeft = [29, 30, 31, 32, 33, 34];
    const startEndAnimRight = [22, 23, 24];
    const endEndAnimRight = [29, 30, 31, 32, 33, 34];
    const gameOverAnim = [35, 36, 37, 37, 37, 36, 38, 39, 40];
    const gameOverMenuAnim = [41, 42];
    const frameRateWalk = 11;
    const frameRateRest = 4;
    const frameRateAnims = 10;
    const frameRateGameOver = 8;
    const frameRateGameOverMenu = 6;
    const restRightFrame = 10;
    const restLeftFrame = 12;
    const bodySize = { x: 16, y: 45, offsetX: 24, offsetY: 10 };
    charObj.body.setSize(bodySize.x, bodySize.y, bodySize.offsetX, bodySize.offsetY);

    charObj.animations.add("walkLeft", animWalkLeft, frameRateWalk, false);
    charObj.animations.add("walkRight", animWalkRight, frameRateWalk, false);
    charObj.animations.add("restRight", animRestRight, frameRateRest, true);
    charObj.animations.add("restLeft", animRestLeft, frameRateRest, true);
    charObj.animations.add("restCrouchLeft", animRestCrouchLeft, frameRateRest, true);
    charObj.animations.add("restCrouchRight", animRestCrouchRight, frameRateRest, true);
    charObj.animations.add("boxRight", animBoxRight, frameRateAnims, false);
    charObj.animations.add("boxLeft", animBoxLeft, frameRateAnims, false);
    charObj.animations.add("walkBoxRight", animWalkBoxRight, frameRateAnims, true);
    charObj.animations.add("walkBoxLeft", animWalkBoxLeft, frameRateAnims, true);
    charObj.animations.add("walkCrouchLeft", animWalkCrouchLeft, frameRateAnims, true);
    charObj.animations.add("walkCrouchRight", animWalkCrouchRight, frameRateAnims, true);
    charObj.animations.add(
      "endAnimationLeft",
      startEndAnimLeft.concat(animWalkingEnd).concat(endEndAnimLeft),
      frameRateAnims,
      false
    );
    charObj.animations.add(
      "endAnimationRight",
      startEndAnimRight.concat(animWalkingEnd).concat(endEndAnimRight),
      frameRateAnims,
      false
    );

    let anim = charObj.animations.add("gameover", gameOverAnim, frameRateGameOver, false);
    anim.onComplete.add(game.gameOverMenu, this);
    charObj.animations.add("gameoverMenu", gameOverMenuAnim, frameRateGameOverMenu, true);

    if (side === "right") {
      charObj.frame = restRightFrame;
      this.lastAnimation = "right";
    } else if (side === "left") {
      charObj.frame = restLeftFrame;
      this.lastAnimation = "left";
    }
    this.boxAnim = false;
  }
}

class lilPeanut extends Character {
  constructor(charObj, side) {
    super(charObj);
    let animWalkingEnd = [20, 21, 22];
    for (let i = 0; i < 2; i++) {
      animWalkingEnd = animWalkingEnd.concat(animWalkingEnd);
    }
    const animWalkLeft = [0, 1, 2];
    const animWalkRight = [3, 4, 5];
    const animRestRight = [8, 9];
    const animRestLeft = [10, 11];
    const animRestCrouchLeft = [39, 40];
    const animRestCrouchRight = [7, 42];
    const animBoxRight = [12, 13];
    const animBoxLeft = [15, 16];
    const animWalkBoxRight = [13, 14];
    const animWalkBoxLeft = [16, 17];
    const animWalkCrouchLeft = [39, 40, 41];
    const animWalkCrouchRight = [7, 42, 43];
    const startEndAnimLeft = [23, 24, 20];
    const endEndAnimLeft = [25, 26, 27, 28, 29, 30, 31];
    const startEndAnimRight = [18, 19, 20];
    const endEndAnimRight = [25, 26, 27, 28, 29, 30, 31];
    const gameOverAnim = [32, 33, 34, 34, 34, 33, 35, 36, 37];
    const gameOverMenuAnim = [38, 37];

    const walkFrameRate = 10;
    const restFrameRate = 5;
    const menuFrameRate = 8;

    const restRightFrame = 8;
    const restLeftFrame = 10;

    charObj.animations.add("walkLeft", animWalkLeft, walkFrameRate, true);
    charObj.animations.add("walkRight", animWalkRight, walkFrameRate, true);
    charObj.animations.add("restRight", animRestRight, restFrameRate, true);
    charObj.animations.add("restLeft", animRestLeft, restFrameRate, true);
    charObj.animations.add("restCrouchLeft", animRestCrouchLeft, restFrameRate, true);
    charObj.animations.add("restCrouchRight", animRestCrouchRight, restFrameRate, true);
    charObj.animations.add("boxRight", animBoxRight, walkFrameRate, false);
    charObj.animations.add("boxLeft", animBoxLeft, walkFrameRate, false);
    charObj.animations.add("walkBoxRight", animWalkBoxRight, walkFrameRate, true);
    charObj.animations.add("walkBoxLeft", animWalkBoxLeft, walkFrameRate, true);
    charObj.animations.add("walkCrouchLeft", animWalkCrouchLeft, walkFrameRate, true);
    charObj.animations.add("walkCrouchRight", animWalkCrouchRight, walkFrameRate, true);
    let anim = charObj.animations.add(
      "endAnimationLeft",
      startEndAnimLeft.concat(animWalkingEnd).concat(endEndAnimLeft),
      walkFrameRate,
      false
    );
    anim.onComplete.add(game.levelCompletedMenu, this);
    anim = charObj.animations.add(
      "endAnimationRight",
      startEndAnimRight.concat(animWalkingEnd).concat(endEndAnimRight),
      walkFrameRate,
      false
    );
    anim.onComplete.add(game.levelCompletedMenu, this);
    anim = charObj.animations.add("gameover", gameOverAnim, menuFrameRate, false);
    anim.onComplete.add(game.gameOverMenu, this);
    charObj.animations.add("gameoverMenu", gameOverMenuAnim, menuFrameRate, true);

    if (side === "right") {
      charObj.frame = restRightFrame;
      this.lastAnimation = "right";
    } else if (side === "left") {
      charObj.frame = restLeftFrame;
      this.lastAnimation = "left";
    }
    this.boxAnim = false;
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
    const animationFrames = [0, 1];
    const frameRate = 5;
    this.data.animations.add("animation", animationFrames, frameRate, true);
  }
}

class Bounds extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class Lava extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
    const animationFrames = [0, 1, 2];
    const frameRate = 5;
    this.data.animations.add("animation", animationFrames, frameRate, true);
    this.data.play("animation");
    game.soundEffects.map((sound) => {
      if (sound[0] == "lavaSoundEffect") {
        this.sound = sound[1];
      }
    });
  }
}

class Lever extends Sprite {
  constructor(x, y, data, timeToReset, actionObjIndex) {
    super(x, y, data);
    this.timeToReset = timeToReset * 1000;
    this.actionObj = game.currentLevel.map.slidingDoors[actionObjIndex];
    game.soundEffects.map((sound) => {
      if (sound[0] == "leverSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  resetLever = () => {
    const initialFrame = 0;
    game.playSingleSound(this.sound);
    this.data.frame = initialFrame;
  };
}

class Spike extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
    game.soundEffects.map((sound) => {
      if (sound[0] == "spikesSoundEffect") {
        this.sound = sound[1];
      }
    });
  }
}

class Elevator extends Sprite {
  constructor(x, y, data, num, maxX, minY) {
    super(x, y, data);
    this.num = num;
    this.maxX = maxX;
    this.minY = minY;
    game.soundEffects.map((sound) => {
      if (sound[0] == "elevatorSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  elevatorUp(elevator, chains) {
    const velocity = -50;
    elevator.data.body.velocity.y = velocity;
    chains.map((key, index) => {
      if (elevator.data.body.y < key.data.y) {
        key.data.visible = false;
      }
    });
  }

  elevatorDown(elevator, chains) {
    const velocity = 50;
    elevator.data.body.velocity.y = velocity;
    chains.map((key) => {
      if (elevator.data.body.y >= key.y && key.data.visible === false) {
        key.data.visible = true;
      }
    });
  }
}

class PlataformaMovel extends Sprite {
  constructor(x, y, data, num, maxX, minY, actionObj) {
    super(x, y, data);
    this.num = num;
    this.maxX = maxX;
    this.minY = minY;
    this.actionObj = actionObj;
    game.soundEffects.map((sound) => {
      if (sound[0] == "elevatorSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  platformUp(platform, chains) {
    platform.data.body.velocity.y = -50;
    chains.map((key, index) => {
      if (platform.data.body.y < key.data.y) {
        key.data.visible = false;
      }
    });
  }

  platformDown(platform, chains) {
    platform.data.body.velocity.y = 50;
    chains.map((key) => {
      if (platform.data.body.y >= key.y && key.data.visible === false) {
        key.data.visible = true;
      }
    });
  }

  press() {
    this.actionObj.map((door) => {
      if (door.inverted) {
        if (door.data.body.y > door.y) {
          door.up(door, door.chains);
        } else {
          door.data.body.velocity.y = 0;
        }
      } else {
        if (door.data.body.y > door.y) {
          door.down(door, door.chains);
        } else {
          door.data.body.velocity.y = 0;
        }
      }
    });
  }

  unpress() {
    this.actionObj.map((door) => {
      if (door.inverted) {
        if (Math.round(door.data.body.y) < door.maxY) {
          door.down(door, door.chains);
        } else {
          door.data.body.velocity.y = 0;
        }
      } else {
        if (Math.round(door.data.body.y) < door.maxY) {
          door.up(door, door.chains);
        } else {
          door.data.body.velocity.y = 0;
        }
      }
    });
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
    game.soundEffects.map((sound) => {
      if (sound[0] == "boxMoveSoundEffect") {
        this.moveSound = sound[1];
      } else if (sound[0] == "boxBreakSoundEffect") {
        this.breakSound = sound[1];
      }
    });
  }
}

class BigBox extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
    game.soundEffects.map((sound) => {
      if (sound[0] == "boxMoveSoundEffect") {
        this.moveSound = sound[1];
      }
    });
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

    const animationFrames = [0, 1, 2];
    const frameRate = 8;

    this.maxX = maxX;
    this.maxY = maxY;
    this.velocity = velocity;
    this.stop = false;
    data.animations.add("rotate", animationFrames, frameRate, true);
    data.body.velocity.x = velocity;
    game.soundEffects.map((sound) => {
      if (sound[0] == "sawSoundEffect") {
        this.sound = sound[1];
      }
    });
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
    if (this.data.body.x >= this.maxX) {
      this.data.body.velocity.x = -this.velocity;
    } else if (this.data.body.x <= this.x) {
      this.data.body.velocity.x = this.velocity;
    }
  }
}

class EletricSawVertical extends Sprite {
  constructor(x, y, data, maxX, maxY, velocity) {
    super(x, y, data);

    const animationFrames = [0, 1, 2];
    const frameRate = 8;

    this.maxX = maxX;
    this.maxY = maxY;
    this.velocity = velocity;
    this.stop = false;
    data.animations.add("rotate", animationFrames, frameRate, true);
    game.soundEffects.map((sound) => {
      if (sound[0] == "sawSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  doAnimation() {
    this.data.play("rotate");
  }

  press() {
    this.pressed = true;
    this.data.body.moves = true;
  }

  unpress() {
    this.pressed = false;
    this.data.body.moves = true;
  }

  moveSaw(x, y) {
    if (this.maxX == this.x) {
      if (this.pressed) {
        if (this.data.body.y < this.maxY) {
          this.data.body.velocity.y = this.velocity;
        } else if (this.data.body.y >= this.maxY) {
          this.data.body.velocity.y = 0;
        }
      } else {
        if (this.data.body.y > this.y) {
          this.data.body.velocity.y = -this.velocity;
        } else if (this.data.body.y <= this.y) {
          this.data.body.velocity.y = 0;
        }
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
    game.soundEffects.map((sound) => {
      if (sound[0] == "buttonSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  buttonPressed() {
    const pressedFrame = 1;
    if (this.actionObj.constructor.name === "EletricSaw") {
      //PARA A SAW
      this.data.frame = pressedFrame;
      this.actionObj.press();
    } else if (this.actionObj.constructor.name === "EletricSawVertical") {
      this.data.frame = pressedFrame;
      this.actionObj.press();
    } else if (this.actionObj.constructor.name === "PlataformaMovel") {
      this.data.frame = pressedFrame;
      this.actionObj.press();
    } else if (this.actionObj.constructor.name === "SlidingDoor") {
      this.data.frame = pressedFrame;

      if (this.actionObj.x == this.actionObj.maxX) {
        this.actionObj.up(this.actionObj, this.actionObj.chains);
      } else if (this.actionObj.y == this.actionObj.maxY) {
        this.actionObj.right(this.actionObj);
      }
    }
  }

  buttonUnpressed() {
    const unpressedFrame = 0;
    if (this.actionObj.constructor.name === "EletricSaw") {
      this.data.frame = unpressedFrame;
      this.actionObj.unpress();
    } else if (this.actionObj.constructor.name === "EletricSawVertical") {
      this.data.frame = unpressedFrame;
      this.actionObj.unpress();
    } else if (this.actionObj.constructor.name === "PlataformaMovel") {
      this.data.frame = unpressedFrame;
      this.actionObj.unpress();
    } else if (this.actionObj.constructor.name === "SlidingDoor") {
      this.data.frame = unpressedFrame;

      if (this.actionObj.x == this.actionObj.maxX) {
        this.actionObj.down(this.actionObj, this.actionObj.chains);
      } else if (this.actionObj.y == this.actionObj.maxY) {
        this.actionObj.left(this.actionObj);
      }
    }
  }
}

class Collectable extends Sprite {
  constructor(x, y, data, target) {
    super(x, y, data);

    const animVelocity = 20;

    this.velocity = animVelocity;
    this.target = target;
    game.soundEffects.map((sound) => {
      if (sound[0] == "collectableSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  doAnimation() {
    const offsetAnim = 10;
    if (this.data.body.y >= this.y + offsetAnim) {
      this.data.body.velocity.y = -this.velocity;
    } else if (this.data.body.y <= this.y) {
      this.data.body.velocity.y = this.velocity;
    }
  }
}

class Timer {
  constructor() {
    this.finalTime = 0;
    this.timerAux = 0;
    this.slot1 = {};
    this.slot2 = {};
    this.slot3 = {};
    this.slot4 = {};
  }

  createTimer() {
    const posX = 340;
    const posY = -8;
    const scale = 3;
    const xCoords = [361, 381, 416, 436];
    const yCoord = 19;
    const nNums = 10;
    const nSlots = 4;
    const nIndexOffset = 1;
    const board = game.phaser.add.sprite(posX, posY, "timerBoard");
    var date = new Date();

    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    this.startTime = date.getTime();
    for (let i = 1; i <= nSlots; i++) {
      for (let k = 0; k < nNums; k++) {
        this["slot" + String(i)][k] = game.phaser.add.sprite(
          xCoords[i - nIndexOffset],
          yCoord,
          String(k)
        );
        this["slot" + String(i)][k].visible = false;
        this["slot" + String(i)][k].scale.setTo(scale, scale);
        this["slot" + String(i)][k].smoothed = false;
      }
    }
  }

  stopTimer() {
    var date = new Date();
    var currentTime = date.getTime();
    var timerValue = Math.round((currentTime - this.startTime) / 1000) + this.timerAux;
    this.finalTime = timerValue;
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
    var timerValue = Math.round((currentTime - this.startTime) / 1000) + this.timerAux;
    var minutes = String(Math.floor(timerValue / 60));
    var seconds = String(timerValue % 60);
    var limitSeconds = 9;

    if (!game.currentLevel.cutscene) {
      if (parseInt(seconds) > limitSeconds) {
        this.updateDigit(seconds[0], this.slot3);
        this.updateDigit(seconds[1], this.slot4);
      } else {
        this.updateDigit("0", this.slot3);
        this.updateDigit(seconds[0], this.slot4);
      }
      if (parseInt(minutes) > limitSeconds) {
        this.updateDigit(minutes[0], this.slot1);
        this.updateDigit(minutes[1], this.slot2);
      } else {
        this.updateDigit("0", this.slot1);
        this.updateDigit(minutes[0], this.slot2);
      }
    }
  }
}

class SlidingDoor extends Sprite {
  constructor(x, y, data, maxX, maxY, velocidade, inverted, chains) {
    super(x, y, data);
    this.maxX = maxX;
    this.maxY = maxY;
    this.velocidade = velocidade;
    this.inverted = inverted;
    this.chains = chains;
  }

  right(platform) {
    const setVelocity = 0;

    if (Math.round(platform.data.body.x) < this.maxX) {
      platform.data.body.velocity.x = this.velocidade;
    } else {
      platform.data.body.velocity.x = setVelocity;
    }
  }

  left(platform) {
    const setVelocity = 0;

    if (Math.round(platform.data.body.x) > this.x) {
      platform.data.body.velocity.x = -this.velocidade;
    } else {
      platform.data.body.velocity.x = setVelocity;
    }
  }

  up(platform, chains) {
    const setVelocity = 0;

    if (Math.round(platform.data.body.y) >= this.y) {
      platform.data.body.velocity.y = -this.velocidade;
    } else {
      platform.data.body.velocity.y = setVelocity;
    }
    chains.map((key, index) => {
      if (platform.data.body.y < key.data.y) {
        key.data.visible = false;
      }
    });
  }

  down(platform, chains) {
    const setVelocity = 0;

    if (Math.round(platform.data.body.y) <= this.maxY) {
      platform.data.body.velocity.y = this.velocidade;
    } else {
      platform.data.body.velocity.y = setVelocity;
    }

    chains.map((key) => {
      if (platform.data.body.y >= key.y && key.data.visible === false) {
        key.data.visible = true;
      }
    });

    //COLISAO COM BOXS
    if (
      game.phaser.physics.arcade.collide(game.currentLevel.lilPeanut.obj, this.data) ||
      game.phaser.physics.arcade.collide(game.currentLevel.bigMack.obj, this.data)
    ) {
      platform.data.body.velocity.y = setVelocity;
    }
    game.currentLevel.map.bigBox.map((key) => {
      if (game.phaser.physics.arcade.collide(key.data, this.data)) {
        platform.data.body.velocity.y = setVelocity;
      }
    });
  }
}

class Menu {
  constructor() {
    this.buttons = [];
    this.sprites = [];
    this.texts = [];
    game.soundEffects.map((sound) => {
      if (sound[0] == "buttonSoundEffect") {
        this.sound = sound[1];
      }
    });
  }

  addBitmapText(x, y, t, size) {
    var bmt = game.phaser.add.bitmapText(x, y, "myfont", t, size);
    this.texts.push(bmt);
    return bmt;
  }

  hideContent(game) {
    for (var i = 0; i < this.sprites.length; i++) {
      this.sprites[i].visible = false;
    }

    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].visible = false;
    }

    for (var i = 0; i < this.texts.length; i++) {
      this.texts[i].visible = false;
    }
  }

  showContent(game) {
    for (var i = 0; i < this.sprites.length; i++) {
      this.sprites[i].visible = true;
    }

    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].visible = true;
    }

    for (var i = 0; i < this.texts.length; i++) {
      this.texts[i].visible = true;
    }
  }

  toOptions() {
    game.playSingleSound(this.sound);
    game.phaser.state.start("Options");
  }

  toStart() {
    game.playSingleSound(this.sound);
    game.phaser.state.start("Level1");
  }

  toLevel(level) {
    var data = {
      volumeScale: 10,
      lastLevel: 5,
    };
    game.playSingleSound(this.sound);
    game.menuMusic.pause();
    if (game.gameMusic.paused) {
      game.gameMusic.volume = game.player.gameMusicVolume / data.volumeScale;
      game.gameMusic.loop = true;
      game.gameMusic.load();
      game.gameMusic.play();
    }
    if (level == data.lastLevel) {
      game.phaser.state.start("EndOfGame");
    } else {
      game.phaser.state.start("Level" + level.toString());
    }
  }

  toRanking() {
    game.playSingleSound(this.sound);
    game.phaser.state.start("Ranking");
  }

  toMainMenu() {
    var volumeScale = 10;
    if (this && this.sound) {
      game.playSingleSound(this.sound);
    }
    game.gameMusic.pause();
    if (game.menuMusic.paused) {
      game.menuMusic.volume = game.player.menuMusicVolume / volumeScale;
      game.menuMusic.loop = true;
      game.menuMusic.load(); //resets sound
      game.menuMusic.play();
    }
    game.phaser.state.start("MainMenu");
  }

  toHelp() {
    game.playSingleSound(this.sound);
    game.phaser.state.start("Help");
  }

  toLevelSelector() {
    game.playSingleSound(this.sound);
    game.phaser.state.start("LevelSelector");
  }

  addSprite(x, y, name) {
    var sprite = game.phaser.add.sprite(x, y, name);
    sprite.smoothed = false;
    this.sprites.push(sprite);
    return sprite;
  }

  addButton(x, y, name, callToAction) {
    var button = game.phaser.add.button(x, y, name, callToAction, this, 0, 0, 0);
    button.smoothed = false;
    this.buttons.push(button);
    return button;
  }
}

class Options extends Menu {
  constructor() {
    super();
    this.soundEffectsVolume = game.player.soundEffectsVolume;
    this.gameMusicVolume = game.player.gameMusicVolume;
    this.menuMusicVolume = game.player.menuMusicVolume;
    this.SoundEffectsEmptySoundBars = [];
    this.SoundEffectsFilledSoundBars = [];
    this.GameMusicEmptySoundBars = [];
    this.GameMusicFilledSoundBars = [];
    this.MenuMusicEmptySoundBars = [];
    this.MenuMusicFilledSoundBars = [];
  }

  addButton(x, y, name, callToAction) {
    var defaultFlag = 0;
    var button = game.phaser.add.button(
      x,
      y,
      name,
      callToAction,
      { this: this, x: x, y: y },
      defaultFlag,
      defaultFlag,
      defaultFlag
    );
    button.smoothed = false;
    this.buttons.push(button);
    return button;
  }

  exitOptions() {
    //Update DB
    var data = {
      soundEffectsVolume: game.player.soundEffectsVolume,
      gameMusicVolume: game.player.gameMusicVolume,
      menuMusicVolume: game.player.menuMusicVolume,
    };
    game.dataBaseSet(data);

    if (game.phaser.paused == true) {
      this.this.hideContent();
      game.pauseMenu.showContent();
    } else {
      this.this.toMainMenu();
    }
  }

  setVolume(sound, volume, y) {
    var data = {
      minVolume: 0,
      maxVolume: 10,
      soundBarXCoords: [285, 30],
    };

    if (volume <= data.maxVolume && volume >= data.minVolume) {
      if (sound == this.SoundEffectsFilledSoundBars) {
        this.soundEffectsVolume = volume;
        game.player.soundEffectsVolume = volume;
        game.soundEffects.map((sound) => {
          sound.volume = volume / data.maxVolume;
        });
      } else if (sound == this.GameMusicFilledSoundBars) {
        this.gameMusicVolume = volume;
        game.player.gameMusicVolume = volume;
        game.gameMusic.volume = volume / data.maxVolume;
      } else if (sound == this.MenuMusicFilledSoundBars) {
        this.menuMusicVolume = volume;
        game.player.menuMusicVolume = volume;
        game.menuMusic.volume = volume / data.maxVolume;
      }

      for (let i = 0; i < volume; i++) {
        if (!sound[i].alive) {
          sound[i].reset(data.soundBarXCoords[0] + data.soundBarXCoords[1] * i, y);
        }
      }
      for (let i = volume; i < data.maxVolume; i++) {
        if (sound[i].alive) {
          sound[i].kill();
        }
      }
    }
  }

  changeVolume() {
    var data = {
      soundBarYCoords: [147, 297, 447],
      soundBarXCoords: [285, 30],
      volumeDifference: 1,
    };
    var button = this.this;
    var volume;
    if (this.y == data.soundBarYCoords[0]) {
      volume = (this.x - data.soundBarXCoords[0]) / data.soundBarXCoords[1] + data.volumeDifference;
      button.setVolume(button.SoundEffectsFilledSoundBars, volume, data.soundBarYCoords[0]);
    } else if (this.y == data.soundBarYCoords[1]) {
      volume = (this.x - data.soundBarXCoords[0]) / data.soundBarXCoords[1] + data.volumeDifference;
      button.setVolume(button.GameMusicFilledSoundBars, volume, data.soundBarYCoords[1]);
    } else if (this.y == data.soundBarYCoords[2]) {
      volume = (this.x - data.soundBarXCoords[0]) / data.soundBarXCoords[1] + data.volumeDifference;
      button.setVolume(button.MenuMusicFilledSoundBars, volume, data.soundBarYCoords[2]);
    }
    game.playSingleSound(button.sound);
  }

  decreaseVolume() {
    var data = {
      soundBarYCoords: [147, 297, 447],
      soundYCoords: [150, 300, 450],
      volumeDifference: 1,
    };
    const button = this.this;
    game.playSingleSound(button.sound);
    if (this.y == data.soundYCoords[0]) {
      button.setVolume(
        button.SoundEffectsFilledSoundBars,
        button.soundEffectsVolume - data.volumeDifference,
        data.soundBarYCoords[0]
      );
    } else if (this.y == data.soundYCoords[1]) {
      button.setVolume(
        button.GameMusicFilledSoundBars,
        button.gameMusicVolume - data.volumeDifference,
        data.soundBarYCoords[1]
      );
    } else if (this.y == data.soundYCoords[2]) {
      button.setVolume(
        button.MenuMusicFilledSoundBars,
        button.menuMusicVolume - data.volumeDifference,
        data.soundBarYCoords[2]
      );
    }
  }

  increaseVolume() {
    var data = {
      soundYCoords: [150, 300, 450],
      soundBarYCoords: [147, 297, 447],
      volumeDifference: 1,
    };
    const button = this.this;
    game.playSingleSound(button.sound);
    if (this.y == data.soundYCoords[0]) {
      button.setVolume(
        button.SoundEffectsFilledSoundBars,
        button.soundEffectsVolume + data.volumeDifference,
        data.soundBarYCoords[0]
      );
    } else if (this.y == data.soundYCoords[1]) {
      button.setVolume(
        button.GameMusicFilledSoundBars,
        button.gameMusicVolume + data.volumeDifference,
        data.soundBarYCoords[1]
      );
    } else if (this.y == data.soundYCoords[2]) {
      button.setVolume(
        button.MenuMusicFilledSoundBars,
        button.menuMusicVolume + data.volumeDifference,
        data.soundBarYCoords[2]
      );
    }
  }

  muteVolume() {
    var data = {
      soundBarYCoords: [147, 297, 447],
      soundYCoords: [150, 300, 450],
      volume: 0,
    };
    const button = this.this;
    game.playSingleSound(button.sound);
    if (this.y == data.soundYCoords[0]) {
      button.setVolume(button.SoundEffectsFilledSoundBars, data.volume, data.soundBarYCoords[0]);
    } else if (this.y == data.soundYCoords[1]) {
      button.setVolume(button.GameMusicFilledSoundBars, data.volume, data.soundBarYCoords[1]);
    } else if (this.y == data.soundYCoords[2]) {
      button.setVolume(button.MenuMusicFilledSoundBars, data.volume, data.soundBarYCoords[2]);
    }
  }

  addSprites(game) {
    var data = {
      backgroundCoords: [0, 0],
      spritesX: [50, 65, 65],
      spritesScale: [0.6, 0.6],
      optionsTitle: [175, -100, 0.75, 0.75],
      soundYCoords: [150, 300, 450],
    };
    this.addSprite(data.backgroundCoords[0], data.backgroundCoords[1], "menuBackground");
    this.addSprite(data.optionsTitle[0], data.optionsTitle[1], "optionsTitle").scale.setTo(
      data.optionsTitle[2],
      data.optionsTitle[3]
    );
    this.addSprite(data.spritesX[0], data.soundYCoords[0], "optionsSoundEffects").scale.setTo(
      data.spritesScale[0],
      data.spritesScale[1]
    );
    this.addSprite(data.spritesX[1], data.soundYCoords[1], "optionsGameMusic").scale.setTo(
      data.spritesScale[0],
      data.spritesScale[1]
    );
    this.addSprite(data.spritesX[2], data.soundYCoords[2], "optionsMenuMusic").scale.setTo(
      data.spritesScale[0],
      data.spritesScale[1]
    );
  }

  addButtons(game) {
    var data = {
      numLines: 3,
      minVolume: 0,
      maxVolume: 10,
      numButtonsPerLine: 3,
      // [xStatic, xDynamic]
      soundBarXCoords: [285, 30],
      // [y1, y2, y3]
      soundBarYCoords: [147, 297, 447],
      soundYCoords: [150, 300, 450],
      soundXCoords: [210, 605, 680],
      soundButtonsScale: [1.5, 1.5],
      soundButtonName: ["SoundLess", "SoundPlus", "SoundOff"],
      soundButtonFunctions: [this.decreaseVolume, this.increaseVolume, this.muteVolume],

      backButtonData: [50, 30, 2.8, 2.8],
      soundBarEmptyScales: [2.5, 2.2],
      soundBarFilledScales: [2.6, 2.2],
    };

    for (let i = 0; i < data.numLines; i++) {
      for (let j = 0; j < data.numButtonsPerLine; j++) {
        this.addButton(
          data.soundXCoords[i],
          data.soundYCoords[j],
          data.soundButtonName[i],
          data.soundButtonFunctions[i]
        ).scale.setTo(data.soundButtonsScale[0], data.soundButtonsScale[1]);
      }
    }

    this.addButton(
      data.backButtonData[0],
      data.backButtonData[1],
      "backBtn",
      this.exitOptions
    ).scale.setTo(data.backButtonData[2], data.backButtonData[3]);

    for (let i = 0; i < data.maxVolume; i++) {
      var bar = this.addButton(
        data.soundBarXCoords[0] + data.soundBarXCoords[1] * i,
        data.soundBarYCoords[0],
        "SoundBarEmpty",
        this.changeVolume
      );
      bar.scale.setTo(data.soundBarEmptyScales[0], data.soundBarEmptyScales[1]);
      this.SoundEffectsEmptySoundBars.push(bar);
    }

    for (let i = 0; i < data.maxVolume; i++) {
      var bar = this.addButton(
        data.soundBarXCoords[0] + data.soundBarXCoords[1] * i,
        data.soundBarYCoords[0],
        "SoundBarFilled",
        this.changeVolume
      );
      bar.scale.setTo(data.soundBarFilledScales[0], data.soundBarFilledScales[1]);

      this.SoundEffectsFilledSoundBars.push(bar);
    }

    for (let i = 0; i < data.maxVolume; i++) {
      var bar = this.addButton(
        data.soundBarXCoords[0] + data.soundBarXCoords[1] * i,
        data.soundBarYCoords[1],
        "SoundBarEmpty",
        this.changeVolume
      );
      bar.scale.setTo(data.soundBarEmptyScales[0], data.soundBarEmptyScales[1]);
      this.GameMusicEmptySoundBars.push(bar);
    }

    for (let i = 0; i < data.maxVolume; i++) {
      var bar = this.addButton(
        data.soundBarXCoords[0] + data.soundBarXCoords[1] * i,
        data.soundBarYCoords[1],
        "SoundBarFilled",
        this.changeVolume
      );
      bar.scale.setTo(data.soundBarFilledScales[0], data.soundBarFilledScales[1]);
      this.GameMusicFilledSoundBars.push(bar);
    }

    for (let i = 0; i < data.maxVolume; i++) {
      var bar = this.addButton(
        data.soundBarXCoords[0] + data.soundBarXCoords[1] * i,
        data.soundBarYCoords[2],
        "SoundBarEmpty",
        this.changeVolume
      );
      bar.scale.setTo(data.soundBarEmptyScales[0], data.soundBarEmptyScales[1]);
      this.MenuMusicEmptySoundBars.push(bar);
    }

    for (let i = 0; i < data.maxVolume; i++) {
      var bar = this.addButton(
        data.soundBarXCoords[0] + data.soundBarXCoords[1] * i,
        data.soundBarYCoords[2],
        "SoundBarFilled",
        this.changeVolume
      );
      bar.scale.setTo(data.soundBarFilledScales[0], data.soundBarFilledScales[1]);
      this.MenuMusicFilledSoundBars.push(bar);
    }

    this.setVolume(
      this.SoundEffectsFilledSoundBars,
      this.soundEffectsVolume,
      data.soundBarYCoords[0]
    );
    this.setVolume(this.GameMusicFilledSoundBars, this.gameMusicVolume, data.soundBarYCoords[1]);
    this.setVolume(this.MenuMusicFilledSoundBars, this.menuMusicVolume, data.soundBarYCoords[2]);
  }
}

class MainMenu extends Menu {
  constructor() {
    super();
  }

  addSprites(game) {
    var spriteData = [
      [0, 0, "menuBackground", 0.63, 0.85],
      [100, -75, "titleInline", 0.6, 0.6],
    ];

    var spriteAnimData = [
      [570, 340, "lilPeanut", "restLeft", [10, 11], 5, true, 6, 6],
      [-40, 185, "bigMack", "restRight", [10, 11], 4, true, 6, 6],
    ];

    spriteData.map((key) => {
      this.addSprite(key[0], key[1], key[2]).scale.setTo(key[3], key[4]);
    });

    spriteAnimData.map((key) => {
      let anim = null;
      anim = this.addSprite(key[0], key[1], key[2]);
      anim.scale.setTo(key[7], key[8]);
      anim.animations.add(key[3], [key[4][0], key[4][1]], key[5], key[6]);
      anim.play(key[3]);
    });
  }

  addButtons(game) {
    var buttonScales = [2.8, 2.8];
    var buttonData = [
      [330, 200, "startBtn", this.toLevelSelector],
      [330, 270, "optionsBtn", this.toOptions],
      [330, 340, "helpBtn", this.toHelp],
      [330, 410, "rankingBtn", this.toRanking],
    ];

    buttonData.map((key) => {
      this.addButton(key[0], key[1], key[2], key[3]).scale.setTo(buttonScales[0], buttonScales[1]);
    });
  }
}

class Ranking extends Menu {
  constructor() {
    super();
    this.rankings = [];
  }

  addText(game) {
    var textData = [
      [50, 150, "myfont", "1-                      PTS", 32],
      [50, 220, "myfont", "2-                      PTS", 32],
      [50, 290, "myfont", "3-                      PTS", 32],
      [50, 360, "myfont", "4-                      PTS", 32],
      [50, 430, "myfont", "5-                      PTS", 32],
    ];

    textData.map((key) => {
      var t = game.phaser.add.bitmapText(key[0], key[1], key[2], key[3]);
      this.rankings.push(t);
    });
    this.loadRankings();
  }

  addSprites(game) {
    var spriteData = [
      [0, 0, "menuBackground", 0.63, 0.85],
      [45, -255, "rankingInline", 0.6, 0.6],
    ];

    spriteData.map((key) => {
      this.addSprite(key[0], key[1], key[2]).scale.setTo(key[3], key[4]);
    });
  }

  addButtons(game) {
    var buttonData = [50, 30, "backBtn", this.toMainMenu, 2.8, 2.8];
    this.addButton(buttonData[0], buttonData[1], buttonData[2], buttonData[3]).scale.setTo(
      buttonData[4],
      buttonData[5]
    );
  }

  loadRankings() {
    var offsetNameLength = 20;
    var sliceIni = 0;
    var sliceFim = 3;
    var limit = 5;
    var rankings = this.rankings;
    db.collection("players")
      .orderBy("totalScore", "desc")
      .limit(limit)
      .get()
      .then(function (querySnapshot) {
        let i = 0;
        querySnapshot.forEach(function (doc) {
          let score = String(doc.data().totalScore);
          rankings[i].setText(
            rankings[i]._text.slice(sliceIni, sliceFim) +
              doc.data().name +
              " ".repeat(offsetNameLength - doc.data().name.length - score.length) +
              score +
              " PTS"
          );
          i++;
        });
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });
    this.rankings = rankings;
  }
}

class Help extends Menu {
  constructor() {
    super();
  }

  toExitHelp() {
    if (game.phaser.paused == true) {
      this.hideContent();
      game.pauseMenu.showContent();
    } else {
      this.toMainMenu();
    }
  }

  addTexts(game, t1, t2, t3, t4, t5, t6) {
    var textData = [
      [50, 200, t1, 32],
      [185, 300, t2, 12],
      [250, 300, t3, 12],
      [115, 460, t4, 12],
      [260, 460, t5, 12],
      [180, 460, t6, 12],
      [560, 300, t2, 12],
      [430, 300, t3, 12],
      [495, 460, t4, 12],
      [635, 460, t5, 12],
      [555, 460, t6, 12],
    ];

    textData.map((key) => {
      this.addBitmapText(key[0], key[1], key[2], key[3]);
    });
  }

  addSprites(game) {
    var spriteData = [
      [0, 0, "menuBackground", 0.63, 0.85],
      [-180, -50, "helpInline", 0.6, 0.6],
      [145, 350, "sKey", 2.5, 2.5],
      [145, 280, "wKey", 2.5, 2.5],
      [220, 350, "dKey", 2.5, 2.5],
      [220, 280, "eKey", 2.5, 2.5],
      [70, 350, "aKey", 2.5, 2.5],
      [520, 350, "downKey", 2.5, 2.5],
      [450, 350, "leftKey", 2.5, 2.5],
      [590, 350, "rightKey", 2.5, 2.5],
      [520, 280, "upKey", 2.5, 2.5],
      [390, 260, "rightShiftKey", 2.5, 2.5],
      [720, 400, "lilPeanutImg", 3, 3],
      [20, 350, "bigMackImg", 3, 3],
    ];

    spriteData.map((key) => {
      this.addSprite(key[0], key[1], key[2]).scale.setTo(key[3], key[4]);
    });
  }

  addButtons(game) {
    var buttonData = [50, 30, "backBtn", this.toExitHelp, 2.8, 2.8];
    this.addButton(buttonData[0], buttonData[1], buttonData[2], buttonData[3]).scale.setTo(
      buttonData[4],
      buttonData[5]
    );
  }
}

class LevelSelector extends Menu {
  constructor() {
    super();
  }

  addSprites() {
    var spriteData = [
      [0, 0, "menuBackground", 0.63, 0.85],
      [20, -155, "levelsInline", 0.6, 0.6],
      [65, 170, "pyramidLevelSelector", 0.7, 0.7],
      //lvl1
      [260, 235, "collectableBigMack", 3, 3, "level1"],
      [260, 255, "collectableLilPeanut", 3, 3, "level1"],
      //lvl2
      [600, 235, "collectableBigMack", 3, 3, "level2"],
      [600, 255, "collectableLilPeanut", 3, 3, "level2"],
      //lvl3
      [260, 380, "collectableBigMack", 3, 3, "level3"],
      [260, 400, "collectableLilPeanut", 3, 3, "level3"],
      //lvl4
      [600, 380, "collectableBigMack", 3, 3, "level4"],
      [600, 400, "collectableLilPeanut", 3, 3, "level4"],
    ];
    let currentSprite = null;
    spriteData.map((key) => {
      if (key.length == 6) {
        if (game.player[key[5]].score !== 0) {
          currentSprite = this.addSprite(key[0], key[1], key[2]);
          currentSprite.scale.setTo(key[3], key[4]);
        }
      } else {
        currentSprite = this.addSprite(key[0], key[1], key[2]).scale.setTo(key[3], key[4]);
      }
    });
  }
  // TO-DO: DEPOIS DE REESTRUTURAR BD, METER OS COLECTAVEIS, SCORE E TIMERS DINAMICOS
  addTexts() {
    const scoreToShow = game.player.totalScore;
    var textData = [
      [530, 35, "TOTAL SCORE:\n  " + String(scoreToShow) + " PTS.", 24],
      //level1
      [310, 235, String(game.player.level1.nBigMackCollected) + " / 3", 16, "level1"],
      [310, 255, String(game.player.level1.nLilPeanutCollected) + " / 3", 16, "level1"],
      [260, 295, "SCORE:" + String(game.player.level1.score), 16, "level1"],
      //level2
      [650, 235, String(game.player.level1.nBigMackCollected) + " / 3", 16, "level2"],
      [650, 255, String(game.player.level1.nLilPeanutCollected) + " / 3", 16, "level2"],
      [600, 295, "SCORE:" + String(game.player.level1.score), 16, "level2"],
      //level3
      [310, 380, String(game.player.level1.nBigMackCollected) + " / 3", 16, "level3"],
      [310, 400, String(game.player.level1.nLilPeanutCollected) + " / 3", 16, "level3"],
      [260, 440, "SCORE:" + String(game.player.level1.score), 16, "level3"],
      //lvl4
      [650, 380, String(game.player.level1.nBigMackCollected) + " / 3", 16, "level4"],
      [650, 400, String(game.player.level1.nLilPeanutCollected) + " / 3", 16, "level4"],
      [600, 440, "SCORE:" + String(game.player.level1.score), 16, "level4"],
    ];

    textData.map((key) => {
      if (key.length == 5) {
        if (game.player[key[4]].score !== 0) {
          this.addBitmapText(key[0], key[1], key[2], key[3]);
        }
      } else {
        this.addBitmapText(key[0], key[1], key[2], key[3]);
      }
    });
  }

  addButtons() {
    const buttonsData = [
      [100, 30, "backBtn", this.toMainMenu, 2.8, 2.8],
      [
        85,
        362,
        "lvl3",
        () => {
          this.toLevel(3);
        },
        0.3,
        0.25,
      ],
      [
        425,
        362,
        "lvl4",
        () => {
          this.toLevel(4);
        },
        0.3,
        0.25,
      ],
      [
        85,
        230,
        "lvl1",
        () => {
          this.toLevel(1);
        },
        0.3,
        0.25,
      ],
      [
        425,
        230,
        "lvl2",
        () => {
          this.toLevel(2);
        },
        0.3,
        0.25,
      ],
    ];

    buttonsData.map((key) => {
      let spriteAux = null;
      if (key[2].includes("lvl")) {
        const levelAntStr = "level" + String(parseInt(key[2][3]) - 1);
        if (levelAntStr == "level0" || game.player[levelAntStr].score != 0) {
          this.addButton(key[0], key[1], key[2], key[3]).scale.setTo(key[4], key[5]);
        } else {
          spriteAux = this.addSprite(key[0], key[1], key[2], key[3]);
          spriteAux.scale.setTo(key[4], key[5]);
          var gray = game.phaser.add.filter("Gray");
          spriteAux.filters = [gray];
        }
      } else {
        this.addButton(key[0], key[1], key[2], key[3]).scale.setTo(key[4], key[5]);
      }
    });
  }
}

class GameOverMenu extends Menu {
  constructor() {
    super();
    game.gameMusic.pause();
  }

  addButtons(game) {
    var scalesButtons = [2.5, 2.5];
    var buttons = [
      [
        361,
        340,
        "quitBtn",
        () => {
          game.phaser.paused = false;
          this.toMainMenu();
        },
      ],
      [
        361,
        270,
        "restartBtn",
        () => {
          game.phaser.paused = false;
          game.phaser.state.start(game.phaser.state.current);
        },
      ],
    ];
    buttons.map((button) => {
      this.addButton(button[0], button[1], button[2], button[3]).scale.setTo(
        scalesButtons[0],
        scalesButtons[1]
      );
    });
  }

  addSprites(game) {
    var sprites = [240, 180, "GameOverMenu", 0.5, 0.5];
    this.addSprite(sprites[0], sprites[1], sprites[2]).scale.setTo(sprites[3], sprites[4]);
  }
}

class NameInput extends Menu {
  constructor() {
    super();
    this.input = null;
  }

  addSprites(game) {
    var sprites = [
      [0, 0, "menuBackground", 0.63, 0.85],
      [125, 280, "inputBox"],
    ];
    this.addSprite(sprites[0][0], sprites[0][1], sprites[0][2]).scale.setTo(
      sprites[0][3],
      sprites[0][4]
    );
    this.addSprite(sprites[1][0], sprites[1][1], sprites[1][2]);
  }

  addButtons(game) {
    var buttons = [300, 450, "submitBtn", this.getName, 2.8, 2.8];
    this.addButton(buttons[0], buttons[1], buttons[2], buttons[3]).scale.setTo(
      buttons[4],
      buttons[5]
    );
  }

  inputFocus(sprite) {
    sprite.canvasInput.focus();
  }

  addInput(game) {
    const key = 13;
    const inputFieldValue = document.getElementById("name-input");
    inputFieldValue.addEventListener("keyup", (event) => {
      if (event.keyCode === key) {
        this.getName();
      }
    });
  }

  addText(game, t) {
    var bmptext = [90, 150, "myfont", t, 32];
    var text = game.phaser.add.bitmapText(
      bmptext[0],
      bmptext[1],
      bmptext[2],
      bmptext[3],
      bmptext[4]
    );
    text.align = "center";
  }

  getName() {
    //firebase request
    const inputFieldValue = document.getElementById("name-input");

    if (inputFieldValue.value != "") {
      game.dataBaseGet(inputFieldValue.value, this.toMainMenu);
      inputFieldValue.style.display = "none";
      inputFieldValue.disabled = true;
    } else {
      alert("Please enter a name");
    }
  }
}

class Player {
  constructor(
    name,
    soundEffectsVolume,
    gameMusicVolume,
    menuMusicVolume,
    level1,
    level2,
    level3,
    level4,
    totalScore,
    docRef
  ) {
    this.name = name;
    this.soundEffectsVolume = soundEffectsVolume;
    this.gameMusicVolume = gameMusicVolume;
    this.menuMusicVolume = menuMusicVolume;
    this.level1 = level1;
    this.level2 = level2;
    this.level3 = level3;
    this.level4 = level4;
    this.totalScore = totalScore;
    this.docRef = docRef;
  }
}

class PauseMenu extends Menu {
  constructor() {
    super();
  }

  addButtons() {
    var buttons = [
      [
        420,
        342,
        "quitBtn",
        () => {
          game.phaser.paused = false;
          this.toMainMenu();
        },
      ],
      [
        240,
        260,
        "helpBtn",
        () => {
          this.hideContent(game);
          var pauseHelpMenu = new Help();
          pauseHelpMenu.addSprites(game);
          pauseHelpMenu.addButtons(game);
          pauseHelpMenu.addTexts(
            game,
            "  BIG MACK    LIL PEANUT",
            "JUMP",
            "INTERACT",
            "LEFT",
            "RIGHT",
            "CROUCH"
          );
        },
      ],
      [
        420,
        260,
        "optionsBtn",
        () => {
          this.hideContent();
          var pauseOptionsMenu = new Options();
          pauseOptionsMenu.addSprites(game);
          pauseOptionsMenu.addButtons(game);
        },
      ],
      [
        240,
        340,
        "backBtn",
        () => {
          this.hideContent(game);
          game.phaser.paused = false;
          var date = new Date();
          game.currentLevel.timer.startTime = date.getTime();
        },
      ],
    ];
    var scalesButtons = [2.5, 2.5];
    buttons.map((button) => {
      this.addButton(button[0], button[1], button[2], button[3]).scale.setTo(
        scalesButtons[0],
        scalesButtons[1]
      );
    });
  }

  addSprites() {
    var sprites = [210, 180, "pauseMenu", 0.5, 0.5];
    this.addSprite(sprites[0], sprites[1], sprites[2]).scale.setTo(sprites[3], sprites[4]);
  }
}

class LevelCompletedMenu extends Menu {
  constructor() {
    super();
    game.soundEffects.map((sound) => {
      if (sound[0] == "levelCompleteSoundEffect") {
        game.gameMusic.pause();
        game.playSingleSound(sound[1]);
      }
    });
  }

  addTexts(score, time, highestScore) {
    var data = {
      bigCollectables: [385, 252, 20],
      lilCollectables: [385, 292, 20],
      time: [305, 332, 20],
      highscore: [210, 372, 20],
      scoreBoundLimit: 1000,
      score: [305, 372, 20],
    };
    this.addBitmapText(
      data.bigCollectables[0],
      data.bigCollectables[1],
      String(game.currentLevel.nBigMackCollected) + " / 3",
      data.bigCollectables[2]
    );
    this.addBitmapText(
      data.lilCollectables[0],
      data.lilCollectables[1],
      String(game.currentLevel.nLilPeanutCollected) + " / 3",
      data.lilCollectables[2]
    );
    this.addBitmapText(
      data.time[0],
      data.time[1],
      "TIME- " + time.minutes + ":" + time.seconds + " MIN",
      data.time[2]
    );
    if (highestScore) {
      this.addBitmapText(
        data.highscore[0],
        data.highscore[1],
        "NEW HIGH SCORE- " + String(score) + " pts.",
        data.highscore[2]
      );
    } else {
      if (score >= data.scoreBoundLimit) {
        this.addBitmapText(
          data.score[0],
          data.score[1],
          "SCORE-" + String(score) + "pts.",
          data.score[2]
        );
      } else {
        this.addBitmapText(
          data.score[0],
          data.score[1],
          "SCORE- " + String(score) + "pts.",
          data.score[2]
        );
      }
    }
  }

  addButtons() {
    const lastLvl = 4;
    let posData = null;
    const scale = 2.5;
    const menuButton = [230, 415];
    const nextButton = [410, 415];
    const levelIncrement = 1;
    posData = [
      [
        menuButton[0],
        menuButton[1],
        "menuBtn",
        () => {
          game.phaser.paused = false;
          this.toMainMenu();
        },
      ],
      [
        nextButton[0],
        nextButton[1],

        "nextLvlBtn",
        () => {
          this.hideContent(game);
          this.toLevel(game.currentLevel.levelID + levelIncrement);
        },
      ],
    ];

    posData.map((key) => {
      this.addButton(key[0], key[1], key[2], key[3]).scale.setTo(scale, scale);
    });
  }

  addSprites(game) {
    var data = {
      sprite1: [160, 170, 0.6, 0.6],
      sprite2: [305, 250, 4, 4],
      sprite3: [305, 290, 4, 4],
    };
    this.addSprite(data.sprite1[0], data.sprite1[1], "LevelCompletedMenu").scale.setTo(
      data.sprite1[2],
      data.sprite1[3]
    );
    this.addSprite(data.sprite2[0], data.sprite2[1], "collectableBigMack").scale.setTo(
      data.sprite2[2],
      data.sprite2[3]
    );
    this.addSprite(data.sprite3[0], data.sprite3[1], "collectableLilPeanut").scale.setTo(
      data.sprite3[2],
      data.sprite3[3]
    );
  }
}

class Cutscene {
  constructor(numScenes, numHelpers, coordsHelpers) {
    this.currentIndex = 0;
    this.numCutScenes = numScenes;
    this.numHelpers = numHelpers;
    this.coordsHelpers = coordsHelpers;
    this.spacebarSprite = null;
  }

  nextCutscene = (key) => {
    const isRightSide =
      game.currentLevel.lilPeanut.obj.frame === 8 || game.currentLevel.lilPeanut.obj.frame === 9;
    let offSetXBig = 0;
    let offSetYBig = 0;
    let offSetXLil = 0;
    let offSetYLil = 0;
    let xBig = 0;
    let yBig = 0;
    let xLil = 0;
    let yLil = 0;
    const menuBoardsData = { quadro_coletaveis: [30, -2], quadro_menu_restart: [580, -2] };
    const levelStr = "level" + game.currentLevel.levelID.toString();

    if (isRightSide) {
      offSetXBig = -10;
      offSetYBig = -70;
      offSetXLil = -10;
      offSetYLil = -70;
      xBig =
        game.currentLevel.bigMack.obj.body.x +
        game.currentLevel.bigMack.obj.body.width +
        offSetXBig;
      yBig = game.currentLevel.bigMack.obj.body.y + offSetYBig;
      xLil =
        game.currentLevel.lilPeanut.obj.body.x +
        game.currentLevel.lilPeanut.obj.body.width +
        offSetXLil;
      yLil = game.currentLevel.lilPeanut.obj.body.y + offSetYLil;
    } else {
      offSetXBig = -230;
      offSetYBig = -70;
      offSetXLil = -230;
      offSetYLil = -70;
      xBig = game.currentLevel.bigMack.obj.body.x + offSetXBig;
      yBig = game.currentLevel.bigMack.obj.body.y + offSetYBig;
      xLil = game.currentLevel.lilPeanut.obj.body.x + offSetXLil;
      yLil = game.currentLevel.lilPeanut.obj.body.y + offSetYLil;
    }

    this.currentIndex += 1;
    this.currentScene.kill();
    this.currentScene.destroy();

    let nameCutScene =
      "cut-level" + game.currentLevel.levelID.toString() + "-" + this.currentIndex.toString();
    if (this.numCutScenes >= this.currentIndex) {
      if (this.currentIndex % 2 == 0) {
        var newScene = game.phaser.add.sprite(xBig, yBig, nameCutScene);
      } else {
        var newScene = game.phaser.add.sprite(xLil, yLil, nameCutScene);
      }
      this.currentScene = newScene;
    } else if (this.numHelpers + this.numCutScenes >= this.currentIndex) {
      var index = this.currentIndex - this.numCutScenes - 1;
      const x = this.coordsHelpers[index][0];
      const y = this.coordsHelpers[index][1];
      var newScene = game.phaser.add.sprite(x, y, nameCutScene);
      this.currentScene = newScene;
    } else {
      game.currentLevel.cutscene = null;
      key.onDown.removeAll();
      var date = new Date();
      game.currentLevel.timer.startTime = date.getTime();
      game.currentLevel.timer.timerAux = 0;
      this.spacebarSprite.destroy();
      this.spacebarSprite.kill();
      game.player[levelStr].cutscenesCheck = true;
      game.dataBaseSet();

      //ADCIONA BOARD PARA RESTART E MENU
      game.currentLevel.addCollectableBoards(
        menuBoardsData.quadro_coletaveis[0],
        menuBoardsData.quadro_coletaveis[1]
      );
      game.currentLevel.addMenuBoards(
        menuBoardsData.quadro_menu_restart[0],
        menuBoardsData.quadro_menu_restart[1]
      );
    }
  };

  handleCutscene(level) {
    const startCurrent = 0;
    if (this.currentIndex === startCurrent) {
      this.currentIndex += 1;
      this.startCutscene(level);
    }
  }

  startCutscene(level) {
    const initLilPeanutFrame = 8;
    const initLilPeanutFrame2 = 9;
    const isRightSide =
      game.currentLevel.lilPeanut.obj.frame === initLilPeanutFrame ||
      game.currentLevel.lilPeanut.obj.frame === initLilPeanutFrame2;
    let offSetXLil = 0;
    let offSetYLil = 0;
    let xLil = 0;
    let yLil = 0;
    if (isRightSide) {
      offSetXLil = -10;
      offSetYLil = -70;
      xLil =
        game.currentLevel.lilPeanut.obj.body.x +
        game.currentLevel.lilPeanut.obj.body.width +
        offSetXLil;
      yLil = game.currentLevel.lilPeanut.obj.body.y + offSetYLil;
    } else {
      offSetXLil = -230;
      offSetYLil = -70;
      xLil = game.currentLevel.lilPeanut.obj.body.x + offSetXLil;
      yLil = game.currentLevel.lilPeanut.obj.body.y + offSetYLil;
    }
    const scale = 2.5;
    const spacebarX = 110;
    const spacebarY = 480;
    let nameCutScene =
      "cut-level" + game.currentLevel.levelID.toString() + "-" + this.currentIndex.toString();
    var newScene = game.phaser.add.sprite(xLil, yLil, nameCutScene);
    this.currentScene = newScene;
    level.bigMack.restAnimation();
    level.lilPeanut.restAnimation();
    let keySPACE = game.phaser.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    keySPACE.onDown.add(this.nextCutscene, this);
    this.spacebarSprite = game.phaser.add.sprite(spacebarX, spacebarY, "spacebar");
    this.spacebarSprite.scale.setTo(scale, scale);
    this.spacebarSprite.smoothed = false;
  }
}

class Load extends Menu {
  constructor() {
    super();
  }

  addSprites() {
    var spriteData = [
      [0, 0, "menuBackground", 0.63, 0.85],
      [180, 100, "titleNotInline", 0.6, 0.6],
    ];
    var spacebarData = [170, 480, "pressSpacebar", 0.6, 0.6];
    var spacebarAlphaIni = 0;
    var spacebarAlphaFim = 1;
    var spacebarSpeed = 1000;
    var defaultValueIni = 0;
    var defaultValueFalse = 1000;

    spriteData.map((key) => {
      this.addSprite(key[0], key[1], key[2]).scale.setTo(key[3], key[4]);
    });

    var spacebarText = this.addSprite(spacebarData[0], spacebarData[1], spacebarData[2]);
    spacebarText.scale.setTo(spacebarData[3], spacebarData[4]);
    spacebarText.alpha = spacebarAlphaIni;
    game.phaser.add
      .tween(spacebarText)
      .to(
        { alpha: spacebarAlphaFim },
        spacebarSpeed,
        Phaser.Easing.Linear.None,
        true,
        defaultValueIni,
        defaultValueFalse,
        true
      );
  }
}

class EndOfGame extends Menu {
  constructor(num) {
    super();
    this.nTotal = num;
    this.currentIndex = 0;
    this.currentScene = null;
    this.lilPeanut = null;
    this.bigMack = null;
  }

  showCredits = (key) => {
    const timeSec = 6;
    const coords = { x: 160, y: 100 };
    const scale = 2;
    var creditsBoard = game.phaser.add.sprite(coords.x, coords.y, "credits");
    creditsBoard.scale.setTo(scale, scale);
    creditsBoard.smoothed = false;
    setTimeout(this.toMainMenu, timeSec * 1000);
  };

  nextScene = (key) => {
    const nameScene = "cut-end-" + String(this.currentIndex + 1);
    const timeSec = 1.5;
    let offSetXBig = -10;
    let offSetYBig = -70;
    let offSetXLil = -10;
    let offSetYLil = -70;
    let xBig = this.bigMack.body.x + this.bigMack.body.width + offSetXBig;
    let yBig = this.bigMack.body.y + offSetYBig;
    let xLil = this.lilPeanut.body.x + this.lilPeanut.body.width + offSetXLil;
    let yLil = this.lilPeanut.body.y + offSetYLil;
    if (this.currentScene === null) {
      let keySPACE = game.phaser.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
      keySPACE.onDown.add(this.nextScene, this);
    }
    if (this.currentScene) {
      this.currentScene.kill();
      this.currentScene.destroy();
    }
    if (this.nTotal > this.currentIndex) {
      if (this.currentIndex % 2 == 0) {
        var newScene = game.phaser.add.sprite(xBig, yBig, nameScene);
      } else {
        var newScene = game.phaser.add.sprite(xLil, yLil, nameScene);
      }
      this.currentScene = newScene;
    } else {
      key.onDown.removeAll();
      setTimeout(this.showCredits, timeSec * 1000);
    }
    this.currentIndex = this.currentIndex + 1;
  };

  startScene() {}

  start() {
    const coords = {
      menu: { x: 0, y: 0 },
      lilPeanut: { x: 500, y: 540 },
      bigMack: { x: 430, y: 540 },
    };
    const scaleX = 0.63;
    const scaleY = 0.85;
    const sideBig = "right";
    const sideLil = "right";
    const timeSec = 1;
    this.addSprite(coords.x, coords.y, "menuBackground").scale.setTo(scaleX, scaleY);
    var lilPeanutObj = game.placeCharacter(coords.lilPeanut.x, coords.lilPeanut.y, "lilPeanut");
    var newLilPeanut = new lilPeanut(lilPeanutObj, sideLil);
    newLilPeanut.obj.animations.play("restLeft");
    var bigMackObj = game.placeCharacter(coords.bigMack.x, coords.bigMack.y, "bigMack");
    var newBigMack = new bigMack(bigMackObj, sideBig);
    newBigMack.obj.animations.play("restRight");
    setTimeout(() => {
      this.nextScene(null);
    }, timeSec * 1000);
    this.lilPeanut = lilPeanutObj;
    this.bigMack = bigMackObj;
  }
}
