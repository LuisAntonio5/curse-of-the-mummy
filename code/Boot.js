var bootState = {
  preload: () => {
    game.loadImages([
      ["level1", "assets/plats1.png"],
      ["boundsVertical", "assets/boundsVertical.png"],
      ["boundsHorizontal", "assets/boundsHorizontal.png"],
      ["backgroundLevel", "assets/level-background.png"],
      ["elevator", "assets/elevador.png"],
      ["chain", "assets/chain.png"],
      ["bigBox", "assets/bigBox.png"],
      ["smallBox", "assets/smallBox.png"],
      ["portaLil", "assets/portaLil.png"],
      ["portaBig", "assets/portaBig.png"],
      ["timerBoard", "assets/timerBoard.png"],
      ["1", "assets/1.png"],
      ["2", "assets/2.png"],
      ["3", "assets/3.png"],
      ["4", "assets/4.png"],
      ["5", "assets/5.png"],
      ["6", "assets/6.png"],
      ["7", "assets/7.png"],
      ["8", "assets/8.png"],
      ["9", "assets/9.png"],
      ["0", "assets/0.png"],
      ["collectableLilPeanut", "assets/collectableLilPeanut.png"],
      ["collectableBigMack", "assets/collectableBigMack.png"],
      ["collectableLilPeanutBoard", "assets/collectableLilPeanutBoard.png"],
      ["collectableBigMackBoard", "assets/collectableBigMackBoard.png"],
    ]);
    game.loadSpritesheet([["lilPeanut", "assets/lilPeanutSprite.png"]], 32);
    game.loadSpritesheet([["eletricSaw", "assets/eletricSawSprite.png"]], 32);
    game.loadSpritesheet([["button", "assets/buttonSprite.png"]], 32);
    game.loadSpritesheet([["torch", "assets/torchSprite.png"]], 32);
    game.loadSpritesheet(
      [["torchInverted", "assets/torchInvertedSprite.png"]],
      32
    );
    game.loadSpritesheet([["bigMack", "assets/bigMackSprite.png"]], 64);
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    game.phaser.state.start("Load");
  },
};
