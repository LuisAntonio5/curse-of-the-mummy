var rankingState = {
  preload: () => {},
  create: () => {
    ranking = new Ranking();
    ranking.addSprites(game);
    ranking.addButtons(game);
    ranking.addText(game);
  },
};
