var level4 = {
  preload: () => {},
  create: () => {
    game.currentLevel = new Level4(0, 0, 0);
    game.currentLevel.drawMap(game);
    game.currentLevel.initializeCharacters(
      game,
      450,
      game.phaser.world.height - 150,
      250,
      game.phaser.world.height - 150
    );
    game.pauseMenu.addSprites();
    game.pauseMenu.addButtons();
    game.pauseMenu.hideContent();
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  },
};
