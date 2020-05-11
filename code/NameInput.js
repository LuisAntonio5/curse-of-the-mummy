var thisNameInput = null;

var nameInputState = {
	preload: () => {},
	create: () => {
		thisNameInput = new NameInput();
		thisNameInput.addSprites(game);
		thisNameInput.addButtons(game);
		thisNameInput.addInput(game);
		thisNameInput.addText(
			game,
			"Hello hello there gamer!\n Please enter a name:"
		);
	},
};
