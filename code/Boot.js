var bootState = {
  preload: () => {
    game.loadImages([
      ["level1", "assets/plats1.png"],
      ["torch", "assets/torch.png"],
      ["boundsVertical", "assets/boundsVertical.png"],
      ["boundsHorizontal", "assets/boundsHorizontal.png"],
      ["backgroundLevel", "assets/level-background.png"],
      ["bigMack", "assets/Gordo.png"],
      ["torchInverted", "assets/torchInverted.png"]
    ]);
    game.loadSpritesheet([["lilPeanut", "assets/lilPeanutSprite.png"]]);
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    game.phaser.state.start("Load");
  }
};
