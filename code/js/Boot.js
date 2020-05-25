var bootState = {
  preload: () => {
    game.loadImages([
      ["level1", "assets/platforms/plats1.png"],
      ["level2", "assets/platforms/plats2.png"],
      ["level3", "assets/platforms/plats3.png"],
      ["level4", "assets/platforms/plats4.png"],
      ["boundsVertical", "assets/bounds/boundsVertical.png"],
      ["boundsHorizontal", "assets/bounds/boundsHorizontal.png"],
      ["backgroundLevel", "assets/inGameItems/level-background.png"],
      ["elevator", "assets/inGameItems/elevador.png"],
      ["chain", "assets/inGameItems/chain.png"],
      ["bigBox", "assets/inGameItems/bigBox.png"],
      ["smallBox", "assets/inGameItems/smallBox.png"],
      ["portaLil", "assets/inGameItems/portaLil.png"],
      ["portaBig", "assets/inGameItems/portaBig.png"],
      ["timerBoard", "assets/inGameItems/timerBoard.png"],
      ["1", "assets/timerNumbers/1.png"],
      ["2", "assets/timerNumbers/2.png"],
      ["3", "assets/timerNumbers/3.png"],
      ["4", "assets/timerNumbers/4.png"],
      ["5", "assets/timerNumbers/5.png"],
      ["6", "assets/timerNumbers/6.png"],
      ["7", "assets/timerNumbers/7.png"],
      ["8", "assets/timerNumbers/8.png"],
      ["9", "assets/timerNumbers/9.png"],
      ["0", "assets/timerNumbers/0.png"],
      ["collectableLilPeanut", "assets/inGameItems/collectableLilPeanut.png"],
      ["collectableBigMack", "assets/inGameItems/collectableBigMack.png"],
      ["collectableLilPeanutBoard", "assets/inGameItems/collectableLilPeanutBoard.png"],
      ["collectableBigMackBoard", "assets/inGameItems/collectableBigMackBoard.png"],
      ["menuBoard", "assets/buttons/MenuBoard.png"],
      ["restartBoard", "assets/buttons/RestartBoard.png"],
      //mainmenu
      ["menuBackground", "assets/Menus/menuBackground.png"],
      ["startBtn", "assets/buttons/startBtn.png"],
      ["optionsBtn", "assets/buttons/optionsBtn.png"],
      ["helpBtn", "assets/buttons/helpBtn.png"],
      ["rankingBtn", "assets/buttons/rankingBtn.png"],
      ["titleInline", "assets/titles/title_inline.png"],
      ["lilPeanutImg", "assets/inGameItems/Lil.png"],
      ["bigMackImg", "assets/inGameItems/Gordo.png"],
      //options
      ["optionsTitle", "assets/titles/options.png"],
      ["optionsSoundEffects", "assets/text_sprites/sound_effects.png"],
      ["optionsGameMusic", "assets/text_sprites/game_music.png"],
      ["optionsMenuMusic", "assets/text_sprites/menu_music.png"],
      ["SoundLess", "assets/Sound/SoundIconBaseSound-.png"],
      ["SoundPlus", "assets/Sound/SoundIconBaseSound+.png"],
      ["SoundOff", "assets/Sound/SoundIconBaseSoundOFF.png"],
      ["SoundBarEmpty", "assets/Sound/SoundBarEmpty.png"],
      ["SoundBarFilled", "assets/Sound/SoundBarFilled.png"],
      //ranking
      ["backBtn", "assets/buttons/backBtn.png"],
      ["rankingInline", "assets/titles/ranking.png"],
      //help
      ["helpInline", "assets/titles/help.png"],
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
      ["levelsInline", "assets/titles/levels.png"],
      ["pyramidLevelSelector", "assets/Menus/pyramidLevelSelector.png"],
      ["lvl1", "assets/levelPreviews/lvl1.png"],
      ["lvl2", "assets/levelPreviews/lvl2.png"],
      ["lvl3", "assets/levelPreviews/lvl3.png"],
      ["lvl4", "assets/levelPreviews/lvl4.png"],
      //nameInput
      ["inputBox", "assets/text_sprites/nameinput.png"],
      ["submitBtn", "assets/buttons/submitBtn.png"],
      //GameOverMenu
      ["GameOverMenu", "assets/Menus/GameOverMenu.png"],
      ["restartBtn", "assets/buttons/BotaoSampleRestart.png"],
      //PauseMenu
      ["pauseMenu", "assets/Menus/PauseMenu.png"],
      ["quitBtn", "assets/buttons/BotaoSampleQuit.png"],
      ["nextLvlBtn", "assets/buttons/nextLvlBtn.png"],
      ["menuBtn", "assets/buttons/menuBtn.png"],
      //CUTSCENES
      ["cut-level1-1", "assets/Cutscenes/Level1/1.png"],
      ["cut-level1-2", "assets/Cutscenes/Level1/2.png"],
      ["cut-level1-3", "assets/Cutscenes/Level1/3.png"],
      ["cut-level1-4", "assets/Cutscenes/Level1/4.png"],
      ["cut-level1-5", "assets/Cutscenes/Level1/5.png"],
      ["cut-level1-6", "assets/Cutscenes/Level1/6.png"],
      ["cut-level1-7", "assets/Cutscenes/Level1/7.png"],
      ["cut-level1-8", "assets/Cutscenes/Level1/8.png"],
      ["cut-level1-9", "assets/Cutscenes/Level1/9.png"],
      ["cut-level1-10", "assets/Cutscenes/Level1/10.png"],
      ["cut-level1-11", "assets/Cutscenes/Level1/11.png"],
      ["spacebar", "assets/Cutscenes/Level1/spacebar.png"],
      ["cut-level2-1", "assets/Cutscenes/Level2/1.png"],
      ["cut-level2-2", "assets/Cutscenes/Level2/2.png"],
      ["cut-level2-3", "assets/Cutscenes/Level2/3.png"],
      ["cut-level2-4", "assets/Cutscenes/Level2/4.png"],
      ["cut-level2-5", "assets/Cutscenes/Level2/5.png"],
      ["cut-level2-6", "assets/Cutscenes/Level2/6.png"],
      ["cut-level3-1", "assets/Cutscenes/Level3/1.png"],
      ["cut-level3-2", "assets/Cutscenes/Level3/2.png"],
      ["cut-level3-3", "assets/Cutscenes/Level3/3.png"],
      ["cut-level3-4", "assets/Cutscenes/Level3/4.png"],
      ["cut-level4-1", "assets/Cutscenes/Level4/1.png"],
      ["cut-level4-2", "assets/Cutscenes/Level4/2.png"],
      ["cut-level4-3", "assets/Cutscenes/Level4/3.png"],
      ["cut-end-1", "assets/Cutscenes/Credits/1.png"],
      ["cut-end-2", "assets/Cutscenes/Credits/2.png"],
      ["cut-end-3", "assets/Cutscenes/Credits/3.png"],
      ["cut-end-4", "assets/Cutscenes/Credits/4.png"],
      ["cut-end-5", "assets/Cutscenes/Credits/5.png"],
      ["cut-end-6", "assets/Cutscenes/Credits/6.png"],
      ["credits", "assets/Cutscenes/Credits/credits.png"],

      //LEVEL3
      ["slidingDoor", "assets/inGameItems/slidingdoor.png"],
      //LEVEL2
      ["spikes", "assets/inGameItems/spikes.png"],
      ["slidingDoorHorizontal", "assets/inGameItems/slidingdoorHorizontal.png"],
      //LevelCompletedMenu
      ["LevelCompletedMenu", "assets/Menus/LevelCompletedMenu.png"],
      //load
      ["titleNotInline", "assets/titles/titleNotInline.png"],
      ["pressSpacebar", "assets/Menus/pressSpacebar.png"],
    ]);
    game.loadSpritesheet([["lilPeanut", "assets/inGameItems/lilPeanutSprite.png"]], 32);
    game.loadSpritesheet([["eletricSaw", "assets/inGameItems/eletricSawSprite.png"]], 32);
    game.loadSpritesheet([["button", "assets/inGameItems/buttonSprite.png"]], 32);
    game.loadSpritesheet([["torch", "assets/inGameItems/torchSprite.png"]], 32);
    game.loadSpritesheet([["torchInverted", "assets/inGameItems/torchInvertedSprite.png"]], 32);
    game.loadSpritesheet([["lava", "assets/inGameItems/lavaSprite.png"]], 32);
    game.loadSpritesheet([["lever", "assets/inGameItems/lever.png"]], 32);
    game.loadSpritesheet([["bigMack", "assets/inGameItems/bigMackSprite.png"]], 64);
    game.loadFonts();
    game.loadAudios([
      ["menuMusic", "assets/soundEffects/menuMusic.mp3"],
      ["gameMusic", "assets/soundEffects/gameMusic1.mp3"],
      ["boxBreakSoundEffect", "assets/soundEffects/boxBreakSoundEffect.mp3"],
      ["boxMoveSoundEffect", "assets/soundEffects/boxMoveSoundEffect.mp3"],
      ["buttonSoundEffect", "assets/soundEffects/buttonSoundEffect.mp3"],
      ["collectableSoundEffect", "assets/soundEffects/collectableSoundEffect.mp3"],
      ["elevatorSoundEffect", "assets/soundEffects/elevatorSoundEffect.mp3"],
      ["lavaSoundEffect", "assets/soundEffects/lavaSoundEffect.mp3"],
      ["leverSoundEffect", "assets/soundEffects/leverSoundEffect.mp3"],
      ["sawSoundEffect", "assets/soundEffects/sawSoundEffect.mp3"],
      ["slidingDoorSoundEffect", "assets/soundEffects/slidingDoorSoundEffect.mp3"],
      ["spikesSoundEffect", "assets/soundEffects/spikesSoundEffect.mp3"],
      ["levelCompleteSoundEffect", "assets/soundEffects/levelCompleteSoundEffect.mp3"],
    ]);
    game.phaser.load.script(
      "gray",
      "https://cdn.rawgit.com/photonstorm/phaser-ce/master/filters/Gray.js"
    );
  },

  create: () => {
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
    //game.dataBaseGet("bernardo");
    game.phaser.state.start("Load");
  },
};
