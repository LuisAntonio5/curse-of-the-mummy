var levelSelectorState = {
  preload: () => {},
  create: () => {
    levelSelector = new LevelSelector();
    levelSelector.addSprites(game);
    levelSelector.addButtons(game);

    levelSelector.addTexts();
  },
};
