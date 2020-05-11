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
			//mainmenu
			["menuBackground", "assets/menuBackground.png"],
			["startBtn", "assets/startBtn.png"],
			["optionsBtn", "assets/optionsBtn.png"],
			["helpBtn", "assets/helpBtn.png"],
			["rankingBtn", "assets/rankingBtn.png"],
			["titleInline", "assets/title_inline.png"],
			["lilPeanutImg", "assets/lil.png"],
			["bigMackImg", "assets/Gordo.png"],
			//options
			["optionsTitle", "../images/titles/options.png"],
			["optionsSoundEffects", "../images/text_sprites/sound_effects.png"],
			["optionsGameMusic", "../images/text_sprites/game_music.png"],
			["optionsMenuMusic", "../images/text_sprites/menu_music.png"],
			["SoundLess", "../images/Sound/SoundIconBaseSound-.png"],
			["SoundPlus", "../images/Sound/SoundIconBaseSound+.png"],
			["SoundOff", "../images/Sound/SoundIconBaseSoundOFF.png"],
			["SoundBarEmpty", "../images/Sound/SoundBarEmpty.png"],
			["SoundBarFilled", "../images/Sound/SoundBarFilled.png"],
			//ranking
			["backBtn", "assets/backBtn.png"],
			["rankingInline", "assets/ranking.png"],
			//help
			["helpInline", "assets/help.png"],
			["dKey", "assets/keys/KeySampleD.png"],
			["eKey", "assets/keys/KeySampleE.png"],
			["aKey", "assets/keys/KeySampleA.png"],
			["downKey", "assets/keys/KeySampleHelpDown.png"],
			["leftKey", "assets/keys/KeySampleHelpLeft.png"],
			["rightKey", "assets/keys/KeySampleHelpRight.png"],
			["upKey", "assets/keys/KeySampleHelpUp.png"],
			["sKey", "assets/keys/KeySampleHelpS.png"],
			["wKey", "assets/keys/KeySampleHelpW.png"],
			["rightShiftKey", "assets/keys/KeySampleRightShift.png"],
			//levelSelector
			["levelsInline", "assets/levels.png"],
			["pyramidLevelSelector", "assets/pyramidLevelSelector.png"],
			["bottomleftcolor", "assets/bottomleftcolor.png"],
			["bottommidcolor", "assets/bottommidcolor.png"],
			["bottomrightbw", "assets/bottomrightbw.png"],
			["midleftbw", "assets/midleftbw.png"],
			["midrightbw", "assets/midrightbw.png"],
			["topbw", "assets/topbw.png"],
			//nameInput
			["inputBox", "../images/text_sprites/nameinput.png"],
			["nothing", "assets/nothing.png"],
			["submitBtn", "assets/submitBtn.png"],
		]);
		game.loadSpritesheet([["lilPeanut", "assets/lilPeanutSprite.png"]]);
		game.loadFonts();
	},

	create: () => {
		game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
		game.phaser.state.start("Load");
	},
};
