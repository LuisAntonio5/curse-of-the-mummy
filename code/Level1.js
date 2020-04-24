var thisLevel = null;

var level1 = {
  preload: () => {},
  create: () => {
    thisLevel = new Level1();
    thisLevel.drawMap(game);
  },
  update: () => {
    game.phaser.physics.arcade.collide(thisLevel.bigMack, thisLevel.bounds);
  }
};
