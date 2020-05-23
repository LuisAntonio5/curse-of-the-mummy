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
  }

  dataBaseSet(data) {
    // This function sets the info given by data to the object in the database
    //corresponding to the game.player instance. It assumes game.player exists
    game.player.docRef.set(data, { merge: true }).catch((err) => {
      console.log("error", err);
    });
  }

  dataBaseGet(name) {
    // Given a name, this function sets game.player data do the data
    //corresponding to the name in the databse or default values should
    //that name not yet exist, creating a new object
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
        } else {
          //Player does not exist
          var levelDefault = {
            collectablesBig: 0,
            collectablesPeanut: 0,
            score: 0,
            time: 0,
            cutscenesCheck: false,
          };
          docRef
            .set({
              name: name,
              score: 0,
              soundEffectsVolume: 5,
              gameMusicVolume: 5,
              menuMusicVolume: 5,
              level1: levelDefault,
              level2: levelDefault,
              level3: levelDefault,
              level4: levelDefault,
              totalScore: 0,
            })
            .then(() => {
              //DEFAULT

              game.player = new Player(
                name,
                5,
                5,
                5,
                levelDefault,
                levelDefault,
                levelDefault,
                levelDefault,
                0,
                docRef
              );
            })
            .catch((err) => {
              console.log("error setting document", err);
            });
        }
      })
      .catch((err) => {
        console.log("Error getting document", err);
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

  //TODO: MUDAR ISTO PARA CLASSE MAPA

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
      if (
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
              if (this.phaser.physics.arcade.collide(box, level.map.smallBox[i].data)) {
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
        )
      ) {
        if (
          level.bigMack.boxAnim == false &&
          !this.checkIfOnTopPartial(level.bigMack.obj, key.data)
        ) {
          level.bigMack.boxAnim = true;
          if (level.bigMack.obj.body.velocity.x > 0) level.bigMack.doBoxRightAnimation();
          else {
            level.bigMack.doBoxLeftAnimation();
          }
        }
      } else {
        level.bigMack.boxAnim = false;
      }
      //BIG BOX COM ELEVADOR
      for (var i = 0; i < level.map.elevators.length; i++) {
        this.phaser.physics.arcade.collide(key.data, level.map.elevators[i].data);
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
              if (this.phaser.physics.arcade.collide(box, level.map.bigBox[i].data)) {
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
          if (level.lilPeanut.obj.body.velocity.x > 0) level.lilPeanut.doBoxRightAnimation();
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
    }

    //LILPEANUT E BIGMACK COM SERRA
    for (var i = 0; i < level.map.eletricSaw.length; i++) {
      if (this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.eletricSaw[i].data)) {
        this.gameover(level, "lilpeanut");
      }

      if (this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.eletricSaw[i].data)) {
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
          this.gameover(level, "lilpeanut");
        }
      }
      if (this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.lavaBlocks[i].data)) {
        if (this.checkIfOnTopPartial(level.bigMack.obj, level.map.lavaBlocks[i].data)) {
          this.gameover(level, "bigmack");
        }
      }
    }

    //LILPEANUT E BIGMACK COM SPIKES
    for (var i = 0; i < level.map.spikes.length; i++) {
      if (this.phaser.physics.arcade.collide(level.lilPeanut.obj, level.map.spikes[i].data)) {
        this.gameover(level, "lilpeanut");
      }
      if (this.phaser.physics.arcade.collide(level.bigMack.obj, level.map.spikes[i].data)) {
        this.gameover(level, "bigmack");
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
    let countN = 0;
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
    level.map.elevators.map((key) => {
      if (key.num == 2) {
        //CHECKA 2 colisoes para subir
        if (
          this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
          this.checkIfOnTopTotal(level.bigMack.obj, key.data) &&
          key.data.body.y >= key.y
        ) {
          /*key.data.body.y >= key.maxY &&
          key.data.body.x <
            level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width &&
          key.data.body.x + key.data.body.width > level.lilPeanut.obj.body.x &&
          key.data.body.y >=
            level.lilPeanut.obj.body.y + level.lilPeanut.obj.body.height */
          key.elevatorUp(key, level.map.chains);
        } else {
          if (
            key.data.body.y <= key.minY &&
            !this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
            !this.checkIfOnTopTotal(level.bigMack.obj, key.data)
          )
            key.elevatorDown(key, level.map.chains);
          else {
            key.data.body.velocity.y = 0;
          }
        }
      } else {
        //CHEGA UMA COLISAO EM CIMA PARA SUBIR
        if (
          (this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) ||
            this.checkIfOnTopTotal(level.bigMack.obj, key.data)) &&
          key.data.body.y >= key.y
        ) {
          /*key.data.body.y >= key.maxY &&
          key.data.body.x <
            level.lilPeanut.obj.body.x + level.lilPeanut.obj.body.width &&
          key.data.body.x + key.data.body.width > level.lilPeanut.obj.body.x &&
          key.data.body.y >=
            level.lilPeanut.obj.body.y + level.lilPeanut.obj.body.height */
          key.elevatorUp(key, level.map.chains);
        } else {
          if (
            key.data.body.y <= key.minY &&
            !this.checkIfOnTopTotal(level.lilPeanut.obj, key.data) &&
            !this.checkIfOnTopTotal(level.bigMack.obj, key.data)
          )
            key.elevatorDown(key, level.map.chains);
          else {
            key.data.body.velocity.y = 0;
          }
        }
      }
    });
  }

  levelCompletedMenu(sprite, animation) {
    var levelCompletedMenu = new LevelCompletedMenu();
    levelCompletedMenu.addSprites();
    levelCompletedMenu.addButtons();
    levelCompletedMenu.addTexts();
  }

  gameOverMenu(sprite, animation) {
    var gameovermenu = new GameOverMenu();
    gameovermenu.addSprites(game);
    gameovermenu.addButtons(game);
    sprite.animations.play("gameoverMenu");
  }

  checkPlatformStatus(level) {
    level.map.platforms.map((key) => {
      if (key.num == 2) {
        //CHECKA 2 colisoes para subir
        if (
          this.checkIfOnTopPartial(level.lilPeanut.obj, key.data) &&
          this.checkIfOnTopPartial(level.bigMack.obj, key.data)
        ) {
          key.platformDown(key, level.map.chains);
          //key.press();
        } else {
          if (key.data.body.y >= key.minY) {
            key.platformUp(key, level.map.chains);
            //key.unpress();
          } else {
            key.data.body.velocity.y = 0;
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
            //key.unpress();
          } else {
            key.data.body.velocity.y = 0;
          }
          level.map.buttons.map((button) => {
            if (button.actionObj.constructor.name == "PlataformaMovel" && button.data.frame === 0) {
              key.unpress();
            }
          });
        }
      }
    });
  }

  checkLevers(level) {
    level.map.levers.map((key) => {
      console.log(key);

      if (key.data.frame == 0) {
        key.actionObj.down(key.actionObj, key.actionObj.chains);
      } else {
        key.actionObj.up(key.actionObj, key.actionObj.chains);
      }
    });
  }

  levelUpdate(level) {
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
          level.lilPeanut.obj.body.velocity.x = 0;
          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
            level.lilPeanut.doWalkRightAnimation();
          } else if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
            level.lilPeanut.doWalkLeftAnimation();
          } else {
            level.lilPeanut.restAnimation();
          }

          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
            const difLil = 5;
            level.lilPeanut.obj.body.setSize(11, 26 - difLil, 10, 5 + difLil);
            level.lilPeanut.crouch = true;
          } else {
            level.lilPeanut.obj.body.setSize(11, 26, 10, 5);
            level.lilPeanut.crouch = false;
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

          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.S)) {
            const difBig = 13;
            level.bigMack.obj.body.setSize(16, 42 - difBig, 24, 13 + difBig);
            level.bigMack.crouch = true;
          } else {
            level.bigMack.obj.body.setSize(16, 42, 24, 13);
            level.bigMack.crouch = false;
          }
          if (this.phaser.input.keyboard.isDown(Phaser.KeyCode.E)) {
            //CHECK SE HA OVERLAP COM ALGUMA LEVER
            level.map.levers.map((key) => {
              this.phaser.physics.arcade.overlap(
                level.bigMack.obj,
                key.data,
                (player, lever) => {
                  //SE EXISTIR OVERLAP
                  if (key.data.frame == 0) {
                    key.data.frame = 1;
                    //SET TIMER
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
                  if (key.data.frame == 0) {
                    key.data.frame = 1;
                    //SET TIMER
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
        }

        //TIMER UPDATE
        level.timer.updateTimer();

        //COLOCA SERRAS EM MOVIMENTO
        level.map.eletricSaw.map((key) => {
          key.moveSaw();
        });

        //CHECKA ALAVANCAS
        this.checkLevers(level);

        //CHECKA OVERLAP NOS OBJETOS QUE AINDA FORAM APANHADOS
        this.checkCollected(level);
      }
    } else if (level.animation === "COMPLETED") {
      const offset = 0.5;
      const offsetXLil = 30;
      const offsetXBig = 60;
      const bigMackDoorX =
        level.map.bigMackDoor.data.x + level.map.bigMackDoor.data.width / 2 - offsetXBig;
      const bigMackDoorY =
        level.map.bigMackDoor.data.y +
        level.map.bigMackDoor.data.height -
        level.bigMack.obj.body.height;
      const lilPeanutDoorX =
        level.map.lilPeanutDoor.data.x + level.map.lilPeanutDoor.data.width / 2 - offsetXLil;
      const lilPeanutDoorY =
        level.map.lilPeanutDoor.data.y +
        level.map.lilPeanutDoor.data.height -
        level.lilPeanut.obj.body.height;
      //COLOCA SERRAS EM MOVIMENTO
      level.map.eletricSaw.map((key) => {
        key.moveSaw();
      });

      level.bigMack.endAnimation(level, bigMackDoorX, bigMackDoorY);
      level.lilPeanut.endAnimation(level, lilPeanutDoorX, lilPeanutDoorY);

      if (
        level.bigMack.obj.body.velocity.x < offset &&
        level.lilPeanut.obj.body.velocity.x < offset
      ) {
        level.bigMack.doTurnAnimation();
        level.lilPeanut.doTurnAnimation();

        level.animation = "end";
      }

      //TIMER UPDATE
      level.timer.updateTimer();
      //TODO: SHOW MENU DE LEVEL COMPLETE
      //TODO: Velocidade a baixo de 0.05 começar a animaçao
    }
    this.collisionWithBounds(level);
    //ANIMA OS OBJECTOS TODOS
    this.animateAllObjects(level);

    if (debug) {
      level.debug();
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
    //APAGAR OS MENUS DAS BOARDS
    level.menuBoards.map((key) => {
      key.kill();
      key.destroy();
    });
    if (sprite == "lilpeanut") {
      level.stop("lilpeanut");
      level.lilPeanut.obj.body.gravity.y = 0;
      level.lilPeanut.obj.moves = false;
      level.lilPeanut.obj.x = xLil;
      level.lilPeanut.obj.y = yLil;
      level.lilPeanut.obj.scale.setTo(scaleLil, scaleLil);
      level.lilPeanut.obj.fixedToCamera = true;
      level.lilPeanut.obj.play("gameover");
      level.bigMack.obj.animations.stop();
    } else {
      level.stop("bigmack");
      level.bigMack.obj.body.gravity.y = 0;
      level.bigMack.obj.moves = false;
      level.bigMack.obj.x = xBig;
      level.bigMack.obj.y = yBig;
      level.bigMack.obj.scale.setTo(scaleBig, scaleBig);
      level.bigMack.obj.fixedToCamera = true;
      level.bigMack.obj.play("gameover");
      level.lilPeanut.obj.animations.stop();
    }
    //game.phaser.state.start("Level1");
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

class MapLevel {
  constructor() {
    this.bounds = null;
    this.boundsTest = [];
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
    game.phaser.physics.arcade.enable(box);
    this.addPhysicsToSprite(box, gravity);
    box.body.immovable = false;
    const newBox = new BigBox(x, y, box);
    this.bigBox.push(newBox);
  }

  addLava(x, y) {
    const scaleX = 4;
    const scaleY = 2.38;
    const gravity = 0;
    const newLava = this.addSpriteMap(x, y, scaleX, scaleY, "lava");
    this.addPhysicsToSprite(newLava, gravity);
    newLava.body.moves = false;
    newLava.body.setSize(8 * scaleX, 3 * scaleY, 0, 17);
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
    const newEletricSaw = new EletricSaw(x + 5, y, eletricSaw, maxX, maxY, velocity);
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

  addEletricSawVertical(x, y, maxX, maxY, velocity) {
    const gravity = 0;
    const scale = 3.5;
    const eletricSaw = game.phaser.add.sprite(x, y, "eletricSaw");
    game.phaser.physics.arcade.enable(eletricSaw);
    eletricSaw.body.gravity.y = gravity;
    eletricSaw.enableBody = true;
    eletricSaw.body.immovable = true;
    const newEletricSaw = new EletricSawVertical(x + 5, y, eletricSaw, maxX, maxY, velocity);
    eletricSaw.scale.setTo(scale, scale);
    eletricSaw.body.setCircle(10, 5, 5);
    eletricSaw.smoothed = false;
    this.eletricSaw.push(newEletricSaw);
  }

  addPlataformaMovel(x, y, num, maxX, minY, actionObj) {
    const platform = game.phaser.add.sprite(x, y, "elevator");
    game.phaser.physics.arcade.enable(platform);
    platform.body.gravity.y = 0;
    platform.enableBody = true;
    platform.body.immovable = true;
    const newElevator = new PlataformaMovel(x, y, platform, num, maxX, minY, actionObj);
    platform.scale.setTo(5, 2.5);
    platform.smoothed = false;
    this.platforms.push(newElevator);
  }

  addSlidingDoor(x, y, maxX, maxY, sizeX, sizeY, velocidade, inverted, chains) {
    const slidingDoor = game.phaser.add.sprite(x, y, "slidingDoor");
    game.phaser.physics.arcade.enable(slidingDoor);
    slidingDoor.body.gravity.y = 0;
    slidingDoor.enableBody = true;
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
    slidingDoor.scale.setTo(sizeX, sizeY);
    slidingDoor.smoothed = false;
    this.slidingDoors.push(newElevator);
  }
}

class Level {
  constructor(numCut, numHelpers, coordsHelpers) {
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
    //ADICIONAR AQUI A CONDIÇAO PARA MOSTRAR CUTSCENE
    console.log(numCut, numHelpers);

    if (numHelpers + numCut != 0) {
      this.cutscene = new Cutscene(numCut, numHelpers, coordsHelpers);
    }
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
      this.map[lista].filters = [gray];
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
    var pauseMenu = new PauseMenu();
    game.pauseMenu = pauseMenu;
    var board = game.phaser.add.button(x, y, "restartBoard", () => {
      game.phaser.state.start(game.phaser.state.current);
    });
    this.menuBoards.push(board);
    board.scale.setTo(scale, scale);
    board.smoothed = false;
    board.fixedToCamera = true;
    board = game.phaser.add.button(x + offSetX, y, "menuBoard", () => {
      var date = new Date();
      if (game.phaser.paused == true) {
        pauseMenu.hideContent(game);
        game.phaser.paused = false;
        game.currentLevel.timer.startTime = date.getTime();
      } else {
        game.phaser.paused = true;
        pauseMenu.showContent(game);
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

  initializeCharacters(game, xBigMack, yBigMack, xLil, yLil) {
    //character creation
    var lilPeanutObj = game.placeCharacter(xLil, yLil, "lilPeanut");
    this.lilPeanut = new lilPeanut(lilPeanutObj);

    var bigMackObj = game.placeCharacter(xBigMack, yBigMack, "bigMack");
    this.bigMack = new bigMack(bigMackObj);
  }

  debug() {
    game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    //game.phaser.debug.body(this.map.elevators[0].data, "rgba(0, 255, 0, 0.5)");
    //game.phaser.debug.body(this.map.smallBox[0].data, "rgba(255, 255, 0, 0.1)");
    // game.phaser.debug.body(this.map.bigBox[0].data, "rgba(255, 255, 0, 0.1)");
    // game.phaser.debug.body(this.lilPeanut.obj, "rgba(255, 255, 0, 0.1)");
    // game.phaser.debug.body(this.bigMack.obj, "rgba(255, 255, 0, 0.6)");
    // game.phaser.debug.body(this.map.buttons[0].data, "rgba(255, 255, 0, 0.6)");
    // game.phaser.debug.body(this.map.eletricSaw[0].data, "rgba(255, 255, 0, 0.6)");
    game.phaser.debug.body(this.map.lavaBlocks[0].data, "rgba(255, 255, 0, 0.6)");
    //game.phaser.debug.body(this.map.spikes[0].data, "rgba(255, 255, 0, 0.6)");
    game.phaser.debug.body(this.map.levers[0].data, "rgba(255, 255, 0, 0.6)");
  }
}

class Level1 extends Level {
  constructor(num, numHelpers, coordsHelpers) {
    super(num, numHelpers, coordsHelpers);
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
    this.map.background = background;
    //TOCHAS
    this.map.addTorchInverted(
      game.phaser.world.width - 75,
      game.phaser.world.height - 300,
      this.map
    );
    this.map.addTorch(-8, 100, this.map);

    //ELEVADOR
    //MAIOR INDICE MAIOR y
    for (var i = 0; i < 10; i++) {
      this.map.addChain(500, 550 - 19 * (18 - i), this.map.chains, true);
    }
    for (var i = 10; i < 19; i++) {
      this.map.addChain(500, 550 - 19 * (18 - i), this.map.chains, false);
    }
    this.map.addElevator(430, game.phaser.world.height - 216, 1, null, 562);

    //BOXES
    this.map.addBigBox(300, 250);
    this.map.addSmallBox(640, 250);

    //ELETRIC SAW
    this.map.addEletricSaw(160, 505, 280, 505, 400);
    //BOTOES
    this.map.addButton(90, 511, this.map.eletricSaw[nEletricSaw]);
    this.map.addButton(350, 511, this.map.eletricSaw[nEletricSaw]);
    //PLATAFORMAS
    this.map.platformsSprite = game.phaser.add.sprite(0, 0, "level1");

    //Adicionar os limites do mapa para as colisoes
    this.bounds = bounds;

    //PORTAS FINAIS
    this.map.addLilDoor(550, 132);
    this.map.addBigDoor(650, 82);

    //CIRA TIMER
    this.timer.createTimer();

    //BOARD PARA COLECTAVEIS
    this.addCollectableBoards(30, -2);

    //COLLECTAVEIS
    this.map.addCollectableLilPeanut(140, 220);
    this.map.addCollectableLilPeanut(387, 510);
    this.map.addCollectableLilPeanut(730, 510);
    this.map.addCollectableBigMack(370, 130);
    this.map.addCollectableBigMack(180, 490);
    this.map.addCollectableBigMack(460, 380);

    //BOARD PARA RESTART E MENU
    this.addMenuBoards(580, -2);
  }
}

class Level2 extends Level {
  constructor(num, numHelpers, coordsHelpers) {
    super(num, numHelpers, coordsHelpers);
  }
  drawMap() {
    var nEletricSaw = 0;
    var nPlataforma = 0;
    var levelData = {
      bounds: [
        //[x, y, comprimento, vertical]
        //pardes, teto e chao
        [0, 562, 800, false],
        [120, 198, 190, false],
        [120, 212, 190, false],
        [420, game.phaser.world.height - 402, 72, false],
        //plataforma de cima
        [420, game.phaser.world.height - 388, 72, false],
        [620, 198, 50, false],
        [620, 212, 50, false],
        //plataforma de baixo
        [740, 198, 50, false],
        [740, 212, 50, false],
        [0, 384, 375, false],
        //mini plataforma
        [425, 399, 375, false],
        [425, 384, 375, false],
        [0, 399, 375, false],
        [260, 55, 100, true],
        [245, 55, 100, true],
        [0, 54, 800, false],
        [16, 0, 600, true],
        [782, 0, 600, true],
      ],
      tochas: [
        //[x, y, inverted]
        [725, 290, true],
        [-8, 50, false],
      ],
      caixas: [],
      portas_deslizantes: [
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 4, 627, 217, 19, true],
          invisible_chains: [0, 0, 269, 215, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [617, 217, 617, 286, 2, 1.5, 50, true],
        },
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 0, 630, 60, 19, true],
          invisible_chains: [0, 0, 630, 60, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [10, 198, 110, 198, 10, 0.31, 50, true],
        },
      ],

      plataformas: [],
      serras: [
        //[x, y, maxX, maxY, move_speed, vertical]
        [300, 505, 500, 505, 200, false],
      ],
      botoes: [
        //[x, y, numero_item, tipo_item]
        [90, 333, 0, "slidingDoor"],
        [710, 147, 1, "slidingDoor"],
      ],
      coletaveis_peanut: [
        [740, 250],
        [475, 70],
        [750, 510],
      ],
      coletaveis_big: [
        [390, 300],
        [720, 510],
        [560, 300],
      ],
      lava: [
        [300, 160],
        [492, 160],
      ],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level2"],
      //[x, y]
      porta_pequena: [150, 496],
      porta_grande: [20, 446],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
    };

    var bounds = game.phaser.add.group();
    bounds.enableBody = true;
    this.bounds = bounds;

    // DRAW BOUNDS
    levelData.bounds.map((bound_coords) => {
      this.map.drawBound(
        bound_coords[0],
        bound_coords[1],
        bound_coords[2],
        bounds,
        bound_coords[3]
      );
    });

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
      nPlataforma++;
    });

    //BOXES
    levelData.caixas.map((caixa) => {
      if (caixa[2]) {
        this.map.addBigBox(caixa[0], caixa[1]);
      } else {
        this.map.addSmallBox(caixa[0], caixa[1]);
      }
    });

    // //ELETRIC SAW
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
      nEletricSaw++;
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
    this.map.addSpike(310, 320);
    this.map.addSpike(430, 320);

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

    //PORTAS FINAIS
    this.map.addLilDoor(levelData.porta_pequena[0], levelData.porta_pequena[1]);
    this.map.addBigDoor(levelData.porta_grande[0], levelData.porta_grande[1]);

    //CIRA TIMER
    this.timer.createTimer();

    //BOARD PARA COLECTAVEIS
    this.addCollectableBoards(levelData.quadro_coletaveis[0], levelData.quadro_coletaveis[1]);

    //BOARD PARA RESTART E MENU
    this.addMenuBoards(levelData.quadro_menu_restart[0], levelData.quadro_menu_restart[1]);

    //COLLECTAVEIS
    levelData.coletaveis_peanut.map((coletavel) => {
      this.map.addCollectableLilPeanut(coletavel[0], coletavel[1]);
    });

    levelData.coletaveis_big.map((coletavel) => {
      this.map.addCollectableBigMack(coletavel[0], coletavel[1]);
    });
  }
}
// drawMap(game) {
//   var nEletricSaw = 0;
//   var bounds = game.phaser.add.group();
//   bounds.enableBody = true;

//   //PASSR TUDO PARA A FUNÇAO DRAW BOUND
//   this.map.drawBound(0, game.phaser.world.height - 38, 800, bounds);
//   this.map.drawBound(0, game.phaser.world.height - 402, 300, bounds);
//   this.map.drawBound(0, game.phaser.world.height - 388, 300, bounds);
//   this.map.drawBound(420, game.phaser.world.height - 402, 72, bounds);
//   this.map.drawBound(420, game.phaser.world.height - 388, 72, bounds);
//   this.map.drawBound(620, game.phaser.world.height - 402, 50, bounds);
//   this.map.drawBound(620, game.phaser.world.height - 388, 50, bounds);
//   this.map.drawBound(740, game.phaser.world.height - 402, 50, bounds);
//   this.map.drawBound(740, game.phaser.world.height - 388, 50, bounds);
//   this.map.drawBound(0, game.phaser.world.height - 216, 375, bounds);
//   this.map.drawBound(425, game.phaser.world.height - 201, 375, bounds);
//   this.map.drawBound(425, game.phaser.world.height - 216, 375, bounds);
//   this.map.drawBound(0, game.phaser.world.height - 201, 375, bounds);
//   this.map.drawBound(0, game.phaser.world.height - 388, 280, bounds);
//   this.map.drawBound(620, game.phaser.world.height - 388, 190, bounds, 1);
//   this.map.drawBound(635, game.phaser.world.height - 388, 190, bounds, 1);
//   this.map.drawBound(260, 55, 100, bounds, 1);
//   this.map.drawBound(245, 55, 100, bounds, 1);
//   this.map.drawBound(0, 54, 800, bounds);
//   this.map.drawBound(16, 0, 600, bounds, 1);
//   this.map.drawBound(game.phaser.world.width - 18, 0, 600, bounds, 1);

//   var background = game.phaser.add.sprite(0, 0, "backgroundLevel");
//   background.scale.setTo(0.5, 0.5);
//   this.map.background = background;
//   //TOCHAS
//   this.map.addTorchInverted(
//     game.phaser.world.width - 75,
//     game.phaser.world.height - 300,
//     this.map
//   );
//   this.map.addTorch(-8, 100, this.map);

//   //ELETRIC SAW
//   this.map.addEletricSaw(300, 505, 500, 505, 200);
//   //BOTOES
//   this.map.addButton(90, 333, this);
//   this.map.addButton(710, 147, this);
//   //LAVA
//   this.map.addLava(300, 160);
//   this.map.addLava(492, 160);
//   //SPIKES
//   this.map.addSpike(310, 320);
//   this.map.addSpike(430, 320);
//   //PLATAFORMAS
//   this.map.platformsSprite = game.phaser.add.sprite(0, 0, "level2");

//   //Adicionar os limites do mapa para as colisoes
//   this.bounds = bounds;

//   //PORTAS FINAIS
//   this.map.addLilDoor(150, 496);
//   this.map.addBigDoor(20, 446);

//   //CIRA TIMER
//   this.timer.createTimer();

//   //BOARD PARA COLECTAVEIS
//   this.addCollectableBoards(30, -2);

//   //COLLECTAVEIS
//   this.map.addCollectableLilPeanut(740, 250);
//   this.map.addCollectableBigMack(390, 300);
//   this.map.addCollectableLilPeanut(475, 70);
//   this.map.addCollectableBigMack(720, 510);
//   this.map.addCollectableLilPeanut(750, 510);
//   this.map.addCollectableBigMack(560, 300);

//   //BOARD PARA RESTART E MENU
//   this.addMenuBoards(580, -2);
// }

class Level3 extends Level {
  constructor(num, numHelpers, coordsHelpers) {
    super(num, numHelpers, coordsHelpers);
  }

  drawMap(game) {
    var levelData = {
      bounds: [
        //[x, y, comprimento, vertical]
        //pardes, teto e chao
        [0, 562, 800, false],
        [0, 54, 800, false],
        [16, 0, 600, true],
        [782, 0, 600, true],
        //plataforma de cima
        [0, 198, 600, false],
        [0, 212, 600, false],
        [596, 200, 15, true],
        //plataforma de baixo
        [225, 384, 600, false],
        [225, 399, 600, false],
        [225, 385, 15, true],
        //mini plataforma
        [0, 430, 80, false],
        [0, 445, 80, false],
        [76, 430, 15, true],
      ],
      tochas: [
        //[x, y, inverted]
        [725, 100, true],
        [-8, 300, false],
      ],
      caixas: [
        //[x, y, grande]
        [450, 270, true],
      ],
      portas_deslizantes: [
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 0, 269, 215, 19, true],
          invisible_chains: [0, 5, 269, 215, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [260, 216, 260, 274, 2, 1.7, 50, true],
        },
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 7, 630, 60, 19, true],
          invisible_chains: [7, 14, 630, 60, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [621, 200, 621, 320, 2, 1, 103, true],
        },
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 0, 630, 60, 19, true],
          invisible_chains: [0, 0, 630, 60, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [120, -50, 120, 37, 2, 2.5, 80, true],
        },
      ],

      plataformas: [
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 19, 90, 208, 19, true],
          //[x, y, id, maxX, maxY]
          platform: [57, 550, 1, null, 500],
        },
      ],
      serras: [
        //[x, y, maxX, maxY, move_speed, vertical]
        [340, 500, 345, 570, 100, true],
      ],
      botoes: [
        //[x, y, numero_item, tipo_item]
        [250, 511, 0, "serra"],
        [300, 333, 0, "plataforma"],
      ],
      coletaveis_peanut: [
        [40, 150],
        [25, 510],
        [390, 270],
      ],
      coletaveis_big: [
        [75, 150],
        [25, 475],
        [700, 120],
      ],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level3"],
      //[x, y]
      porta_pequena: [250, 132],
      porta_grande: [340, 82],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
    };

    var nEletricSaw = 0;
    var nPlataforma = 0;
    var bounds = game.phaser.add.group();
    bounds.enableBody = true;

    // DRAW BOUNDS
    levelData.bounds.map((bound_coords) => {
      this.map.drawBound(
        bound_coords[0],
        bound_coords[1],
        bound_coords[2],
        bounds,
        bound_coords[3]
      );
    });

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
      nPlataforma++;
    });

    //BOXES
    levelData.caixas.map((caixa) => {
      if (caixa[2]) {
        this.map.addBigBox(caixa[0], caixa[1]);
      } else {
        this.map.addSmallBox(caixa[0], caixa[1]);
      }
    });

    // //ELETRIC SAW
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
      nEletricSaw++;
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
      }
    });

    //PLATAFORMAS
    this.map.platformsSprite = game.phaser.add.sprite(
      levelData.sprite_plataformas[0],
      levelData.sprite_plataformas[1],
      levelData.sprite_plataformas[2]
    );

    //Adicionar os limites do mapa para as colisoes
    this.bounds = bounds;

    //PORTAS FINAIS
    this.map.addLilDoor(levelData.porta_pequena[0], levelData.porta_pequena[1]);
    this.map.addBigDoor(levelData.porta_grande[0], levelData.porta_grande[1]);

    //CIRA TIMER
    this.timer.createTimer();

    //BOARD PARA COLECTAVEIS
    this.addCollectableBoards(levelData.quadro_coletaveis[0], levelData.quadro_coletaveis[1]);

    //BOARD PARA RESTART E MENU
    this.addMenuBoards(levelData.quadro_menu_restart[0], levelData.quadro_menu_restart[1]);

    //COLLECTAVEIS
    levelData.coletaveis_peanut.map((coletavel) => {
      this.map.addCollectableLilPeanut(coletavel[0], coletavel[1]);
    });

    levelData.coletaveis_big.map((coletavel) => {
      this.map.addCollectableBigMack(coletavel[0], coletavel[1]);
    });
  }
}

