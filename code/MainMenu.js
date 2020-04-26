var thisMainMenu = null;

var MainMenuState = {
  preload: () => {},
  create: () => {
    thisMainMenu = new MainMenu();
    thisMainMenu.addSprites(game);
    thisMainMenu.addButtons(game);
  },
};
