var thisLevel = null;

var level1 = {
	preload: () => {},
	create: () => {
		thisLevel = new Level1();
		thisLevel.drawMap(game);
		thisLevel.initializeCharacters(game);
	},
	update: () => {
		game.levelUpdate(thisLevel);
	},
};
