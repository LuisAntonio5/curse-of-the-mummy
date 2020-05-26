var level1 = {
  preload: () => {},
  create: () => {
    var levelData = {
      bounds: [
        //[x, y, comprimento, vertical]
        //pardes, teto e chao
        [0, 562, 800, false],
        [273, 198, 600, false],
        [0, 384, 430, false],
        [0, 399, 430, false],
        //plataforma de cima
        [273, 212, 600, false],
        [0, 54, 800, false],
        [426, 385, 15, true],
        //plataforma de baixo
        [272, 200, 15, true],
        [16, 0, 600, true],
        [782, 0, 600, true],
      ],
      tochas: [
        //[x, y, inverted]
        [725, 300, true],
        [-8, 100, false],
      ],
      caixas: [
        //[x, y, big]
        [300, 250, true],
        [640, 250, false],
      ],
      portas_deslizantes: [],
      plataformas: [],
      serras: [
        //[x, y, maxX, maxY, move_speed, vertical]
        [160, 520, 280, 520, 400, false],
      ],
      botoes: [
        //[x, y, numero_item, tipo_item]
        [90, 511, 0, "serra"],
        [350, 511, 0, "serra"],
      ],
      coletaveis_peanut: [
        [140, 220],
        [387, 510],
        [730, 510],
      ],
      coletaveis_big: [
        [370, 130],
        [180, 490],
        [460, 380],
      ],
      lava: [],
      elevadores: [
        {
          //[start i, end i, x, y_static, y_dynamic, visible]
          visible_chains: [0, 10, 500, 208, 19, true],
          invisible_chains: [10, 19, 500, 208, 19, false],
          //[x, y, maxX, maxY, sizeX, sizeY, inverted]
          plataforma: [430, 384, 2, null, 562],
        },
      ],
      //[x, y, nome]
      sprite_plataformas: [0, 0, "level1"],
      //[x, y]
      porta_pequena: [550, 132],
      porta_grande: [650, 82],
      quadro_coletaveis: [30, -2],
      quadro_menu_restart: [580, -2],
      spikes: [],
      lever: [],
      //[x, y, sprite_name, x scale, y scale]
      background: [0, 0, "backgroundLevel", 0.5, 0.5],
    };
    const coordsHelpers = [
      [280, 470],
      [390, 450],
      [540, 440],
      [250, 185],
      [40, 140],
      [400, 65],
    ];
    const nCutScenes = 5;
    const nHelpers = 6;
    const bigPeanutCoords = { x: -20, y: 450 };
    const lilPeanutCoords = { x: 60, y: 500 };
    const side = "right";
    game.currentLevel = new Level(nCutScenes, nHelpers, coordsHelpers, 1);
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
