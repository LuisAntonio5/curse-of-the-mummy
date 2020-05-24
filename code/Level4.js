var level4 = {
  preload: () => {},
  create: () => {
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
      spikes: [],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level4"],
      //[x, y]
      porta_pequena: [70, 316],
      porta_grande: [630, 267],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
      elevadores: [
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 6, 390, 58, 19, true],
          invisible_chains: [6, 27, 390, 58, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          plataforma: [320, 198, 2, null, 562],
        },
      ],
    };
    const coordsHelpers = [[460, 115]];
    const nCutScenes = 2;
    const nHelpers = 1;
    const bigPeanutCoords = { x: 450, y: 450 };
    const lilPeanutCoords = { x: 250, y: 500 };
    const side = "right";
    game.currentLevel = new Level(nCutScenes, nHelpers, coordsHelpers, 4);
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
