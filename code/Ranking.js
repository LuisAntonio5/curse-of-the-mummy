var rankingState = {
  preload: () => {},
  create: () => {
    ranking = new Ranking();
    ranking.addSprites(game);
    ranking.addButtons(game);
    ranking.addText(
      game,
      "1-TuLuis5          9998 PTS",
      "2-berfa00          5500 PTS",
      "3-snepy            3250 PTS",
      "4-rui_pedro_paiva  1299 PTS",
      "5-max_num_chars_15 1234 PTS"
    );
  },
};
