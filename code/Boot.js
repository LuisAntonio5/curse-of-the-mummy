var bootState = {
  preload: () => {
    game.loadImages([
      ["level1", "assets/plats1.png"],
      ["torch", "assets/torch.png"],
      ["boundsVertical", "assets/boundsVertical.png"],
      ["boundsHorizontal", "assets/boundsHorizontal.png"],
      ["backgroundLevel", "assets/level-background.png"],
      ["bigMack", "assets/Gordo.png"],
      ["torchInverted", "assets/torchInverted.png"],
      ["menuBackground", "assets/menuBackground.png"],
      ["startBtn", "assets/startBtn.png"],
      ["optionsBtn", "assets/optionsBtn.png"],
      ["helpBtn", "assets/helpBtn.png"],
      ["rankingBtn", "assets/rankingBtn.png"],
      ["titleInline", "assets/title_inline.png"],
      ["lilPeanutImg", "assets/lil.png"],
      ["bigMackImg", "assets/Gordo.png"],
    ]);
    game.loadSpritesheet([["lilPeanut", "assets/lilPeanutSprite.png"]]);
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    game.phaser.state.start("Load");
  }
};
