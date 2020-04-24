var bootState = {
  preload: () => {
    game.loadImages([
      ["level1", "assets/plats1.png"],
      ["torch", "assets/torch.png"],
      ["bounds", "assets/bounds.png"],
      ["backgroundLevel", "assets/level-background.png"],
      ["bigMack", "assets/Gordo.png"]
    ]);
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    game.phaser.state.start("Load");
  }
};
