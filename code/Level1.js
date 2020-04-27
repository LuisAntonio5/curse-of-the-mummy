var level1 = {
  preload: () => {},
  create: () => {
    game.currentLevel = new Level1();
    game.currentLevel.drawMap(game);
    game.currentLevel.initializeCharacters(game);
  },
  update: () => {
    game.levelUpdate(game.currentLevel);
  }
};
