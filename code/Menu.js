var menuState = {
	preload: () => {},
	create: () => {
		var background = game.phaser.add.sprite(0, 0, "menuBackground");
		var startBtn = game.phaser.add.sprite(330, 150, "startBtn");
		var optionsBtn = game.phaser.add.sprite(330, 220, "optionsBtn");
		var helpBtn = game.phaser.add.sprite(330, 290, "helpBtn");
		var rankingBtn = game.phaser.add.sprite(330, 360, "rankingBtn");
		var titleInline = game.phaser.add.sprite(100, -75, "titleInline");
		var lilPeanutImg = game.phaser.add.sprite(600, 350, "lilPeanutImg");
		var bigMackImg = game.phaser.add.sprite(110, 255, "bigMackImg");
		background.scale.setTo(0.63, 0.85);
		optionsBtn.scale.setTo(2.8, 2.8);
		helpBtn.scale.setTo(2.8, 2.8);
		rankingBtn.scale.setTo(2.8, 2.8);
		startBtn.scale.setTo(2.8, 2.8);
		titleInline.scale.setTo(0.6, 0.6);
		lilPeanutImg.scale.setTo(6, 6);
		bigMackImg.scale.setTo(6, 6);

		startBtn.inputEnabled = true;
		startBtn.events.onInputDown.add(function () {
			game.phaser.state.start("Level1");
		});

		optionsBtn.inputEnabled = true;
		optionsBtn.events.onInputDown.add(function () {
			game.phaser.state.start("Options");
		});
	},
};
