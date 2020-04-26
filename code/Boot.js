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
      ["SoundLessSoundEffects", "../images/Sound/SoundIconBaseSound-.png"],
      ["SoundLessGameMusic", "../images/Sound/SoundIconBaseSound-.png"],
      ["SoundLessMenuMusic", "../images/Sound/SoundIconBaseSound-.png"],
      //ranking
      ["backBtn", "assets/backBtn.png"],
      ["rankingInline", "assets/ranking.png"],
    ]);
    game.loadSpritesheet([["lilPeanut", "assets/lilPeanutSprite.png"]]);
    game.loadFonts();
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    game.phaser.state.start("Load");
  },
};
