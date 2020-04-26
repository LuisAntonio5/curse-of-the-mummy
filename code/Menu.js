var menuState = {
  preload: () => {},
  create: () => {
    game.phaser.state.start("MainMenu");

    // startBtn.inputEnabled = true;
    // startBtn.events.onInputDown.add(function () {
    //   game.phaser.state.start("Level1");
    // });

    // optionsBtn.inputEnabled = true;
    // optionsBtn.events.onInputDown.add(function () {
    //   game.phaser.state.start("Options");
    // });
  },
};
