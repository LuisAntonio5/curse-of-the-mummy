var bootState = {
  preload: () => {
    game.loadImages([
      ["level1", "assets/plats1.png"],
      ["torch", "assets/torch.png"],
      ["boundsVertical", "assets/boundsVertical.png"],
      ["boundsHorizontal", "assets/boundsHorizontal.png"],
      ["backgroundLevel", "assets/level-background.png"],
      ["torchInverted", "assets/torchInverted.png"],
      ["elevator", "assets/elevador.png"],
      ["chain", "assets/chain.png"],
      ["bigBox", "assets/bigBox.png"],
      ["smallBox", "assets/smallBox.png"],
      ["bigMack", "assets/bigMack.png"]
    ]);
    game.loadSpritesheet([["lilPeanut", "assets/lilPeanutSprite.png"]]);
    game.phaser.load.json("shapes", "assets/222.json");
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    game.phaser.state.start("Load");
  }
};
