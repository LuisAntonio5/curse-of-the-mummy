var helpState = {
  preload: () => {},
  create: () => {
    help = new Help();
    help.addSprites(game);
    help.addButtons(game);
    help.addText(
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
