var helpState = {
  preload: () => {},
  create: () => {
    help = new Help();
    help.addSprites(game);
    help.addButtons(game);
    help.addTexts(
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
