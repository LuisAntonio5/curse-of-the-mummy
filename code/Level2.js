var level2 = {
  preload: () => {},
  create: () => {
    game.currentLevel = new Level2();
    game.currentLevel.drawMap(game);
    game.currentLevel.initializeCharacters(
      game,
      30,
      game.phaser.world.height - 530,
      100,
      game.phaser.world.height - 530
    );
    game.pauseMenu.addSprites();
    game.pauseMenu.addButtons();
    game.pauseMenu.hideContent();
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  },
};
