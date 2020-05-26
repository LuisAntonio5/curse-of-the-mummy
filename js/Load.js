var loadState = {
  preload: () => {},
  create: () => {
    const inputFieldValue = document.getElementById("name-input");
    inputFieldValue.disabled = true;
    load = new Load();
    load.addSprites();
  },
  update: () => {
    game.loadUpdate();
  },
};
