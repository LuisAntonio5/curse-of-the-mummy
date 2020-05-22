var nameInputState = {
  preload: () => {},
  create: () => {
    nameInput = new NameInput();
    nameInput.addSprites(game);
    nameInput.addButtons(game);
    nameInput.addText(game, "Hello hello there gamer!\n Please enter a name:");
    nameInput.addInput(game);
  },
};
