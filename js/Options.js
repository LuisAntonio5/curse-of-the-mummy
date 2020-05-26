var optionsState = {
  preload: () => {},
  create: () => {
    options = new Options();
    options.addSprites(game);
    options.addButtons(game);
  },
};
