var loadState = {
	preload: () => {
		//LOAD ALL IMAGES FROM LOAD PAGE
	},
	create: () => {
		//CREATE ALL IMAGES FROM LOAD PAGE
		game.phaser.state.start("Menu");
	},
};
