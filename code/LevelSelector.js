var levelSelectorState = {
  preload: () => {},
  create: () => {
    levelSelector = new LevelSelector();
    levelSelector.addSprites(game);
    levelSelector.addButtons(game);
    levelSelector.addText(game, "TOTAL SCORE:\n  " + "750" + " PTS");
  },
};
