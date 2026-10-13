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
    this.drawBirdTexture('bird-a', 0);
    this.drawBirdTexture('bird-b', 1);
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

  drawBirdTexture(key, wingUp) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const ink = 0x39494b;
    g.fillStyle(0x6c7978, 1); g.lineStyle(2, ink, 1);
    g.fillEllipse(25, 20, 31, 16); g.strokeEllipse(25, 20, 31, 16);
    g.fillCircle(38, 17, 8); g.strokeCircle(38, 17, 8);
    g.fillStyle(0xe6b95d, 1); g.fillTriangle(44, 16, 53, 19, 44, 21);
    g.fillStyle(ink, 1); g.fillCircle(40, 15, 1.5);
    g.fillStyle(0x82908d, 1); g.lineStyle(2, ink, 1);
    if (wingUp) {
      g.fillTriangle(22, 19, 12, 1, 30, 14); g.strokeTriangle(22, 19, 12, 1, 30, 14);
    } else {
      g.fillTriangle(22, 19, 11, 33, 31, 25); g.strokeTriangle(22, 19, 11, 33, 31, 25);
    }
    g.lineStyle(2, ink, 1); g.lineBetween(14, 22, 4, 18); g.lineBetween(14, 24, 5, 28);
    g.generateTexture(key, 56, 36);
    g.destroy();
  }

  createWorld() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xf4edda).setDepth(-10);
    const far = this.add.graphics().setDepth(-8);
    far.fillStyle(0xe8d8b6, 1);
    far.beginPath(); far.moveTo(0, 330); far.lineTo(150, 255); far.lineTo(285, 332); far.lineTo(445, 244); far.lineTo(620, 328); far.lineTo(790, 265); far.lineTo(960, 332); far.lineTo(960, FLOOR_Y); far.lineTo(0, FLOOR_Y); far.closePath(); far.fillPath();
    far.fillStyle(0xd9c89f, 1);
    far.beginPath(); far.moveTo(0, 362); far.lineTo(165, 309); far.lineTo(315, 366); far.lineTo(505, 298); far.lineTo(685, 364); far.lineTo(845, 313); far.lineTo(960, 358); far.lineTo(960, FLOOR_Y); far.lineTo(0, FLOOR_Y); far.closePath(); far.fillPath();

    this.add.circle(814, 136, 37, 0xf4ce72, .84).setDepth(-7);
    this.makeCloud(190, 134, .9);
    this.makeCloud(545, 192, .7);
    this.makeCloud(852, 232, .6);

    const ground = this.add.graphics().setDepth(4);
    ground.fillStyle(0xe8d09e, 1); ground.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    ground.fillStyle(0x8e8e64, 1); ground.fillRect(0, FLOOR_Y, WIDTH, 4);
    ground.lineStyle(1, 0xc6ae7f, .6); ground.lineBetween(0, FLOOR_Y + 22, WIDTH, FLOOR_Y + 22);
    for (let i = 0; i < 22; i++) {
      const mark = this.add.rectangle(Phaser.Math.Between(0, WIDTH), Phaser.Math.Between(FLOOR_Y + 16, HEIGHT - 10), Phaser.Math.Between(7, 25), Phaser.Math.Between(2, 4), 0xbca979, .55).setDepth(5);
      this.groundMarks.push(mark);
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
    this.add.text(480, 51, '跑得越遠，分數越高', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#748174', fontStyle: 'bold' }).setOrigin(.5).setDepth(19);
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
      this.input.keyboard.on('keydown-R', () => { if (this.mode === 'over') this.scene.restart(); });
    }

    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver.length) return;
      if (this.mode === 'ready') {
        this.startRun(true);
      } else if (this.mode === 'over') {
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
    else if (this.mode === 'over') this.scene.restart();
    else this.jump();
  }

  showReadyOverlay() {
    this.overlay = this.add.container(0, 0).setDepth(30);
    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x263a38, .12);
    const card = this.add.graphics();
    card.fillStyle(0xfffcf3, .97); card.fillRoundedRect(282, 169, 396, 220, 24);
    card.lineStyle(2, 0xd7d8c2, 1); card.strokeRoundedRect(282, 169, 396, 220, 24);
    const title = this.add.text(WIDTH / 2, 207, '皮卡丘快跑！', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '29px', color: '#414a43', fontStyle: '900' }).setOrigin(.5);
    const copy = this.add.text(WIDTH / 2, 251, '跳過仙人掌，躲開飛鳥，跑出你的最高分。', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#778175' }).setOrigin(.5);
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
    const canSpawnBird = this.score > 90;
    const isBird = canSpawnBird && Math.random() < .24;
    let image;
    let collider;
    let y;
    let type;
    if (isBird) {
      image = this.add.image(WIDTH + 50, FLOOR_Y - Phaser.Math.Between(60, 86), 'bird-a').setDepth(8);
      image.setOrigin(.5, .5).setDisplaySize(56, 36);
      collider = { width: 40, height: 18 };
      y = image.y;
      type = 'bird';
    } else {
      const tall = Math.random() < .45;
      const key = tall ? 'cactus-tall' : 'cactus-small';
      const w = tall ? 42 : 30;
      const h = tall ? 62 : 48;
      image = this.add.image(WIDTH + 50, FLOOR_Y, key).setDepth(8).setOrigin(.5, 1).setDisplaySize(w, h);
      collider = { width: tall ? 29 : 20, height: tall ? 51 : 39 };
      y = FLOOR_Y;
      type = 'cactus';
    }
    this.obstacles.push({ image, collider, type, y, x: WIDTH + 50, wingTimer: 0, wing: 0 });
  }

  update(time, delta) {
    if (this.mode !== 'running') return;
    const dt = Math.min(delta, 48) / 1000;
    this.elapsed += delta;
    this.score = Math.floor(this.elapsed / 100);
    this.speed = Math.min(690, 360 + this.score * 1.45);
    this.scoreText.setText(this.formatScore(this.score));

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
    if (this.spawnIn <= 0) {
      this.spawnObstacle();
      const difficulty = Math.min(340, this.score * 1.3);
      this.spawnIn = Phaser.Math.Between(1120 - difficulty, 1580 - difficulty);
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed * dt;
      obstacle.image.x = obstacle.x;
      if (obstacle.type === 'bird') {
        obstacle.wingTimer += delta;
        if (obstacle.wingTimer > 130) {
          obstacle.wingTimer = 0;
          obstacle.wing = 1 - obstacle.wing;
          obstacle.image.setTexture(obstacle.wing ? 'bird-b' : 'bird-a');
        }
      }
      if (obstacle.x < -80) {
        obstacle.image.destroy();
        this.obstacles.splice(i, 1);
      } else if (this.collidesWith(obstacle)) {
        this.endRun();
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
    if (obstacle.type === 'cactus') {
      obsRect.top = FLOOR_Y - obstacle.collider.height;
      obsRect.bottom = FLOOR_Y - 2;
    }
    return playerRect.left < obsRect.right && playerRect.right > obsRect.left && playerRect.top < obsRect.bottom && playerRect.bottom > obsRect.top;
  }

  endRun() {
    this.mode = 'over';
    if (this.score > this.best) {
      this.best = this.score;
      this.bestText.setText(this.formatScore(this.best));
      this.saveBest();
    }
    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x293936, .3).setDepth(28);
    const panel = this.add.graphics().setDepth(29);
    panel.fillStyle(0xfffcf3, .98); panel.fillRoundedRect(320, 171, 320, 215, 22);
    panel.lineStyle(2, 0xd7d8c2, 1); panel.strokeRoundedRect(320, 171, 320, 215, 22);
    const title = this.add.text(WIDTH / 2, 210, '哎呀，撞到了！', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '25px', color: '#414a43', fontStyle: '900' }).setOrigin(.5).setDepth(30);
    const score = this.add.text(WIDTH / 2, 252, `本次分數　${this.formatScore(this.score)}`, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '16px', color: '#657465', fontStyle: 'bold' }).setOrigin(.5).setDepth(30);
    const best = this.add.text(WIDTH / 2, 280, `最高紀錄　${this.formatScore(this.best)}`, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#81907b' }).setOrigin(.5).setDepth(30);
    const button = this.add.rectangle(WIDTH / 2, 333, 170, 45, 0xe8bb50).setInteractive({ useHandCursor: true }).setDepth(30);
    const buttonText = this.add.text(WIDTH / 2, 333, '再跑一次', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '15px', color: '#423b2a', fontStyle: '900' }).setOrigin(.5).setDepth(31);
    button.on('pointerover', () => button.setFillStyle(0xf0c95f));
    button.on('pointerout', () => button.setFillStyle(0xe8bb50));
    button.on('pointerdown', () => this.scene.restart());
    this.overlay = [shade, panel, title, score, best, button, buttonText];
  }

  formatScore(score) {
    return String(Math.max(0, score)).padStart(5, '0');
  }
}

new Phaser.Game({
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
