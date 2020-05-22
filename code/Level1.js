var level1 = {
  preload: () => {},
  create: () => {
    game.currentLevel = new Level1();
    game.currentLevel.drawMap(game);
    game.currentLevel.initializeCharacters(
      game,
      30,
      game.phaser.world.height - 150,
      60,
      game.phaser.world.height - 175
    );
    //game.currentLevel.initializeCharacters(game, 350, 50, 350, 75);
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  },
};
