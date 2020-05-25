var endOfGameState = {
  preload: () => {},
  create: () => {
    const nTotal = 6;
    endOfGame = new EndOfGame();
    endOfGame.start();
  },

  //   update: () => {
  //     game.levelUpdate(game.currentLevel);
  //   },
};
