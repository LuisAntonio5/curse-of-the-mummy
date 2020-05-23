var level3 = {
  preload: () => {},
  create: () => {
    game.currentLevel = new Level3(0, 0, 0);
    game.currentLevel.drawMap(game);
    game.currentLevel.initializeCharacters(
      game,
      game.phaser.world.width - 120,
      game.phaser.world.height - 150,
      game.phaser.world.width - 140,
      game.phaser.world.height - 175
    );
    game.pauseMenu.addSprites();
    game.pauseMenu.addButtons();
    game.pauseMenu.hideContent();
    //game.currentLevel.initializeCha
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  },
};