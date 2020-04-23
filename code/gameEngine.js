var canvasWidth = 800;
var canvasHeight = 600;

class GameEngine {
  constructor() {
    this.sprites = {};
    this.player = null;
    this.currentLevel = null;
    this.phaser = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, "");
  }

  loadImages(list) {
    //RECEBE UM ARRAY DO TIPO [["chao","/assets/chao.png"]]
    let nLoaded = 0;
    const imgLoadedHandler = ev => {
      var img = ev.target;
      this.sprites[ev.path[0].id] = this.getImageData(img).data;
      nLoaded += 1;
      if (nLoaded === list.length) {
        //TODAS AS IMAGENS SAO CARREGAS NO INICIO COM AS LABELS DEFENIDAS EM BOOT.js
        console.log(list.length);
        game.phaser.state.start("Load");
      }
    };

    list.map(key => {
      this.phaser.load.image(key[0], key[1]);
      var img = new Image();
      this.sprites[key[0]] = null;
      console.log(this.sprites);
      img.addEventListener("load", imgLoadedHandler);
      img.id = key[0];
      img.src = key[1]; //dá ordem de carregamento da imagem
    });
  }

  placeObject(x, y, character) {
    var newObj = this.phaser.add.sprite(x, y, character);
    newObj.scale.setTo(2, 2);
    newObj.smoothed = false;
  }

  addTorch(x, y, map) {
    const torch = this.phaser.add.sprite(50, 50, "torch");
    torch.scale.setTo(4, 4);
    torch.smoothed = false;
    const newTorch = new Torch(50, 50, this.sprites.torch);
    map.immovableObjects.push(newTorch);
  }

  getImageData(img) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return ctx.getImageData(0, 0, img.width, img.height);
  }
}

class Map {
  constructor() {
    this.bounds = null;
    this.immovableObjects = [];
    this.movableObjects = [];
  }
}

class Sprite {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

class Platform extends Sprite {
  constructor() {
    super();
  }
}

class Torch extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class Bounds extends Sprite {
  constructor(x, y, data) {
    super(x, y, data);
  }
}

class Level {
  constructor() {
    this.map = new Map();
  }
}

class Level1 extends Level {
  constructor() {
    super();
    //desenha todo o primeiro nivel
    game.addTorch(50, 50, this.map);
    game.addTorch(400, 400, this.map);
  }

  drawMap(game) {
    var bounds = game.phaser.add.group();
    bounds.enableBody = true;
    var platform = bounds.create(0, game.phaser.world.height - 80, "bounds");
    platform.width = 800;
    platform.body.immovable = true;
    platform = bounds.create(273, game.phaser.world.height - 406, "bounds");
    platform.width = 600;
    platform.body.immovable = true;
    platform = bounds.create(0, game.phaser.world.height - 222, "bounds");
    platform.width = 430;
    platform.body.immovable = true;
    platform = bounds.create(0, game.phaser.world.height - 206, "bounds");
    platform.width = 430;
    platform.body.immovable = true;
    platform = bounds.create(273, game.phaser.world.height - 392, "bounds");
    platform.width = 600;
    platform.body.immovable = true;
    platform = bounds.create(0, 48, "bounds");
    platform.width = 800;
    platform.body.immovable = true;
    platform = bounds.create(435, 385, "bounds");
    platform.angle = 90;
    platform.width = 15;
    platform.body.immovable = true;
    platform = bounds.create(281, 200, "bounds");
    platform.angle = 90;
    platform.width = 15;
    platform.body.immovable = true;
    platform = bounds.create(24, 0, "bounds");
    platform.angle = 90;
    platform.width = 600;
    platform.body.immovable = true;
    platform = bounds.create(this.phaser.world.width - 10, 0, "bounds");
    platform.angle = 90;
    platform.width = 600;
    platform.body.immovable = true;
    var background = this.phaser.add.sprite(0, 0, "backgroundLevel");
    background.scale.setTo(1, 0.5);
    this.placeObject(50, this.phaser.world.height - 167, "bigMack");

    this.phaser.add.sprite(0, 0, level);
    map.bounds = this.sprites[level];

    //character creation
  }
}
