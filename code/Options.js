var thisOptions = null;

var optionsState = {
	preload: () => {},
	create: () => {
		thisOptions = new Options();
		thisOptions.addSprites(game);
		thisOptions.addButtons(game);
	},
};
