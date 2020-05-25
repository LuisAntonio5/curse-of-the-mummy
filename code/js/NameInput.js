var nameInputState = {
  preload: () => {},
  create: () => {
    const inputFieldValue = document.getElementById("name-input");
    inputFieldValue.disabled = false;
    nameInput = new NameInput();
    nameInput.addSprites(game);
    nameInput.addButtons(game);
    nameInput.addText(game, "Hello hello there gamer!\n Please enter a name:");
    nameInput.addInput(game);
  },
};
