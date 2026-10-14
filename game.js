const WIDTH = 960;
const HEIGHT = 560;
const FLOOR_Y = 442;

class PikachuRun extends Phaser.Scene {
  constructor() {
    super('PikachuRun');
    this.mode = 'ready';
    this.score = 0;
    this.best = 0;
    this.elapsed = 0;
    this.bonusScore = 0;
    this.stage = 0;
    this.stageStartScore = 0;
    this.spawnIn = 0;
    this.speed = 360;
    this.feetY = FLOOR_Y;
    this.velocityY = 0;
    this.grounded = true;
    this.touchDuck = false;
    this.obstacles = [];
    this.groundMarks = [];
    this.clouds = [];
  }

  create() {
    this.readBest();
    this.createCharacterTextures();
    this.createObstacleTextures();
    this.createWorld();
    this.createHud();
    this.createPlayer();
    this.createControls();
    this.showReadyOverlay();
  }

  readBest() {
    try {
      this.best = Number(localStorage.getItem('pikachu-run-best') || 0);
    } catch (_) {
      this.best = 0;
    }
  }

  saveBest() {
    try {
      localStorage.setItem('pikachu-run-best', String(this.best));
    } catch (_) {
      // The run remains playable if browser storage is unavailable.
    }
  }

  createCharacterTextures() {
    this.drawPikachuTexture('pika-run-a', 0);
    this.drawPikachuTexture('pika-run-b', 1);
  }

  drawPikachuTexture(key, stride) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const outline = 0x383838;
    const yellow = 0xffdc55;
    const lightYellow = 0xffe986;
    const line = 3;

    // Lightning tail, drawn behind the body.
    g.fillStyle(yellow, 1);
    g.lineStyle(line, outline, 1);
    g.beginPath();
    g.moveTo(29, 57); g.lineTo(12, 50); g.lineTo(22, 40); g.lineTo(5, 34);
    g.lineTo(29, 34); g.lineTo(23, 21); g.lineTo(42, 36); g.lineTo(35, 47); g.lineTo(48, 52);
    g.closePath(); g.fillPath(); g.strokePath();

    // Ears and their dark tips.
    g.fillStyle(yellow, 1); g.lineStyle(line, outline, 1);
    g.beginPath(); g.moveTo(24, 28); g.lineTo(20, 2); g.lineTo(38, 17); g.lineTo(39, 30); g.closePath(); g.fillPath(); g.strokePath();
    g.beginPath(); g.moveTo(47, 20); g.lineTo(63, 0); g.lineTo(65, 28); g.lineTo(53, 35); g.closePath(); g.fillPath(); g.strokePath();
    g.fillStyle(outline, 1);
    g.beginPath(); g.moveTo(20, 2); g.lineTo(29, 9); g.lineTo(25, 14); g.closePath(); g.fillPath();
    g.beginPath(); g.moveTo(63, 0); g.lineTo(65, 14); g.lineTo(57, 12); g.closePath(); g.fillPath();

    // Body and little feet.
    g.fillStyle(yellow, 1); g.lineStyle(line, outline, 1);
    g.fillEllipse(40, 62, 37, 30); g.strokeEllipse(40, 62, 37, 30);
    g.fillStyle(lightYellow, 1); g.fillEllipse(40, 67, 19, 17);
    g.fillStyle(yellow, 1);
    if (stride === 0) {
      g.fillRoundedRect(25, 72, 12, 15, 5); g.strokeRoundedRect(25, 72, 12, 15, 5);
      g.fillRoundedRect(44, 73, 12, 13, 5); g.strokeRoundedRect(44, 73, 12, 13, 5);
    } else {
      g.fillRoundedRect(26, 73, 12, 13, 5); g.strokeRoundedRect(26, 73, 12, 13, 5);
      g.fillRoundedRect(45, 71, 12, 16, 5); g.strokeRoundedRect(45, 71, 12, 16, 5);
    }

    // Head and cheeks.
    g.fillStyle(yellow, 1); g.lineStyle(line, outline, 1);
    g.fillEllipse(43, 39, 49, 44); g.strokeEllipse(43, 39, 49, 44);
    g.fillStyle(0xe76558, 1); g.fillCircle(27, 48, 6); g.fillCircle(58, 47, 6);
    g.fillStyle(outline, 1); g.fillEllipse(35, 36, 3.5, 5); g.fillEllipse(52, 35, 3.5, 5);
    g.fillStyle(0xffffff, 1); g.fillCircle(36, 35, 1.2); g.fillCircle(53, 34, 1.2);
    g.fillStyle(outline, 1); g.fillCircle(44, 43, 2.2);
    g.lineStyle(2, outline, 1); g.beginPath(); g.moveTo(44, 46); g.lineTo(41, 49); g.lineTo(44, 50); g.lineTo(47, 49); g.strokePath();
    // Tiny arms keep the silhouette readable while running.
    g.lineStyle(4, outline, 1); g.lineBetween(25, 59, 20 + stride * 3, 65); g.lineBetween(56, 58, 61 - stride * 3, 64);
    g.lineStyle(2, 0xfff8dc, .75); g.lineBetween(32, 25, 35, 29);

