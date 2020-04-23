var level1 = {
  preload: () => {},
  create: () => {
    console.log(game);
    var level1 = new Level1();
    level1.drawMap(game);
  }
};
