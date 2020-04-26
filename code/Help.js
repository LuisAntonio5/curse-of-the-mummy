var thisHelp = null;

var helpState = {
  preload: () => {},
  create: () => {
    thisHelp = new Help();
    thisHelp.addSprites(game);
    thisHelp.addButtons(game);
    thisHelp.addText(
      game,
      "  BIG MACK    LIL PEANUT",
      "JUMP",
      "INTERACT",
      "LEFT",
      "RIGHT",
      "CROUCH"
    );
  },
};
