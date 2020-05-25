var level3 = {
  preload: () => {},
  create: () => {
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
      spikes: [],
      lever: [],
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
      lava: [],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level3"],
      //[x, y]
      porta_pequena: [250, 132],
      porta_grande: [340, 82],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      elevadores: [],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
    };

    const bigPeanutCoords = { x: 660, y: 450 };
    const lilPeanutCoords = { x: 620, y: 500 };
    const coordsHelpers = [[140, 470]];
    const nCutScenes = 3;
    const nHelpers = 1;
    const side = "left";
    game.currentLevel = new Level(nCutScenes, nHelpers, coordsHelpers, 3);
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