class Level4 extends Level {
  constructor(num, numHelpers, coordsHelpers) {
    super(num, numHelpers, coordsHelpers);
  }

  drawMap(game) {
    var levelData = {
      bounds: [
        //[x, y, comprimento, vertical]
        //pardes, teto e chao

        [0, 562, 70, false],
        [200, 562, 400, false],
        [730, 562, 100, false],

        [0, 54, 800, false],
        [16, 0, 600, true],
        [782, 0, 600, true],
        //plataforma de cima esquerda
        [0, 198, 300, false],
        [0, 212, 300, false],
        [296, 200, 15, true],
        //plataforma de cima direita
        [500, 198, 300, false],
        [500, 212, 300, false],
        [500, 200, 15, true],
        //plataforma de baixo esquerda
        [0, 384, 300, false],
        [0, 399, 300, false],
        [296, 385, 15, true],
        //plataforma de baixo direita
        [500, 384, 300, false],
        [500, 399, 300, false],
        [500, 385, 15, true],
      ],
      tochas: [
        //[x, y, inverted]
        [725, 50, true],
        [-8, 250, false],
        [-8, 50, false],
        [725, 250, true],
      ],
      caixas: [
        //[x, y, grande]
      ],
      portas_deslizantes: [
        //ESTATICAS
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 0, 269, 215, 19, true],
          invisible_chains: [0, 0, 269, 215, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [620, 58, 260, 274, 2, 1.5, 50, true],
        },
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 0, 269, 215, 19, true],
          invisible_chains: [0, 0, 269, 215, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [150, 58, 260, 274, 2, 1.25, 50, true],
        },
        //DINAMICAS
        {
          //[start i, end i, x, y_static, y_dynamic, visible]

          visible_chains: [0, 4, 584, 215, 19, true],
          invisible_chains: [0, 0, 0, 0, 0, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [575, 210, 575, 290, 2, 1.45, 50, true],
        },
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 4, 179, 215, 19, true],
          invisible_chains: [0, 0, 0, 0, 0, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          porta: [170, 210, 170, 290, 2, 1.45, 50, true],
        },
      ],
      plataformas: [],
      serras: [
        //[x, y, maxX, maxY, move_speed, vertical]
      ],
      botoes: [
        //[x, y, numero_item, tipo_item]
      ],
      coletaveis_peanut: [
        [530, 300],
        [655, 450],
        [230, 120],
      ],
      coletaveis_big: [
        [230, 300],
        [125, 450],
        [530, 120],
      ],
      lava: [
        [72, 524],
        [602, 524],
      ],
      lever: [
        [40, 100, 3, 2],
        [670, 110, 3, 3],
      ],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level4"],
      //[x, y]
      porta_pequena: [70, 316],
      porta_grande: [630, 267],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
    };

    var nEletricSaw = 0;
    var nPlataforma = 0;
    var bounds = game.phaser.add.group();
    bounds.enableBody = true;

    // DRAW BOUNDS
    levelData.bounds.map((bound_coords) => {
      this.map.drawBound(
        bound_coords[0],
        bound_coords[1],
        bound_coords[2],
        bounds,
        bound_coords[3]
      );
    });

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

    //ELEVADOR
    //MAIOR INDICE MAIOR y
    for (var i = 0; i < 6; i++) {
      this.map.addChain(390, 400 - 19 * (18 - i), this.map.chains, true);
    }
    for (var i = 6; i < 27; i++) {
      this.map.addChain(390, 400 - 19 * (18 - i), this.map.chains, false);
    }
    this.map.addElevator(320, 198, 2, null, 562);

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
      nPlataforma++;
    });

    //BOXES
    levelData.caixas.map((caixa) => {
      if (caixa[2]) {
        this.map.addBigBox(caixa[0], caixa[1]);
      } else {
        this.map.addSmallBox(caixa[0], caixa[1]);
      }
    });

    // //ELETRIC SAW
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
      nEletricSaw++;
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
      }
    });

    //LAVA
    levelData.lava.map((lava_coords) => {
      this.map.addLava(lava_coords[0], lava_coords[1]);
    });

    //LEVERS
    levelData.lever.map((lever_coords) => {
      this.map.addLever(lever_coords[0], lever_coords[1], lever_coords[2], lever_coords[3]);
    });

    //PLATAFORMAS
    this.map.platformsSprite = game.phaser.add.sprite(
      levelData.sprite_plataformas[0],
      levelData.sprite_plataformas[1],
      levelData.sprite_plataformas[2]
    );

    //Adicionar os limites do mapa para as colisoes
    this.bounds = bounds;

    //PORTAS FINAIS
    this.map.addLilDoor(levelData.porta_pequena[0], levelData.porta_pequena[1]);
    this.map.addBigDoor(levelData.porta_grande[0], levelData.porta_grande[1]);

    //CIRA TIMER
    this.timer.createTimer();

    //BOARD PARA COLECTAVEIS
    this.addCollectableBoards(levelData.quadro_coletaveis[0], levelData.quadro_coletaveis[1]);

    //BOARD PARA RESTART E MENU
    this.addMenuBoards(levelData.quadro_menu_restart[0], levelData.quadro_menu_restart[1]);

    //COLLECTAVEIS
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

  endAnimation(level, x, y) {
    if (this.obj.body.x <= x) {
      //ANDA PARA LADO DIREITO
      this.obj.play("walkRight");
    } else {
      this.obj.play("walkLeft");
    }
    game.phaser.physics.arcade.moveToXY(this.obj, x, y, 10, 300);
  }
}