    g.generateTexture(key, 76, 90);
    g.destroy();
  }

  createObstacleTextures() {
    this.drawCactusTexture('cactus-small', 30, 48, false);
    this.drawCactusTexture('cactus-tall', 42, 62, true);
    this.drawBeachObstacle('beach-shell', 40, 34);
    this.drawBeachObstacle('beach-log', 54, 30);
    this.drawCityObstacle('city-cone', 34, 48);
    this.drawCityObstacle('city-barrier', 60, 42);
    this.drawCharizardTexture('charizard-a', 0);
    this.drawCharizardTexture('charizard-b', 1);
    this.drawSquirtleTexture('squirtle-a', 0);
    this.drawSquirtleTexture('squirtle-b', 1);
    this.drawRayquazaTexture('rayquaza-a', 0);
    this.drawRayquazaTexture('rayquaza-b', 1);
  }

  drawCactusTexture(key, width, height, cluster) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const green = 0x5b9977;
    g.fillStyle(green, 1); g.lineStyle(3, 0x355c4e, 1);
    g.fillRoundedRect(width * .35, 1, width * .36, height - 1, 8);
    g.strokeRoundedRect(width * .35, 1, width * .36, height - 1, 8);
    g.fillRoundedRect(2, height * .45, width * .38, 8, 4); g.strokeRoundedRect(2, height * .45, width * .38, 8, 4);
    g.fillRoundedRect(2, height * .28, 8, height * .3, 4); g.strokeRoundedRect(2, height * .28, 8, height * .3, 4);
    g.fillRoundedRect(width * .62, height * .58, width * .35, 8, 4); g.strokeRoundedRect(width * .62, height * .58, width * .35, 8, 4);
    g.fillRoundedRect(width * .84, height * .39, 8, height * .29, 4); g.strokeRoundedRect(width * .84, height * .39, 8, height * .29, 4);
    if (cluster) {
      g.fillStyle(0x77aa83, 1); g.fillRoundedRect(width * .05, height * .67, width * .3, height * .31, 7);
      g.lineStyle(3, 0x355c4e, 1); g.strokeRoundedRect(width * .05, height * .67, width * .3, height * .31, 7);
    }
    g.generateTexture(key, width, height);
    g.destroy();
  }

  drawBeachObstacle(key, width, height) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const ink = 0x645b4d;
    if (key === 'beach-shell') {
      g.fillStyle(0xf1b87b, 1); g.lineStyle(3, ink, 1);
      g.fillEllipse(width / 2, height / 2, width - 4, height - 4); g.strokeEllipse(width / 2, height / 2, width - 4, height - 4);
      g.lineStyle(2, 0xc98563, 1);
      g.lineBetween(width / 2, 6, width / 2, height - 6);
      g.lineBetween(width / 2 - 11, 8, width / 2 - 5, height - 6);
      g.lineBetween(width / 2 + 11, 8, width / 2 + 5, height - 6);
    } else {
      g.fillStyle(0x9c704e, 1); g.lineStyle(3, ink, 1);
      g.fillRoundedRect(3, height * .35, width - 6, height * .48, 10);
      g.strokeRoundedRect(3, height * .35, width - 6, height * .48, 10);
      g.lineStyle(2, 0xd4a36b, 1); g.lineBetween(12, height * .48, width - 12, height * .48);
      g.lineBetween(15, height * .65, width - 15, height * .65);
    }
    g.generateTexture(key, width, height);
    g.destroy();
  }

  drawCityObstacle(key, width, height) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const ink = 0x464c50;
    if (key === 'city-cone') {
      g.fillStyle(0xec814e, 1); g.lineStyle(3, ink, 1);
      g.fillTriangle(width / 2, 2, width - 4, height - 8, 4, height - 8);
      g.strokeTriangle(width / 2, 2, width - 4, height - 8, 4, height - 8);
      g.fillStyle(0xffe6b8, 1); g.fillRect(9, height * .58, width - 18, 6);
      g.fillStyle(ink, 1); g.fillRoundedRect(1, height - 11, width - 2, 10, 3);
    } else {
      g.fillStyle(0xe58a58, 1); g.lineStyle(3, ink, 1);
      g.fillRoundedRect(2, 8, width - 4, height - 16, 5); g.strokeRoundedRect(2, 8, width - 4, height - 16, 5);
      g.lineStyle(5, 0xffedbf, 1); g.lineBetween(13, 13, 25, height - 13); g.lineBetween(36, 13, 48, height - 13);
      g.fillStyle(ink, 1); g.fillRoundedRect(7, height - 9, 7, 9, 2); g.fillRoundedRect(width - 14, height - 9, 7, 9, 2);
    }
    g.generateTexture(key, width, height);
    g.destroy();
  }

  drawCharizardTexture(key, wingUp) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const ink = 0x3e4141;
    const orange = 0xf08c4d;
    const wing = 0x6484ad;

    // Tail and flame, behind the wings and body.
    g.lineStyle(6, ink, 1); g.beginPath(); g.moveTo(59, 44); g.lineTo(75, 48); g.lineTo(82, 37); g.strokePath();
    g.lineStyle(3, orange, 1); g.beginPath(); g.moveTo(59, 44); g.lineTo(75, 48); g.lineTo(82, 37); g.strokePath();
    g.fillStyle(0xf3a43e, 1); g.lineStyle(2, ink, 1);
    g.beginPath(); g.moveTo(78, 38); g.lineTo(83, 29); g.lineTo(85, 36); g.lineTo(91, 30); g.lineTo(89, 43); g.lineTo(82, 46); g.closePath(); g.fillPath(); g.strokePath();
    g.fillStyle(0xffd55d, 1); g.fillTriangle(83, 39, 87, 32, 87, 42);

    // Two outline wings with blue inner membranes.
    g.fillStyle(orange, 1); g.lineStyle(3, ink, 1);
    if (wingUp) {
      g.beginPath(); g.moveTo(43, 34); g.lineTo(24, 4); g.lineTo(9, 6); g.lineTo(17, 38); g.lineTo(37, 49); g.closePath(); g.fillPath(); g.strokePath();
      g.fillStyle(wing, 1); g.beginPath(); g.moveTo(38, 37); g.lineTo(24, 12); g.lineTo(18, 12); g.lineTo(23, 37); g.closePath(); g.fillPath();
    } else {
      g.beginPath(); g.moveTo(43, 35); g.lineTo(22, 16); g.lineTo(7, 39); g.lineTo(27, 47); g.lineTo(40, 45); g.closePath(); g.fillPath(); g.strokePath();
      g.fillStyle(wing, 1); g.beginPath(); g.moveTo(37, 38); g.lineTo(23, 23); g.lineTo(15, 38); g.lineTo(29, 43); g.closePath(); g.fillPath();
    }
    g.fillStyle(orange, 1); g.lineStyle(3, ink, 1);
    g.beginPath(); g.moveTo(51, 34); g.lineTo(72, 8); g.lineTo(69, 39); g.lineTo(57, 49); g.closePath(); g.fillPath(); g.strokePath();
    g.fillStyle(wing, 1); g.beginPath(); g.moveTo(55, 37); g.lineTo(67, 17); g.lineTo(64, 39); g.closePath(); g.fillPath();

    // Body, neck and head facing the runner.
    g.fillStyle(orange, 1); g.lineStyle(3, ink, 1);
    g.fillEllipse(49, 48, 35, 25); g.strokeEllipse(49, 48, 35, 25);
    g.fillRoundedRect(27, 32, 15, 24, 7); g.strokeRoundedRect(27, 32, 15, 24, 7);
    g.fillEllipse(23, 29, 24, 20); g.strokeEllipse(23, 29, 24, 20);
    g.fillTriangle(18, 21, 12, 14, 22, 22); g.strokeTriangle(18, 21, 12, 14, 22, 22);
    g.fillTriangle(27, 20, 34, 14, 30, 24); g.strokeTriangle(27, 20, 34, 14, 30, 24);
    g.fillStyle(0xffddad, 1); g.fillEllipse(18, 34, 13, 6);
    g.fillStyle(ink, 1); g.fillCircle(17, 27, 2); g.fillCircle(9, 33, 1.5);
    g.fillStyle(0xffffff, 1); g.fillCircle(17.5, 26.5, .7);
    g.fillStyle(0xe97850, 1); g.fillEllipse(42, 58, 10, 7); g.fillEllipse(58, 58, 10, 7);
    g.fillStyle(orange, 1); g.lineStyle(3, ink, 1);
    g.fillRoundedRect(35, 55, 9, 13, 4); g.strokeRoundedRect(35, 55, 9, 13, 4);
    g.fillRoundedRect(54, 55, 9, 13, 4); g.strokeRoundedRect(54, 55, 9, 13, 4);
    g.fillStyle(0xffd39a, 1); g.fillEllipse(47, 47, 15, 10);
    g.generateTexture(key, 94, 72);
    g.destroy();
  }

  drawSquirtleTexture(key, step) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const ink = 0x354c57;
    const blue = 0x75c9df;
    const shell = 0xa86d48;
    const footY = step ? 75 : 72;

    // Tail and shell sit behind the head and limbs.
    g.lineStyle(4, ink, 1); g.beginPath();
    g.moveTo(70, 57); g.lineTo(88, 48); g.lineTo(84, 64); g.lineTo(73, 68); g.strokePath();
    g.fillStyle(shell, 1); g.lineStyle(3, ink, 1);
    g.fillEllipse(55, 59, 43, 37); g.strokeEllipse(55, 59, 43, 37);
    g.lineStyle(2, 0xf0bf80, 1); g.lineBetween(43, 44, 50, 58); g.lineBetween(66, 45, 60, 58);
    g.lineBetween(43, 74, 55, 64); g.lineBetween(67, 73, 59, 64);
    g.fillStyle(0xe7d1a5, 1); g.fillEllipse(55, 59, 21, 25);

    // Small flippers and feet give each frame a waddling pose.
    g.fillStyle(blue, 1); g.lineStyle(3, ink, 1);
    g.fillEllipse(28 + step * 3, 62, 21, 14); g.strokeEllipse(28 + step * 3, 62, 21, 14);
    g.fillEllipse(77 - step * 3, 62, 19, 13); g.strokeEllipse(77 - step * 3, 62, 19, 13);
    g.fillRoundedRect(38, footY, 17, 13, 6); g.strokeRoundedRect(38, footY, 17, 13, 6);
    g.fillRoundedRect(62, 74 - step * 3, 17, 13, 6); g.strokeRoundedRect(62, 74 - step * 3, 17, 13, 6);

    // Head, ears, eyes, and a cheerful smile.
    g.fillStyle(blue, 1); g.lineStyle(3, ink, 1);
    g.fillEllipse(47, 34, 48, 40); g.strokeEllipse(47, 34, 48, 40);
    g.fillTriangle(27, 22, 24, 11, 38, 23); g.strokeTriangle(27, 22, 24, 11, 38, 23);
    g.fillTriangle(57, 21, 69, 12, 65, 28); g.strokeTriangle(57, 21, 69, 12, 65, 28);
    g.fillStyle(0xffffff, 1); g.fillEllipse(38, 32, 7, 10); g.fillEllipse(56, 32, 7, 10);
    g.fillStyle(ink, 1); g.fillCircle(40, 33, 2.1); g.fillCircle(57, 33, 2.1);
    g.fillStyle(0xf18e82, 1); g.fillEllipse(29, 43, 9, 5); g.fillEllipse(66, 42, 9, 5);
    g.lineStyle(2, ink, 1); g.beginPath(); g.moveTo(44, 43); g.lineTo(48, 46); g.lineTo(52, 43); g.strokePath();
    g.fillStyle(0xf1d7aa, 1); g.fillEllipse(47, 51, 19, 9);

    g.generateTexture(key, 96, 94);
    g.destroy();
  }

  drawRayquazaTexture(key, pose) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const ink = 0x294b43;
    const green = 0x42a77d;
    const gold = 0xe6c45f;
    const bob = pose ? 3 : 0;

    // Long, looping body with pale belly plates and gold rings.
    g.lineStyle(23, ink, 1); g.beginPath();
    g.moveTo(28, 51 + bob); g.lineTo(46, 35); g.lineTo(69, 42 + bob); g.lineTo(91, 29);
    g.lineTo(113, 41); g.lineTo(136, 28 + bob); g.lineTo(157, 42); g.strokePath();
    g.lineStyle(16, green, 1); g.beginPath();
    g.moveTo(28, 51 + bob); g.lineTo(46, 35); g.lineTo(69, 42 + bob); g.lineTo(91, 29);
    g.lineTo(113, 41); g.lineTo(136, 28 + bob); g.lineTo(157, 42); g.strokePath();
    g.lineStyle(3, 0xd4edaa, .95); g.beginPath();
    g.moveTo(34, 57 + bob); g.lineTo(49, 43); g.lineTo(68, 50 + bob); g.lineTo(91, 37);
    g.lineTo(112, 49); g.lineTo(135, 36 + bob); g.lineTo(153, 49); g.strokePath();
    [47, 72, 96, 120, 143].forEach((x, i) => {
      const y = [37, 43 + bob, 30, 42, 29 + bob][i];
      g.fillStyle(gold, 1); g.lineStyle(2, ink, 1); g.strokeCircle(x, y, 10); g.strokeCircle(x, y, 5);
    });

    // Horned head and fins make the long green dragon silhouette readable.
    g.fillStyle(green, 1); g.lineStyle(3, ink, 1);
    g.fillEllipse(22, 50 + bob, 35, 29); g.strokeEllipse(22, 50 + bob, 35, 29);
    g.fillTriangle(13, 39 + bob, 3, 22, 25, 37 + bob); g.strokeTriangle(13, 39 + bob, 3, 22, 25, 37 + bob);
    g.fillTriangle(29, 38 + bob, 43, 20, 42, 43 + bob); g.strokeTriangle(29, 38 + bob, 43, 20, 42, 43 + bob);
    g.fillTriangle(8, 61 + bob, 0, 74 + bob, 20, 67 + bob); g.strokeTriangle(8, 61 + bob, 0, 74 + bob, 20, 67 + bob);
    g.fillTriangle(55, 31, 65, 13, 72, 36); g.strokeTriangle(55, 31, 65, 13, 72, 36);
    g.fillTriangle(112, 33, 120, 14, 128, 37); g.strokeTriangle(112, 33, 120, 14, 128, 37);
    g.fillStyle(0xffe68b, 1); g.fillEllipse(17, 48 + bob, 10, 7);
    g.fillStyle(ink, 1); g.fillCircle(16, 47 + bob, 2.2);
    g.lineStyle(2, 0xf4e8b1, 1); g.lineBetween(8, 56 + bob, 23, 58 + bob);
    g.fillStyle(0xe98568, 1); g.fillTriangle(29, 54 + bob, 42, 57 + bob, 30, 62 + bob);

    g.generateTexture(key, 170, 92);
    g.destroy();
  }

  createWorld() {
    this.sky = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xf4edda).setDepth(-10);
    this.backdrop = this.add.graphics().setDepth(-8);
    this.ground = this.add.graphics().setDepth(4);
    this.makeCloud(190, 134, .9);
    this.makeCloud(545, 192, .7);
    this.makeCloud(852, 232, .6);
    for (let i = 0; i < 22; i++) {
      const mark = this.add.rectangle(Phaser.Math.Between(0, WIDTH), Phaser.Math.Between(FLOOR_Y + 16, HEIGHT - 10), Phaser.Math.Between(7, 25), Phaser.Math.Between(2, 4), 0xbca979, .55).setDepth(5);
      this.groundMarks.push(mark);
    }
    this.drawStageBackground();
  }

  drawStageBackground() {
    this.backdrop.clear();
    this.ground.clear();
    this.clouds.forEach(cloud => cloud.setVisible(this.stage !== 2));

    if (this.stage === 0) {
      this.sky.setFillStyle(0xf4edda);
      this.backdrop.fillStyle(0xe8d8b6, 1);
      this.backdrop.beginPath(); this.backdrop.moveTo(0, 330); this.backdrop.lineTo(150, 255); this.backdrop.lineTo(285, 332); this.backdrop.lineTo(445, 244); this.backdrop.lineTo(620, 328); this.backdrop.lineTo(790, 265); this.backdrop.lineTo(960, 332); this.backdrop.lineTo(960, FLOOR_Y); this.backdrop.lineTo(0, FLOOR_Y); this.backdrop.closePath(); this.backdrop.fillPath();
      this.backdrop.fillStyle(0xd9c89f, 1);
      this.backdrop.beginPath(); this.backdrop.moveTo(0, 362); this.backdrop.lineTo(165, 309); this.backdrop.lineTo(315, 366); this.backdrop.lineTo(505, 298); this.backdrop.lineTo(685, 364); this.backdrop.lineTo(845, 313); this.backdrop.lineTo(960, 358); this.backdrop.lineTo(960, FLOOR_Y); this.backdrop.lineTo(0, FLOOR_Y); this.backdrop.closePath(); this.backdrop.fillPath();
      this.backdrop.fillStyle(0xf4ce72, .84); this.backdrop.fillCircle(814, 136, 37);
      this.ground.fillStyle(0xe8d09e, 1); this.ground.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
      this.ground.fillStyle(0x8e8e64, 1); this.ground.fillRect(0, FLOOR_Y, WIDTH, 4);
      this.ground.lineStyle(1, 0xc6ae7f, .6); this.ground.lineBetween(0, FLOOR_Y + 22, WIDTH, FLOOR_Y + 22);
      this.groundMarks.forEach(mark => { mark.setFillStyle(0xbca979, .55); mark.setSize(Phaser.Math.Between(7, 25), 3); mark.y = Phaser.Math.Between(FLOOR_Y + 16, HEIGHT - 10); });
    } else if (this.stage === 1) {
      this.sky.setFillStyle(0xb8e5ef);
      this.backdrop.fillStyle(0xf9d878, 1); this.backdrop.fillCircle(795, 130, 43);
      this.backdrop.fillStyle(0x78bdbe, 1); this.backdrop.fillEllipse(182, 305, 270, 95); this.backdrop.fillEllipse(720, 298, 345, 105);
      this.backdrop.fillStyle(0x4baeb2, 1); this.backdrop.fillRect(0, 286, WIDTH, 156);
      this.backdrop.fillStyle(0x73c8c1, 1); this.backdrop.fillRect(0, 330, WIDTH, 74);
      this.backdrop.lineStyle(3, 0xdaf4dc, .8);
      for (let x = 18; x < WIDTH; x += 126) {
        this.backdrop.beginPath(); this.backdrop.moveTo(x, 315 + (x % 3) * 5); this.backdrop.lineTo(x + 34, 315 + (x % 3) * 5); this.backdrop.strokePath();
      }
      // Two simple palms frame the sea without crowding the running lane.
      [[90, 301], [879, 296]].forEach(([x, y]) => {
        this.backdrop.lineStyle(9, 0x9b7149, 1); this.backdrop.lineBetween(x, y + 5, x + 6, y - 72);
        this.backdrop.lineStyle(7, 0x478865, 1);
        this.backdrop.beginPath(); this.backdrop.moveTo(x + 6, y - 72); this.backdrop.lineTo(x - 39, y - 85); this.backdrop.strokePath();
        this.backdrop.beginPath(); this.backdrop.moveTo(x + 6, y - 72); this.backdrop.lineTo(x - 25, y - 103); this.backdrop.strokePath();
        this.backdrop.beginPath(); this.backdrop.moveTo(x + 6, y - 72); this.backdrop.lineTo(x + 2, y - 111); this.backdrop.strokePath();
        this.backdrop.beginPath(); this.backdrop.moveTo(x + 6, y - 72); this.backdrop.lineTo(x + 39, y - 97); this.backdrop.strokePath();
        this.backdrop.beginPath(); this.backdrop.moveTo(x + 6, y - 72); this.backdrop.lineTo(x + 47, y - 78); this.backdrop.strokePath();
      });
      this.ground.fillStyle(0xf2d49a, 1); this.ground.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
      this.ground.fillStyle(0xe8bd7c, 1); this.ground.fillRect(0, FLOOR_Y, WIDTH, 5);
      this.ground.lineStyle(1, 0xd8b77e, .75); this.ground.lineBetween(0, FLOOR_Y + 22, WIDTH, FLOOR_Y + 22);
      this.groundMarks.forEach(mark => { mark.setFillStyle(0xd1b174, .5); mark.setSize(Phaser.Math.Between(8, 24), 3); mark.y = Phaser.Math.Between(FLOOR_Y + 15, HEIGHT - 10); });
    } else {
      this.sky.setFillStyle(0xb7d6e6);
      // Taipei skyline with a stepped Taipei 101 silhouette in the distance.
      const buildings = [
        [0, 270, 118, 172], [105, 304, 104, 138], [200, 246, 98, 196],
        [716, 278, 98, 164], [802, 237, 88, 205], [882, 291, 112, 151],
      ];
      buildings.forEach(([x, y, w, h], index) => {
        const colors = [0x7797a2, 0x91a9ae, 0x688894];
        this.backdrop.fillStyle(colors[index % colors.length], 1); this.backdrop.fillRect(x, y, w, h);
        this.backdrop.lineStyle(2, 0xe1eef0, .45); this.backdrop.strokeRect(x + 7, y + 7, w - 14, h - 7);
        for (let wy = y + 17; wy < FLOOR_Y - 8; wy += 24) {
          for (let wx = x + 14; wx < x + w - 7; wx += 23) {
            this.backdrop.fillStyle(0xdbe8c7, .62); this.backdrop.fillRect(wx, wy, 10, 12);
          }
        }
      });
      this.backdrop.fillStyle(0x697c7d, 1); this.backdrop.fillRect(0, 398, WIDTH, 46);
      this.backdrop.fillStyle(0x43605e, .22); this.backdrop.fillEllipse(480, 437, 166, 24);
      const towerTiers = [
        { y: 366, width: 132, height: 76, color: 0x4c827b },
        { y: 312, width: 120, height: 54, color: 0x568e84 },
        { y: 258, width: 108, height: 54, color: 0x4e857d },
        { y: 208, width: 96, height: 50, color: 0x5a9287 },
        { y: 169, width: 84, height: 39, color: 0x4e827c },
        { y: 138, width: 72, height: 31, color: 0x639a8c },
        { y: 112, width: 60, height: 26, color: 0x51857d },
      ];
      towerTiers.forEach((tier, index) => {
        const x = 480 - tier.width / 2;
        this.backdrop.fillStyle(tier.color, 1); this.backdrop.lineStyle(3, 0x355f5c, 1);
        this.backdrop.fillRect(x, tier.y, tier.width, tier.height); this.backdrop.strokeRect(x, tier.y, tier.width, tier.height);
        this.backdrop.fillStyle(index % 2 ? 0x8db8a4 : 0x77aa9b, 1);
        this.backdrop.fillRect(x - 5, tier.y + tier.height - 9, tier.width + 10, 7);
        this.backdrop.lineStyle(2, 0xc4ddbd, .8);
        for (let windowX = x + 12; windowX < x + tier.width - 5; windowX += 14) {
          this.backdrop.lineBetween(windowX, tier.y + 8, windowX, tier.y + tier.height - 12);
        }
        this.backdrop.lineStyle(2, 0xd7e5c3, .8); this.backdrop.lineBetween(x + 8, tier.y + tier.height / 2, x + tier.width - 8, tier.y + tier.height / 2);
      });
      this.backdrop.fillStyle(0x5a8581, 1); this.backdrop.fillRect(476, 93, 8, 19);
      this.backdrop.fillStyle(0x729b93, 1); this.backdrop.fillTriangle(480, 75, 473, 95, 487, 95);
      this.ground.fillStyle(0x4d555a, 1); this.ground.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
      this.ground.fillStyle(0x374046, 1); this.ground.fillRect(0, FLOOR_Y, WIDTH, 5);
      this.groundMarks.forEach((mark, i) => {
        mark.setFillStyle(i % 2 ? 0xfff0ac : 0xf5f4e6, .9);
        mark.setSize(i % 2 ? 25 : 17, 4);
        mark.y = FLOOR_Y + 49;
      });
    }
  }

  makeCloud(x, y, scale) {
    const cloud = this.add.container(x, y).setDepth(-6).setScale(scale);
    cloud.add([
      this.add.ellipse(-25, 6, 45, 23, 0xffffff, .82),
      this.add.ellipse(0, 0, 52, 31, 0xffffff, .86),
      this.add.ellipse(29, 8, 42, 22, 0xffffff, .82),
      this.add.rectangle(1, 12, 61, 15, 0xffffff, .84),
    ]);
    this.clouds.push(cloud);
  }

  createHud() {
    const plate = this.add.graphics().setDepth(18);
    plate.fillStyle(0xfffcf3, .9); plate.fillRoundedRect(26, 22, 908, 60, 17);
    plate.lineStyle(1, 0x6c755f, .16); plate.strokeRoundedRect(26, 22, 908, 60, 17);
    this.add.text(48, 32, 'SCORE', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '11px', color: '#879080', fontStyle: '900', letterSpacing: 2 }).setDepth(19);
    this.scoreText = this.add.text(48, 47, '00000', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '23px', color: '#394949', fontStyle: '900' }).setDepth(19);
    this.add.text(795, 34, 'BEST', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '11px', color: '#879080', fontStyle: '900', letterSpacing: 2 }).setDepth(19);
    this.bestText = this.add.text(795, 49, this.formatScore(this.best), { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '21px', color: '#5b7d69', fontStyle: '900' }).setDepth(19);
    this.noticeText = this.add.text(WIDTH / 2, 111, '', {
      fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '17px', color: '#634b24', fontStyle: '900',
      backgroundColor: '#fff6cc', padding: { left: 16, right: 16, top: 9, bottom: 9 },
    }).setOrigin(.5).setDepth(20).setAlpha(0);
  }

  createPlayer() {
    this.player = this.add.image(154, FLOOR_Y, 'pika-run-a').setOrigin(.5, 1).setDepth(9);
    this.player.setDisplaySize(76, 90);
    this.runFrameTime = 0;
    this.isDucking = false;
  }

  createControls() {
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys({ jump: 'SPACE', up: 'UP', down: 'DOWN', retry: 'R', enter: 'ENTER' });
      this.input.keyboard.on('keydown-SPACE', () => this.handleAction());
      this.input.keyboard.on('keydown-UP', () => this.handleAction());
      this.input.keyboard.on('keydown-ENTER', () => this.handleAction());
      this.input.keyboard.on('keydown-Z', () => this.attackEnemy());
      this.input.keyboard.on('keydown-R', () => { if (this.mode === 'over' || this.mode === 'won') this.scene.restart(); });
    }

    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver.length) return;
      if (this.mode === 'ready') {
        this.startRun(true);
      } else if (this.mode === 'over' || this.mode === 'won') {
        this.scene.restart();
      } else if (pointer.worldX > WIDTH * .76) {
        this.touchDuck = true;
      } else {
        this.jump();
      }
    });
    this.input.on('pointerup', () => { this.touchDuck = false; });
    this.input.on('pointerout', () => { this.touchDuck = false; });
  }

  handleAction() {
    if (this.mode === 'ready') this.startRun(true);
    else if (this.mode === 'over' || this.mode === 'won') this.scene.restart();
    else this.jump();
  }

  showReadyOverlay() {
    this.overlay = this.add.container(0, 0).setDepth(30);
    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x263a38, .12);
    const card = this.add.graphics();
    card.fillStyle(0xfffcf3, .97); card.fillRoundedRect(282, 169, 396, 220, 24);
    card.lineStyle(2, 0xd7d8c2, 1); card.strokeRoundedRect(282, 169, 396, 220, 24);
    const title = this.add.text(WIDTH / 2, 207, '皮卡丘快跑！', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '29px', color: '#414a43', fontStyle: '900' }).setOrigin(.5);
    const copy = this.add.text(WIDTH / 2, 251, '跳過障礙；遇到敵人時按 Z\n使出十萬伏特擊倒牠！', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '13px', color: '#778175', align: 'center', lineSpacing: 5 }).setOrigin(.5);
    const button = this.add.rectangle(WIDTH / 2, 316, 182, 48, 0xe8bb50).setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(WIDTH / 2, 316, '開始奔跑', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '16px', color: '#423b2a', fontStyle: '900' }).setOrigin(.5);
    const hint = this.add.text(WIDTH / 2, 363, '空白鍵 / ↑ / 點擊開始', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '12px', color: '#9a9a85' }).setOrigin(.5);
    button.on('pointerover', () => button.setFillStyle(0xf0c95f));
    button.on('pointerout', () => button.setFillStyle(0xe8bb50));
    button.on('pointerdown', () => this.startRun(true));
    this.overlay.add([shade, card, title, copy, button, buttonText, hint]);
  }

  startRun(jumpAtStart = false) {
    if (this.mode !== 'ready') return;
    this.mode = 'running';
    this.overlay?.destroy();
    this.overlay = null;
    this.spawnIn = 1050;
    if (jumpAtStart) this.jump();
  }

  jump() {
    if (this.mode !== 'running' || !this.grounded) return;
    this.grounded = false;
    this.isDucking = false;
    this.velocityY = -735;
    this.player.setDisplaySize(76, 90);
  }

  spawnObstacle() {
    const enemy = this.enemyForStage(this.stage);
    const canSpawnEnemy = this.score - this.stageStartScore > 90;
    const isEnemy = canSpawnEnemy && Math.random() < .24;
    let image;
    let collider;
    let y;
    let type;
    let species = null;
    if (isEnemy) {
      species = enemy.species;
      const yOffset = species === 'rayquaza' ? Phaser.Math.Between(235, 270) : species === 'squirtle' ? Phaser.Math.Between(49, 60) : Phaser.Math.Between(71, 84);
      image = this.add.image(WIDTH + 50, FLOOR_Y - yOffset, enemy.frames[0]).setDepth(8);
      image.setOrigin(.5, .5).setDisplaySize(enemy.size.width, enemy.size.height);
      collider = { width: enemy.size.width * .72, height: enemy.size.height * .66 };
      y = image.y;
      type = 'enemy';
    } else {
      const tall = Math.random() < .45;
      const choices = this.stage === 0
        ? (tall ? ['cactus-tall', 42, 62] : ['cactus-small', 30, 48])
        : this.stage === 1
          ? (tall ? ['beach-log', 54, 30] : ['beach-shell', 40, 34])
          : (tall ? ['city-barrier', 60, 42] : ['city-cone', 34, 48]);
      const [key, w, h] = choices;
      image = this.add.image(WIDTH + 50, FLOOR_Y, key).setDepth(8).setOrigin(.5, 1).setDisplaySize(w, h);
      collider = { width: w * .72, height: h * .82 };
      y = FLOOR_Y;
      type = 'hazard';
    }
    this.obstacles.push({ image, collider, type, species, y, x: WIDTH + 50, wingTimer: 0, wing: 0, alerted: false, defeated: false, attacking: false });
  }

  enemyForStage(stage) {
    const enemies = [
      { species: 'charizard', label: '噴火龍', frames: ['charizard-a', 'charizard-b'], size: { width: 104, height: 80 } },
      { species: 'squirtle', label: '傑尼龜', frames: ['squirtle-a', 'squirtle-b'], size: { width: 91, height: 89 } },
      { species: 'rayquaza', label: '烈空坐', frames: ['rayquaza-a', 'rayquaza-b'], size: { width: 153, height: 83 } },
    ];
    return enemies[stage] || enemies[0];
  }

  checkProgression() {
    const targetStage = this.score > 1000 ? 2 : this.score > 500 ? 1 : 0;
    if (targetStage <= this.stage) return;
    const activeEnemy = this.obstacles.find(obstacle => obstacle.type === 'enemy' && !obstacle.attacking);
    if (activeEnemy) {
      this.pendingStage = targetStage;
      this.spawnIn = Math.max(this.spawnIn, 900);
      return;
    }
    this.switchStage(targetStage);
  }

  switchStage(stage) {
    if (stage <= this.stage || this.mode !== 'running') return;
    this.stage = stage;
    this.stageStartScore = stage * 500;
    this.pendingStage = null;
    this.obstacles.forEach(obstacle => obstacle.image.destroy());
    this.obstacles = [];
    this.spawnIn = 1500;
    this.drawStageBackground();
    this.cameras.main.flash(420, 255, 255, 255);
  }

  update(time, delta) {
    if (this.mode !== 'running') return;
    const dt = Math.min(delta, 48) / 1000;
    this.elapsed += delta;
    this.score = Math.floor(this.elapsed / 100) + this.bonusScore;
    this.speed = 360 + Math.floor(this.score / 500) * 85;
    this.scoreText.setText(this.formatScore(this.score));
    this.checkProgression();
    if (this.mode !== 'running') return;

    const duckKey = Boolean(this.keys?.down?.isDown);
    this.isDucking = this.grounded && (duckKey || this.touchDuck);
    this.player.setDisplaySize(76, this.isDucking ? 62 : 90);

    if (!this.grounded) {
      this.velocityY += 1900 * dt;
      this.feetY += this.velocityY * dt;
      if (this.feetY >= FLOOR_Y) {
        this.feetY = FLOOR_Y;
        this.velocityY = 0;
        this.grounded = true;
      }
    }
    this.player.y = this.feetY;

    if (this.grounded && !this.isDucking) {
      this.runFrameTime += delta;
      if (this.runFrameTime > 115) {
        this.runFrameTime = 0;
        this.player.setTexture(this.player.texture.key === 'pika-run-a' ? 'pika-run-b' : 'pika-run-a');
      }
    } else {
      this.player.setTexture('pika-run-a');
    }

    this.spawnIn -= delta;
    if (this.spawnIn <= 0 && !this.pendingStage) {
      this.spawnObstacle();
      const difficulty = Math.min(340, this.score * 1.3);
      this.spawnIn = Phaser.Math.Between(1120 - difficulty, 1580 - difficulty);
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      if (obstacle.defeated || obstacle.attacking) continue;
      obstacle.x -= this.speed * dt;
      obstacle.image.x = obstacle.x;
      if (obstacle.type === 'enemy') {
        const enemy = this.enemyForStage(this.stage);
        obstacle.wingTimer += delta;
        if (obstacle.wingTimer > 130) {
          obstacle.wingTimer = 0;
          obstacle.wing = 1 - obstacle.wing;
          obstacle.image.setTexture(obstacle.wing ? enemy.frames[1] : enemy.frames[0]);
        }
        if (!obstacle.alerted && obstacle.x <= 700) {
          obstacle.alerted = true;
          this.showNotice(`${enemy.label}來襲！按 Z 使出十萬伏特！`, 1400);
          document.getElementById('attack-button')?.classList.add('ready');
        }
        if (obstacle.x <= this.player.x + 86) {
          this.enemyAttack(obstacle);
          return;
        }
      }
      if (obstacle.x < -80) {
        obstacle.image.destroy();
        this.obstacles.splice(i, 1);
      } else if (obstacle.type === 'hazard' && this.collidesWith(obstacle)) {
        this.endRun('obstacle');
        return;
      }
    }

    this.groundMarks.forEach(mark => {
      mark.x -= this.speed * dt;
      if (mark.x < -20) mark.x = WIDTH + Phaser.Math.Between(10, 100);
    });
    this.clouds.forEach(cloud => {
      cloud.x -= this.speed * dt * .055;
      if (cloud.x < -100) cloud.x = WIDTH + Phaser.Math.Between(40, 180);
    });
  }

  collidesWith(obstacle) {
    const duck = this.isDucking && this.grounded;
    const playerRect = {
      left: this.player.x - (duck ? 25 : 23),
      right: this.player.x + (duck ? 25 : 23),
      top: this.feetY - (duck ? 47 : 77),
      bottom: this.feetY - 6,
    };
    const obsRect = {
      left: obstacle.x - obstacle.collider.width / 2,
      right: obstacle.x + obstacle.collider.width / 2,
      top: obstacle.y - obstacle.collider.height / 2,
      bottom: obstacle.y + obstacle.collider.height / 2,
    };
    if (obstacle.type === 'hazard') {
      obsRect.top = FLOOR_Y - obstacle.collider.height;
      obsRect.bottom = FLOOR_Y - 2;
    }
    return playerRect.left < obsRect.right && playerRect.right > obsRect.left && playerRect.top < obsRect.bottom && playerRect.bottom > obsRect.top;
  }

  showNotice(message, duration = 950) {
    if (!this.noticeText || this.mode === 'over') return;
    this.noticeSerial = (this.noticeSerial || 0) + 1;
    const serial = this.noticeSerial;
    this.noticeTimer?.remove(false);
    this.tweens.killTweensOf(this.noticeText);
    this.noticeText.setText(message).setAlpha(1).setScale(.94);
    this.tweens.add({ targets: this.noticeText, scale: 1, duration: 130, ease: 'Back.easeOut' });
    this.noticeTimer = this.time.delayedCall(duration, () => {
      if (serial === this.noticeSerial && this.mode === 'running') this.tweens.add({ targets: this.noticeText, alpha: 0, duration: 180 });
    });
  }

  attackEnemy() {
    if (this.mode !== 'running') return;
    const target = this.obstacles.find(obstacle => obstacle.type === 'enemy' && !obstacle.defeated && !obstacle.attacking);
    if (!target) {
      this.showNotice('目前沒有敵人，先專心跳過障礙！', 1050);
      return;
    }
    const enemy = this.enemyForStage(this.stage);
    if (target.x > 700) {
      this.showNotice(`${enemy.label}還太遠，等牠靠近再按 Z。`, 1050);
      return;
    }
    if (target.x <= this.player.x + 86) {
      this.enemyAttack(target);
      return;
    }

    target.defeated = true;
    this.bonusScore += 50;
    this.score += 50;
    this.scoreText.setText(this.formatScore(this.score));
    document.getElementById('attack-button')?.classList.remove('ready');
    this.showNotice(`十萬伏特！${enemy.label}被擊倒了！ +50`, 1200);
    this.createElectricEffect(target);
    this.tweens.add({
      targets: target.image,
      x: target.x + 105,
      y: target.y + 95,
      angle: 100,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        target.image.destroy();
        this.obstacles = this.obstacles.filter(obstacle => obstacle !== target);
        this.checkProgression();
      },
    });
  }

  createElectricEffect(target) {
    const startX = this.player.x + 25;
    const startY = this.player.y - (this.isDucking ? 39 : 55);
    const endX = target.x - 40;
    const endY = target.y - 2;
    const points = [{ x: startX, y: startY }];
    for (let i = 1; i < 7; i++) {
      const t = i / 7;
      points.push({ x: startX + (endX - startX) * t, y: startY + (endY - startY) * t + Phaser.Math.Between(-22, 22) });
    }
    points.push({ x: endX, y: endY });
    const bolt = this.add.graphics().setDepth(24);
    const draw = (width, color, alpha) => {
      bolt.lineStyle(width, color, alpha);
      bolt.beginPath(); bolt.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => bolt.lineTo(point.x, point.y));
      bolt.strokePath();
    };
    draw(15, 0x71c7ff, .6);
    draw(8, 0xffdc42, 1);
    draw(3, 0xffffff, 1);
    this.cameras.main.flash(120, 255, 244, 145);
    for (let i = 0; i < 9; i++) {
      const spark = this.add.circle(target.x + Phaser.Math.Between(-27, 27), target.y + Phaser.Math.Between(-20, 20), Phaser.Math.Between(3, 6), i % 2 ? 0xffe45c : 0x8bdcff).setDepth(25);
      this.tweens.add({ targets: spark, x: spark.x + Phaser.Math.Between(-36, 36), y: spark.y + Phaser.Math.Between(-35, 35), alpha: 0, scale: .15, duration: 420, onComplete: () => spark.destroy() });
    }
    this.tweens.add({ targets: bolt, alpha: 0, duration: 260, onComplete: () => bolt.destroy() });
  }

  enemyAttack(target) {
    if (this.mode !== 'running' || target.attacking || target.defeated) return;
    target.attacking = true;
    this.mode = 'danger';
    document.getElementById('attack-button')?.classList.remove('ready');
    const enemy = this.enemyForStage(this.stage);
    const attackCopy = {
      charizard: '噴火龍噴出火焰！',
      squirtle: '傑尼龜使出水槍！',
      rayquaza: '烈空坐發出龍之波動！',
    }[target.species] || '敵人發動攻擊！';
    this.showNotice(`來不及了！${attackCopy}`, 650);
    this.cameras.main.shake(240, .006);
    const colors = target.species === 'squirtle' ? [0x50bfe9, 0x9ce8ff] : target.species === 'rayquaza' ? [0x48be83, 0xb6ee82] : [0xf05438, 0xffae32];
    for (let i = 0; i < 14; i++) {
      const y = target.y + Phaser.Math.Between(-18, 20);
      const projectile = target.species === 'squirtle'
        ? this.add.ellipse(target.x - 42, y, Phaser.Math.Between(8, 17), Phaser.Math.Between(7, 13), colors[i % 2], .96)
        : this.add.triangle(target.x - 43, y, 0, 10, 25, 0, 0, -10, colors[i % 2], .98);
      projectile.setDepth(26);
      this.tweens.add({ targets: projectile, x: this.player.x + Phaser.Math.Between(-6, 28), y: projectile.y + Phaser.Math.Between(-22, 22), scaleX: 1.6, scaleY: 1.5, alpha: 0, duration: Phaser.Math.Between(280, 510), onComplete: () => projectile.destroy() });
    }
    this.time.delayedCall(520, () => this.endRun(target.species));
  }

  endRun(reason = 'obstacle') {
    if (this.mode === 'over' || this.mode === 'won') return;
    if (this.score > 1500) {
      this.winRun();
      return;
    }
    this.mode = 'over';
    this.touchDuck = false;
    document.getElementById('attack-button')?.classList.remove('ready');
    if (this.score > this.best) {
      this.best = this.score;
      this.bestText.setText(this.formatScore(this.best));
      this.saveBest();
    }
    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x293936, .3).setDepth(28);
    const panel = this.add.graphics().setDepth(29);
    panel.fillStyle(0xfffcf3, .98); panel.fillRoundedRect(320, 171, 320, 215, 22);
    panel.lineStyle(2, 0xd7d8c2, 1); panel.strokeRoundedRect(320, 171, 320, 215, 22);
    const failures = {
      charizard: '被噴火龍的火焰擊中！',
      squirtle: '被傑尼龜的水槍擊中！',
      rayquaza: '被烈空坐的龍之波動擊中！',
    };
    const titleText = failures[reason] || '哎呀，撞到了！';
    const title = this.add.text(WIDTH / 2, 210, titleText, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: failures[reason] ? '19px' : '25px', color: '#414a43', fontStyle: '900' }).setOrigin(.5).setDepth(30);
    const score = this.add.text(WIDTH / 2, 252, `本次分數　${this.formatScore(this.score)}`, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '16px', color: '#657465', fontStyle: 'bold' }).setOrigin(.5).setDepth(30);
    const best = this.add.text(WIDTH / 2, 280, `最高紀錄　${this.formatScore(this.best)}`, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#81907b' }).setOrigin(.5).setDepth(30);
    const button = this.add.rectangle(WIDTH / 2, 333, 170, 45, 0xe8bb50).setInteractive({ useHandCursor: true }).setDepth(30);
    const buttonText = this.add.text(WIDTH / 2, 333, '再玩一次', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '15px', color: '#423b2a', fontStyle: '900' }).setOrigin(.5).setDepth(31);
    button.on('pointerover', () => button.setFillStyle(0xf0c95f));
    button.on('pointerout', () => button.setFillStyle(0xe8bb50));
    button.on('pointerdown', () => this.scene.restart());
    this.overlay = [shade, panel, title, score, best, button, buttonText];
  }

  winRun() {
    if (this.mode === 'won' || this.mode === 'over') return;
    this.mode = 'won';
    this.touchDuck = false;
    document.getElementById('attack-button')?.classList.remove('ready');
    if (this.score > this.best) {
      this.best = this.score;
      this.bestText.setText(this.formatScore(this.best));
      this.saveBest();
    }
    this.obstacles.forEach(obstacle => obstacle.image.destroy());
    this.obstacles = [];

    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x17313a, .56).setDepth(28);
    const panel = this.add.graphics().setDepth(29);
    panel.fillStyle(0xfffcf3, .99); panel.fillRoundedRect(230, 38, 500, 484, 28);
    panel.lineStyle(3, 0xe4c561, 1); panel.strokeRoundedRect(230, 38, 500, 484, 28);

    // A celebratory illustration: Pikachu, a champion medal, sparkles, and confetti.
    const halo = this.add.circle(WIDTH / 2, 173, 100, 0xfff1bd, 1).setDepth(30);
    const art = this.add.graphics().setDepth(31);
    art.lineStyle(6, 0xd3a83e, 1); art.lineBetween(397, 209, 423, 247); art.lineBetween(543, 209, 517, 247);
    art.fillStyle(0xe8bd4d, 1); art.lineStyle(4, 0x99752d, 1); art.fillCircle(393, 198, 27); art.strokeCircle(393, 198, 27); art.fillCircle(547, 198, 27); art.strokeCircle(547, 198, 27);
    const drawStar = (x, y, radius, color) => {
      art.fillStyle(color, 1); art.beginPath();
      for (let point = 0; point < 10; point++) {
        const angle = -Math.PI / 2 + point * Math.PI / 5;
        const distance = point % 2 === 0 ? radius : radius * .43;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        if (point === 0) art.moveTo(px, py); else art.lineTo(px, py);
      }
      art.closePath(); art.fillPath();
    };
    drawStar(393, 198, 16, 0xfff2bc); drawStar(547, 198, 16, 0xfff2bc);
    [[326, 127], [357, 97], [605, 116], [633, 163], [342, 235], [615, 240], [480, 68]].forEach(([x, y], i) => {
      drawStar(x, y, i % 2 ? 8 : 10, i % 2 ? 0x79c9d1 : 0xef9f66);
    });
    const pika = this.add.image(WIDTH / 2, 191, 'pika-run-b').setDisplaySize(132, 156).setDepth(32);
    pika.setOrigin(.5, .5);
    const title = this.add.text(WIDTH / 2, 294, '挑戰成功！', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '34px', color: '#b57c20', fontStyle: '900' }).setOrigin(.5).setDepth(33);
    const subtitle = this.add.text(WIDTH / 2, 336, '恭喜成為寶可夢大師', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '21px', color: '#53675d', fontStyle: '900' }).setOrigin(.5).setDepth(33);
    const score = this.add.text(WIDTH / 2, 376, `通關分數　${this.formatScore(this.score)}`, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '15px', color: '#798778', fontStyle: 'bold' }).setOrigin(.5).setDepth(33);
    const button = this.add.rectangle(WIDTH / 2, 438, 178, 46, 0xe8bb50).setInteractive({ useHandCursor: true }).setDepth(33);
    const buttonText = this.add.text(WIDTH / 2, 438, '再玩一次', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '15px', color: '#423b2a', fontStyle: '900' }).setOrigin(.5).setDepth(34);
    const hint = this.add.text(WIDTH / 2, 478, '按 R 也可以重新挑戰', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '12px', color: '#9a9a85' }).setOrigin(.5).setDepth(34);
    button.on('pointerover', () => button.setFillStyle(0xf0c95f));
    button.on('pointerout', () => button.setFillStyle(0xe8bb50));
    button.on('pointerdown', () => this.scene.restart());
    this.tweens.add({ targets: [halo, pika], scale: '+=0.04', yoyo: true, repeat: -1, duration: 850, ease: 'Sine.easeInOut' });
    this.overlay = [shade, panel, art, halo, pika, title, subtitle, score, button, buttonText, hint];
  }

  formatScore(score) {
    return String(Math.max(0, score)).padStart(5, '0');
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#f4edda',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT,
  },
  input: { activePointers: 3 },
  scene: [PikachuRun],
});

document.getElementById('attack-button')?.addEventListener('click', () => {
  game.scene.getScene('PikachuRun')?.attackEnemy();
});
