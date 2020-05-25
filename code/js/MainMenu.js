var MainMenuState = {
  preload: () => {},
  create: () => {
    mainMenu = new MainMenu();
    mainMenu.addSprites(game);
    mainMenu.addButtons(game);
  },
};
