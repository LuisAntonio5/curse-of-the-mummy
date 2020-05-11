var thisLevelSelector = null;

var levelSelectorState = {
	preload: () => {},
	create: () => {
		thisLevelSelector = new LevelSelector();
		thisLevelSelector.addSprites(game);
		thisLevelSelector.addButtons(game);
		thisLevelSelector.addText(
			game,
			"TOTAL SCORE:\n  " + String(game.player.score) + " PTS"
		);
	},
};
