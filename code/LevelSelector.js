var levelSelectorState = {
  preload: () => {},
  create: () => {
    levelSelector = new LevelSelector();
    levelSelector.addSprites(game);
    levelSelector.addButtons(game);
    console.log(game.player);

    levelSelector.addTexts();
  },
};
