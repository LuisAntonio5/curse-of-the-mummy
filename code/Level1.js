var level1 = {
  preload: () => {},
  create: () => {
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
    game.currentLevel = new Level1(nCutScenes, nHelpers, coordsHelpers);
    game.currentLevel.drawMap(game);
    game.currentLevel.initializeCharacters(
      game,
      -20,
      game.phaser.world.height - 150,
      60,
      game.phaser.world.height - 100
    );
    game.pauseMenu.addSprites();
    game.pauseMenu.addButtons();
    game.pauseMenu.hideContent();
    //game.currentLevel.initializeCharacters(game, 350, 50, 350, 75);
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  },
};
