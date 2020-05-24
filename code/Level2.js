var level2 = {
  preload: () => {},
  create: () => {
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
      spikes: [
        [310, 320],
        [430, 320],
      ],
      lever: [],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level2"],
      //[x, y]
      porta_pequena: [150, 496],
      porta_grande: [20, 446],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      elevadores: [],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
    };
    const coordsHelpers = [[510, 230]];
    const nCutScenes = 5;
    const nHelpers = 1;
    const bigPeanutCoords = { x: 30, y: 85 };
    const lilPeanutCoords = { x: 130, y: 135 };
    const side = "right";
    game.currentLevel = new Level(nCutScenes, nHelpers, coordsHelpers, 2);
    game.currentLevel.drawMap(game, levelData);
    game.currentLevel.initializeCharacters(
      game,
      bigPeanutCoords.x,
      bigPeanutCoords.y,
      lilPeanutCoords.x,
      lilPeanutCoords.y,
      side
    );
    game.pauseMenu.addSprites();
    game.pauseMenu.addButtons();
    game.pauseMenu.hideContent();
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  },
};