class bigMack extends Character {
  constructor(charObj) {
    let animWalkingEnd = [24, 25, 26];
    for (let i = 0; i < 2; i++) {
      animWalkingEnd = animWalkingEnd.concat(animWalkingEnd);
    }
    super(charObj);
    this.boxAnim = false;
    charObj.body.setSize(16, 42, 24, 13);
    charObj.animations.add("walkLeft", [5, 6, 7, 8, 9], 11, false);
    charObj.animations.add("walkRight", [0, 1, 2, 3, 4], 11, false);

    charObj.animations.add("restRight", [10, 11], 4, true);
    charObj.animations.add("restLeft", [12, 13], 4, true);
    charObj.animations.add("restCrouchLeft", [46, 47], 4, true);
    charObj.animations.add("restCrouchRight", [43, 44], 4, true);

    charObj.animations.add("boxRight", [14, 15], 10, false);
    charObj.animations.add("boxLeft", [21, 20], 10, false);
    charObj.animations.add("walkBoxRight", [15, 16, 17], 10, true);
    charObj.animations.add("walkBoxLeft", [20, 19, 18], 10, true);
    charObj.animations.add("walkCrouchLeft", [46, 47, 48], 10, true);
    charObj.animations.add("walkCrouchRight", [43, 44, 45], 10, true);

    charObj.animations.add(
      "endAnimationLeft",
      [28, 27, 24].concat(animWalkingEnd).concat([29, 30, 31, 32, 33, 34]),
      10,
      false
    );

    charObj.animations.add(
      "endAnimationRight",
      [22, 23, 24].concat(animWalkingEnd).concat([29, 30, 31, 32, 33, 34]),
      10,
      false
    );
    1;

    let anim = charObj.animations.add("gameover", [35, 36, 37, 37, 37, 36, 38, 39, 40], 8, false);
    anim.onComplete.add(game.gameOverMenu, this);

    charObj.animations.add("gameoverMenu", [41, 42], 6, true);
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

class lilPeanut extends Character {
  constructor(charObj) {
    let animWalkingEnd = [20, 21, 22];
    for (let i = 0; i < 2; i++) {
      animWalkingEnd = animWalkingEnd.concat(animWalkingEnd);
    }
    super(charObj);
    this.boxAnim = false;
    charObj.body.setSize(11, 26, 10, 5);
    charObj.frame = 3;
    charObj.animations.add("walkLeft", [0, 1, 2], 10, true);
    charObj.animations.add("walkRight", [3, 4, 5], 10, true);
    charObj.animations.add("jump", [7], 1, true);
    charObj.animations.add("restRight", [8, 9], 5, true);
    charObj.animations.add("restLeft", [10, 11], 5, true);
    charObj.animations.add("restCrouchLeft", [39, 40], 4, true);
    charObj.animations.add("restCrouchRight", [7, 42], 4, true);
    charObj.animations.add("boxRight", [12, 13], 10, false);
    charObj.animations.add("boxLeft", [15, 16], 10, false);
    charObj.animations.add("walkBoxRight", [13, 14], 10, true);
    charObj.animations.add("walkBoxLeft", [16, 17], 10, true);
    charObj.animations.add("walkCrouchLeft", [39, 40, 41], 10, true);
    charObj.animations.add("walkCrouchRight", [7, 42, 43], 10, true);
    //charObj.animations.add("walkCrouchLeft", [16, 17], 10, true);
    let anim = charObj.animations.add(
      "endAnimationLeft",
      [23, 24, 20].concat(animWalkingEnd).concat([25, 26, 27, 28, 29, 30, 31]),
      10,
      false
    );

    anim.onComplete.add(game.levelCompletedMenu, this);
    anim = charObj.animations.add(
      "endAnimationRight",
      [18, 19, 20].concat(animWalkingEnd).concat([25, 26, 27, 28, 29, 30, 31]),
      10,
      false
    );
    anim.onComplete.add(game.levelCompletedMenu, this);
    //charObj.animations.add("crouch", [16, 17], 10, true);
    anim = charObj.animations.add("gameover", [32, 33, 34, 34, 34, 33, 35, 36, 37], 8, false);
    anim.onComplete.add(game.gameOverMenu, this);
    charObj.animations.add("gameoverMenu", [38, 37], 6, true);
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

  doWalkRightAnimation() {
    this.obj.body.velocity.x = 200;
    if (this.boxAnim == false) {
      if (this.crouch) {
        this.obj.play("walkCrouchRight");
      } else {
        this.obj.play("walkRight");
      }
    } else {
      this.obj.play("walkBoxRight");
    }
    this.lastAnimation = "right";
  }

  jump() {
    this.obj.play("jump");
    this.obj.body.velocity.y = -380;
  }

  doBoxRightAnimation() {
    this.obj.play("boxRight");
  }

  doBoxLeftAnimation() {
    this.obj.play("boxLeft");
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

class Lava extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
    this.data.animations.add("animation", [0, 1, 2], 5, true);
    this.data.play("animation");
  }
}

class Lever extends Sprite {
  constructor(x, y, data, timeToReset, actionObjIndex) {
    super(x, y, data);
    this.timeToReset = timeToReset * 1000;
    console.log(game.currentLevel.map.slidingDoors[actionObjIndex]);
    console.log(game.currentLevel.map.slidingDoors);

    this.actionObj = game.currentLevel.map.slidingDoors[actionObjIndex];
  }

  resetLever = () => {
    this.data.frame = 0;
  };
}

class Spike extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class Elevator extends Sprite {
  constructor(x, y, data, num, maxX, minY) {
    super(x, y, data);
    this.num = num;
    this.maxX = maxX;
    this.minY = minY;
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
}

class PlataformaMovel extends Sprite {
  constructor(x, y, data, num, maxX, minY, actionObj) {
    super(x, y, data);
    this.num = num;
    this.maxX = maxX;
    this.minY = minY;
    this.actionObj = actionObj;
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
    this.maxX = maxX;
    this.maxY = maxY;
    this.velocity = velocity;
    this.stop = false;
    data.animations.add("rotate", [0, 1, 2], 8, true);
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
  }

  buttonPressed() {
    if (this.actionObj.constructor.name === "EletricSaw") {
      //PARA A SAW
      this.data.frame = 1;
      this.actionObj.press();
    } else if (this.actionObj.constructor.name === "EletricSawVertical") {
      this.data.frame = 1;
      this.actionObj.press();
    } else if (this.actionObj.constructor.name === "PlataformaMovel") {
      this.data.frame = 1;
      this.actionObj.press();
    } else if (this.actionObj.constructor.name === "SlidingDoor") {
      this.data.frame = 1;

      if (this.actionObj.x == this.actionObj.maxX) {
        this.actionObj.up(this.actionObj, this.actionObj.chains);
      } else if (this.actionObj.y == this.actionObj.maxY) {
        this.actionObj.right(this.actionObj);
      }
    }
  }

  buttonUnpressed() {
    if (this.actionObj.constructor.name === "EletricSaw") {
      this.data.frame = 0;
      this.actionObj.unpress();
    } else if (this.actionObj.constructor.name === "EletricSawVertical") {
      this.data.frame = 0;
      this.actionObj.unpress();
    } else if (this.actionObj.constructor.name === "PlataformaMovel") {
      this.data.frame = 0;
      this.actionObj.unpress();
    } else if (this.actionObj.constructor.name === "SlidingDoor") {
      this.data.frame = 0;

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
    this.timerAux = 0;
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
        this["slot" + String(i)][k] = game.phaser.add.sprite(xCoords[i - 1], yCoord, String(k));
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
    if (!game.currentLevel.cutscene) {
      var date = new Date();
      var currentTime = date.getTime();
      var timerValue = Math.round((currentTime - this.startTime) / 1000) + this.timerAux;
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
    if (Math.round(platform.data.body.x) < this.maxX) {
      platform.data.body.velocity.x = this.velocidade;
    } else {
      platform.data.body.velocity.x = 0;
    }
  }

  left(platform) {
    if (Math.round(platform.data.body.x) > this.x) {
      platform.data.body.velocity.x = -this.velocidade;
    } else {
      platform.data.body.velocity.x = 0;
    }
  }

  up(platform, chains) {
    if (Math.round(platform.data.body.y) >= this.y) {
      platform.data.body.velocity.y = -this.velocidade;
    } else {
      platform.data.body.velocity.y = 0;
    }
    chains.map((key, index) => {
      if (platform.data.body.y < key.data.y) {
        key.data.visible = false;
      }
    });
  }

  down(platform, chains) {
    if (Math.round(platform.data.body.y) <= this.maxY) {
      platform.data.body.velocity.y = this.velocidade;
    } else {
      platform.data.body.velocity.y = 0;
    }

    chains.map((key) => {
      if (platform.data.body.y >= key.y && key.data.visible === false) {
        key.data.visible = true;
      }
    });
  }
}

class Menu {
  constructor() {
    this.buttons = [];
    this.sprites = [];
    this.texts = [];
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
    game.phaser.state.start("Options");
  }

  toStart() {
    game.phaser.state.start("Level1");
  }

  toLevel(level) {
    game.phaser.state.start("Level" + level.toString());
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
    } else {
      this.this.toMainMenu();
    }
  }

  setVolume(sound, volume, y) {
    if (volume <= 10 && volume >= 0) {
      if (sound == this.SoundEffectsFilledSoundBars) {
        this.soundEffectsVolume = volume;
        game.player.soundEffectsVolume = volume;
      } else if (sound == this.GameMusicFilledSoundBars) {
        this.gameMusicVolume = volume;
        game.player.gameMusicVolume = volume;
      } else if (sound == this.MenuMusicFilledSoundBars) {
        this.menuMusicVolume = volume;
        game.player.menuMusicVolume = volume;
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
      this.this.setVolume(this.this.GameMusicFilledSoundBars, this.this.gameMusicVolume - 1, 297);
    } else if (this.y == 450) {
      this.this.setVolume(this.this.MenuMusicFilledSoundBars, this.this.menuMusicVolume - 1, 447);
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
      this.this.setVolume(this.this.GameMusicFilledSoundBars, this.this.gameMusicVolume + 1, 297);
    } else if (this.y == 450) {
      this.this.setVolume(this.this.MenuMusicFilledSoundBars, this.this.menuMusicVolume + 1, 447);
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
    this.addButton(210, 150, "SoundLess", this.decreaseVolume).scale.setTo(1.5, 1.5);
    this.addButton(210, 300, "SoundLess", this.decreaseVolume).scale.setTo(1.5, 1.5);
    this.addButton(210, 450, "SoundLess", this.decreaseVolume).scale.setTo(1.5, 1.5);

    this.addButton(605, 150, "SoundPlus", this.increaseVolume).scale.setTo(1.5, 1.5);
    this.addButton(605, 300, "SoundPlus", this.increaseVolume).scale.setTo(1.5, 1.5);
    this.addButton(605, 450, "SoundPlus", this.increaseVolume).scale.setTo(1.5, 1.5);

    this.addButton(680, 150, "SoundOff", this.muteVolume).scale.setTo(1.5, 1.5);
    this.addButton(680, 300, "SoundOff", this.muteVolume).scale.setTo(1.5, 1.5);
    this.addButton(680, 450, "SoundOff", this.muteVolume).scale.setTo(1.5, 1.5);

    //back button nao tem de ser necessariamente de volta para o main menu
    this.addButton(50, 30, "backBtn", this.exitOptions).scale.setTo(2.8, 2.8);

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(285 + 30 * i, 147, "SoundBarEmpty", this.changeVolume);
      bar.scale.setTo(2.5, 2.2);
      this.SoundEffectsEmptySoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(285 + 30 * i, 147, "SoundBarFilled", this.changeVolume);
      bar.scale.setTo(2.6, 2.2);

      this.SoundEffectsFilledSoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(285 + 30 * i, 297, "SoundBarEmpty", this.changeVolume);
      bar.scale.setTo(2.5, 2.2);
      this.GameMusicEmptySoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(285 + 30 * i, 297, "SoundBarFilled", this.changeVolume);
      bar.scale.setTo(2.6, 2.2);
      this.GameMusicFilledSoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(285 + 30 * i, 447, "SoundBarEmpty", this.changeVolume);
      bar.scale.setTo(2.5, 2.2);
      this.MenuMusicEmptySoundBars.push(bar);
    }

    for (let i = 0; i < 10; i++) {
      var bar = this.addButton(285 + 30 * i, 447, "SoundBarFilled", this.changeVolume);
      bar.scale.setTo(2.6, 2.2);
      this.MenuMusicFilledSoundBars.push(bar);
    }

    this.setVolume(this.SoundEffectsFilledSoundBars, this.soundEffectsVolume, 147);
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
    this.addButton(330, 200, "startBtn", this.toLevelSelector).scale.setTo(2.8, 2.8);
    this.addButton(330, 270, "optionsBtn", this.toOptions).scale.setTo(2.8, 2.8);
    this.addButton(330, 340, "helpBtn", this.toHelp).scale.setTo(2.8, 2.8);
    this.addButton(330, 410, "rankingBtn", this.toRanking).scale.setTo(2.8, 2.8);
  }
}
class Ranking extends Menu {
  constructor() {
    super();
    this.rankings = [];
  }

  addText(game) {
    var t1 = game.phaser.add.bitmapText(50, 150, "myfont", "1-                      PTS", 32);
    this.rankings.push(t1);
    var t2 = game.phaser.add.bitmapText(50, 220, "myfont", "2-                      PTS", 32);
    this.rankings.push(t2);
    var t3 = game.phaser.add.bitmapText(50, 290, "myfont", "3-                      PTS", 32);
    this.rankings.push(t3);
    var t4 = game.phaser.add.bitmapText(50, 360, "myfont", "4-                      PTS", 32);
    this.rankings.push(t4);
    var t5 = game.phaser.add.bitmapText(50, 430, "myfont", "5-                      PTS", 32);
    this.rankings.push(t5);
    this.loadRankings();
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(45, -255, "rankingInline").scale.setTo(0.6, 0.6);
  }

  addButtons(game) {
    this.addButton(50, 30, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);
  }

  loadRankings() {
    var rankings = this.rankings;
    db.collection("players")
      .orderBy("score", "desc")
      .limit(5)
      .get()
      .then(function (querySnapshot) {
        let i = 0;
        querySnapshot.forEach(function (doc) {
          let score = String(doc.data().score);
          rankings[i].setText(
            rankings[i]._text.slice(0, 3) +
              doc.data().name +
              " ".repeat(20 - doc.data().name.length - score.length) +
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
    } else {
      this.toMainMenu();
    }
  }

  addTexts(game, t1, t2, t3, t4, t5, t6) {
    this.addBitmapText(50, 200, t1, 32);
    this.addBitmapText(185, 300, t2, 12);
    this.addBitmapText(250, 300, t3, 12);
    this.addBitmapText(115, 460, t4, 12);
    this.addBitmapText(260, 460, t5, 12);
    this.addBitmapText(180, 460, t6, 12);
    this.addBitmapText(560, 300, t2, 12);
    this.addBitmapText(430, 300, t3, 12);
    this.addBitmapText(495, 460, t4, 12);
    this.addBitmapText(635, 460, t5, 12);
    this.addBitmapText(555, 460, t6, 12);
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
    this.addButton(50, 30, "backBtn", this.toExitHelp).scale.setTo(2.8, 2.8);
  }
}

class LevelSelector extends Menu {
  constructor() {
    super();
  }

  addSprites() {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(20, -155, "levelsInline").scale.setTo(0.6, 0.6);
    this.addSprite(65, 170, "pyramidLevelSelector").scale.setTo(0.7, 0.7);
    //lvl1
    this.addSprite(260, 380, "collectableBigMack").scale.setTo(3, 3);
    this.addSprite(260, 400, "collectableLilPeanut").scale.setTo(3, 3);
    //lvl2
    this.addSprite(600, 380, "collectableBigMack").scale.setTo(3, 3);
    this.addSprite(600, 400, "collectableLilPeanut").scale.setTo(3, 3);
    //lvl3
    this.addSprite(260, 235, "collectableBigMack").scale.setTo(3, 3);
    this.addSprite(260, 255, "collectableLilPeanut").scale.setTo(3, 3);
    //lvl4
    this.addSprite(600, 235, "collectableBigMack").scale.setTo(3, 3);
    this.addSprite(600, 255, "collectableLilPeanut").scale.setTo(3, 3);
  }
  // TO-DO: DEPOIS DE REESTRUTURAR BD, METER OS COLECTAVEIS, SCORE E TIMERS DINAMICOS
  addTexts() {
    this.addBitmapText(
      530,
      35,
      "TOTAL SCORE:\n  " + "1500" + " PTS",
      //String(game.player.score)
      24
    );
    //lvl1
    this.addBitmapText(310, 380, String(1) + " / 3", 16);
    this.addBitmapText(310, 400, String(1) + " / 3", 16);
    this.addBitmapText(260, 423, "TIME:" + String(1000), 16);
    this.addBitmapText(260, 440, "SCORE:" + String(163), 16);
    //lvl2
    this.addBitmapText(650, 380, String(1) + " / 3", 16);
    this.addBitmapText(650, 400, String(1) + " / 3", 16);
    this.addBitmapText(600, 423, "TIME:" + String(1000), 16);
    this.addBitmapText(600, 440, "SCORE:" + String(163), 16);
    //lvl3
    this.addBitmapText(310, 235, String(1) + " / 3", 16);
    this.addBitmapText(310, 255, String(1) + " / 3", 16);
    this.addBitmapText(260, 278, "TIME:" + String(1000), 16);
    this.addBitmapText(260, 295, "SCORE:" + String(163), 16);
    //lvl4
    this.addBitmapText(650, 235, String(1) + " / 3", 16);
    this.addBitmapText(650, 255, String(1) + " / 3", 16);
    this.addBitmapText(600, 278, "TIME:" + String(1000), 16);
    this.addBitmapText(600, 295, "SCORE:" + String(163), 16);
  }

  addButtons() {
    this.addButton(40, 30, "backBtn", this.toMainMenu).scale.setTo(2.8, 2.8);
    this.addButton(85, 375, "lvl1", this.toStart).scale.setTo(0.65, 0.65);
    this.addButton(425, 375, "lvl1", () => {
      this.toLevel(2);
    }).scale.setTo(0.65, 0.65);
    this.addButton(85, 230, "lvl1", this.toStart).scale.setTo(0.65, 0.65);
    this.addButton(425, 230, "lvl1", () => {
      this.toLevel(2);
    }).scale.setTo(0.65, 0.65);
  }
}

class GameOverMenu extends Menu {
  constructor() {
    super();
  }

  addButtons(game) {
    this.addButton(361, 340, "quitBtn", () => {
      game.phaser.paused = false;
      this.toMainMenu();
    }).scale.setTo(2.5, 2.5);
    this.addButton(361, 270, "restartBtn", () => {
      game.phaser.paused = false;
      game.phaser.state.start(game.phaser.state.current);
    }).scale.setTo(2.5, 2.5);
  }

  addSprites(game) {
    this.addSprite(240, 180, "GameOverMenu").scale.setTo(0.5, 0.5);
  }
}

class NameInput extends Menu {
  constructor() {
    super();
    this.input = null;
  }

  addSprites(game) {
    this.addSprite(0, 0, "menuBackground").scale.setTo(0.63, 0.85);
    this.addSprite(125, 280, "inputBox");
  }

  addButtons(game) {
    this.addButton(300, 450, "submitBtn", this.getName).scale.setTo(2.8, 2.8);
  }

  inputFocus(sprite) {
    sprite.canvasInput.focus();
  }

  addInput(game) {
    const inputFieldValue = document.getElementById("name-input");
    inputFieldValue.addEventListener("keyup", (event) => {
      if (event.keyCode === 13) {
        this.getName();
      }
    });
  }

  addText(game, t) {
    var text = game.phaser.add.bitmapText(90, 150, "myfont", t, 32);
    text.align = "center";
  }

  getName() {
    //firebase request
    const inputFieldValue = document.getElementById("name-input");

    if (inputFieldValue.value != "") {
      game.dataBaseGet(inputFieldValue.value);
      inputFieldValue.style.display = "none";
      inputFieldValue.disabled = true;
      this.toMainMenu();
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
    this.addButton(420, 342, "quitBtn", () => {
      game.phaser.paused = false;
      this.toMainMenu();
    }).scale.setTo(2.5, 2.5);
    this.addButton(240, 260, "helpBtn", () => {
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
    }).scale.setTo(2.5, 2.5);
    this.addButton(420, 260, "optionsBtn", () => {
      var pauseOptionsMenu = new Options();
      pauseOptionsMenu.addSprites(game);
      pauseOptionsMenu.addButtons(game);
    }).scale.setTo(2.5, 2.5);
    this.addButton(240, 340, "backBtn", () => {
      this.hideContent(game);
      game.phaser.paused = false;
      //AQUI
      var date = new Date();
      game.currentLevel.timer.startTime = date.getTime();
    }).scale.setTo(2.5, 2.5);
  }

  addSprites(game) {
    this.addSprite(210, 180, "pauseMenu").scale.setTo(0.5, 0.5);
  }
}

class LevelCompletedMenu extends Menu {
  constructor() {
    super();
  }

  addTexts() {
    this.addBitmapText(385, 252, String(game.currentLevel.nLilPeanutCollected) + " / 3", 20);
    this.addBitmapText(385, 292, String(game.currentLevel.nLilPeanutCollected) + " / 3", 20);
    this.addBitmapText(305, 332, "TIME:" + String(game.currentLevel.timer.minutes), 20);
    this.addBitmapText(305, 372, "SCORE:" + String(123), 20);
  }

  addButtons() {
    this.addButton(410, 417, "quitBtn", () => {
      game.phaser.paused = false;
      this.toMainMenu();
    }).scale.setTo(2.5, 2.5);
    this.addButton(230, 415, "backBtn", () => {
      this.hideContent(game);
      game.phaser.paused = false;
    }).scale.setTo(2.5, 2.5);
  }

  addSprites(game) {
    this.addSprite(160, 170, "LevelCompletedMenu").scale.setTo(0.6, 0.6);
    this.addSprite(305, 250, "collectableBigMack").scale.setTo(4, 4);
    this.addSprite(305, 290, "collectableLilPeanut").scale.setTo(4, 4);
  }
}

class Cutscene {
  constructor(numScenes, numHelpers, coordsHelpers) {
    console.log(numHelpers);
    console.log(coordsHelpers);

    this.currentIndex = 0;
    this.numCutScenes = numScenes;
    this.numHelpers = numHelpers;
    this.coordsHelpers = coordsHelpers;
    this.spacebarSprite = null;
  }

  nextCutscene = (key) => {
    const offSetXBig = -10;
    const offSetYBig = -70;
    const offSetXLil = -10;
    const offSetYLil = -70;
    const xBig =
      game.currentLevel.bigMack.obj.body.x + game.currentLevel.bigMack.obj.body.width + offSetXBig;
    const yBig = game.currentLevel.bigMack.obj.body.y + offSetYBig;
    const xLil =
      game.currentLevel.lilPeanut.obj.body.x +
      game.currentLevel.lilPeanut.obj.body.width +
      offSetXLil;
    const yLil = game.currentLevel.lilPeanut.obj.body.y + offSetYLil;
    this.currentIndex += 1;
    this.currentScene.kill();
    this.currentScene.destroy();
    //TODO: METER AQUI O NOME DO NIVEL DINAMICO
    let nameCutScene = "cut-level1-" + this.currentIndex.toString();
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
    //NAO HA AINDA NENHUMA
    //METER ISTO PARA TODOS
    const offSetXLil = -10;
    const offSetYLil = -70;
    const xLil =
      game.currentLevel.lilPeanut.obj.body.x +
      game.currentLevel.lilPeanut.obj.body.width +
      offSetXLil;
    const yLil = game.currentLevel.lilPeanut.obj.body.y + offSetYLil;
    const scale = 2.5;
    const spacebarX = 110;
    const spacebarY = 480;
    let nameCutScene = "cut-level1-" + this.currentIndex.toString();
    console.log(nameCutScene);
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
