var loadState = {
  preload: () => {},
  create: () => {
    load = new Load();
    load.addSprites();
  },
  update: () => {
    game.loadUpdate();
  },
};
