const WIDTH = 960;
const HEIGHT = 600;
const GOAL = 100;

const palette = {
  ink: 0x30494a,
  dark: 0x35595a,
  green: 0x6f9d80,
  cream: 0xf8efdc,
  coral: 0xe98870,
  gold: 0xe4b75e,
  floor: 0xd9c6a3,
};

class ResetRoom extends Phaser.Scene {
  constructor() {
    super('ResetRoom');
    this.score = 0;
    this.moveDirection = 0;
    this.isPunching = false;
    this.finished = false;
    this.stressBubbles = [];
  }

  create() {
    this.drawClassroom();
    this.createHud();
    this.createPlayer();
    this.createPunchingBag();
    this.createStressBubbles();
    this.createInput();
    this.showMessage('準備好就開始吧！', 1500);
  }

  drawClassroom() {
    const g = this.add.graphics();
    // Warm classroom wall and floor.
    g.fillStyle(0xf3e9d3, 1); g.fillRect(0, 0, WIDTH, 402);
    g.fillStyle(0xd8c39f, 1); g.fillRect(0, 402, WIDTH, HEIGHT - 402);
    g.fillStyle(0xc7ad84, 1); g.fillRect(0, 402, WIDTH, 9);
    // Ceiling trim and wall panels.
    g.fillStyle(0xe5d5b9, 1); g.fillRect(0, 0, WIDTH, 18);
    g.lineStyle(2, 0xe6d9c3, .9); g.lineBetween(0, 393, WIDTH, 393);
    // Windows.
    this.drawWindow(g, 54, 67, 147, 139);
    this.drawWindow(g, 220, 67, 147, 139);
    // Blackboard.
    g.fillStyle(0x3b6660, 1); g.fillRoundedRect(400, 63, 390, 195, 8);
    g.fillStyle(0xb68d5f, 1); g.fillRoundedRect(391, 54, 408, 211, 10);
    g.fillStyle(0x3b6660, 1); g.fillRoundedRect(400, 63, 390, 195, 8);
    g.fillStyle(0xe9dfc7, .82); g.fillRoundedRect(424, 84, 125, 9, 4);
    g.fillStyle(0xd7e2c5, .76); g.fillRoundedRect(424, 104, 184, 6, 3);
    g.lineStyle(3, 0xd7e2c5, .75);
    g.strokeCircle(699, 132, 39); g.lineBetween(660, 132, 738, 132); g.lineBetween(699, 93, 699, 171);
    g.fillStyle(0xe9dfc7, .9); g.fillRoundedRect(474, 225, 244, 9, 4);
    // Classroom wall poster.
    g.fillStyle(0xfff8e8, 1); g.fillRoundedRect(822, 68, 98, 131, 7);
    g.fillStyle(0xe5b75f, 1); g.fillCircle(871, 105, 20);
    g.fillStyle(0x6b9c7b, 1); g.fillRoundedRect(839, 139, 64, 7, 3);
    g.fillStyle(0xa2b68e, 1); g.fillRoundedRect(839, 154, 50, 6, 3);
    g.fillStyle(0xd9977d, 1); g.fillRoundedRect(839, 169, 57, 6, 3);
    // A small plant in the corner.
    g.fillStyle(0xb7895e, 1); g.fillRoundedRect(861, 354, 48, 42, 6);
    g.fillStyle(0x67906c, 1); g.fillEllipse(875, 342, 18, 43); g.fillEllipse(891, 332, 20, 42); g.fillEllipse(902, 350, 18, 39);
    // Desks and chairs to make it feel like a classroom, without other people.
    this.drawDesk(g, 92, 362, .82);
    this.drawDesk(g, 270, 367, .88);
    this.drawDesk(g, 495, 365, .84);
    this.drawDesk(g, 755, 365, .85);
    // subtle floor boards
    g.lineStyle(1, 0xc4af8e, .45);
    for (let y = 445; y < HEIGHT; y += 49) g.lineBetween(0, y, WIDTH, y);
    for (let x = 70; x < WIDTH; x += 155) g.lineBetween(x, 412, x - 45, HEIGHT);
  }

  drawWindow(g, x, y, w, h) {
    g.fillStyle(0xfff6e7, 1); g.fillRoundedRect(x - 7, y - 7, w + 14, h + 14, 8);
    g.fillStyle(0xc7e1d7, 1); g.fillRoundedRect(x, y, w, h, 4);
    g.fillStyle(0xe3f1df, .78); g.fillRect(x + 8, y + 9, w - 16, h - 18);
    g.fillStyle(0xf2d99b, .72); g.fillCircle(x + w * .72, y + h * .28, 15);
    g.fillStyle(0x9abd9c, .75); g.fillEllipse(x + 38, y + h - 28, 73, 41);
    g.fillStyle(0x80aa8b, .78); g.fillEllipse(x + 96, y + h - 25, 76, 46);
    g.fillStyle(0xf6efe1, 1); g.fillRect(x + w * .48 - 3, y, 6, h); g.fillRect(x, y + h * .53 - 3, w, 6);
    g.fillStyle(0xe1c7a0, 1); g.fillRoundedRect(x - 9, y + h + 4, w + 18, 9, 3);
  }

  drawDesk(g, x, y, scale) {
    const w = 126 * scale;
    g.fillStyle(0x9d7551, 1); g.fillRoundedRect(x - w / 2, y, w, 15 * scale, 5);
    g.fillStyle(0xb18a61, 1); g.fillRoundedRect(x - w / 2 + 4, y - 8 * scale, w - 8, 13 * scale, 4);
    g.fillStyle(0x806548, 1);
    g.fillRoundedRect(x - w / 2 + 10, y + 15 * scale, 7 * scale, 39 * scale, 3);
    g.fillRoundedRect(x + w / 2 - 17, y + 15 * scale, 7 * scale, 39 * scale, 3);
    g.fillStyle(0x799183, 1); g.fillRoundedRect(x - 30 * scale, y + 44 * scale, 60 * scale, 8 * scale, 4);
    g.fillStyle(0x8ca698, 1); g.fillRoundedRect(x - 25 * scale, y + 52 * scale, 6 * scale, 32 * scale, 3);
    g.fillRoundedRect(x + 19 * scale, y + 52 * scale, 6 * scale, 32 * scale, 3);
  }

  createHud() {
    const hud = this.add.container(0, 0).setDepth(20);
    const plate = this.add.graphics();
    plate.fillStyle(0xfffcf4, .96); plate.fillRoundedRect(24, 20, 912, 64, 18);
    plate.lineStyle(1, 0x58756c, .12); plate.strokeRoundedRect(24, 20, 912, 64, 18);
    hud.add(plate);
    this.add.text(47, 35, '能量值', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#6c7e70', fontStyle: 'bold' }).setDepth(21);
    this.scoreText = this.add.text(48, 51, '0', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '23px', color: '#315e51', fontStyle: '900' }).setDepth(21);
    this.add.text(103, 58, '/ 100', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#819187', fontStyle: 'bold' }).setDepth(21);
    this.add.text(175, 44, '點沙包 +10　　點壓力泡泡 +5', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '14px', color: '#607268', fontStyle: 'bold' }).setDepth(21);
    this.progressBack = this.add.graphics().setDepth(21);
    this.progressBack.fillStyle(0xe8ecdf, 1); this.progressBack.fillRoundedRect(565, 46, 276, 15, 8);
    this.progressFill = this.add.graphics().setDepth(22);
    this.progressFill.fillStyle(0x79a77e, 1); this.progressFill.fillRoundedRect(565, 46, 0, 15, 8);
    this.add.text(860, 42, '目標', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '11px', color: '#8a988c', fontStyle: 'bold' }).setDepth(21);
    this.add.text(860, 56, '100', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '16px', color: '#48765d', fontStyle: '900' }).setDepth(21);
    this.statusText = this.add.text(WIDTH / 2, 291, '', {
      fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '20px', color: '#fffaf0', fontStyle: 'bold',
      backgroundColor: '#345950', padding: { left: 18, right: 18, top: 10, bottom: 10 },
    }).setOrigin(.5).setDepth(30).setAlpha(0);
  }

  createPlayer() {
    this.player = this.add.container(330, 454).setDepth(10);
    const shadow = this.add.ellipse(0, 8, 78, 17, 0x675a45, .2);
    const legs = this.add.graphics();
    legs.fillStyle(0x435f69, 1); legs.fillRoundedRect(-20, -16, 15, 37, 6); legs.fillRoundedRect(7, -16, 15, 37, 6);
    legs.fillStyle(0x6c5548, 1); legs.fillRoundedRect(-25, 16, 25, 9, 5); legs.fillRoundedRect(2, 16, 25, 9, 5);
    const body = this.add.graphics();
    body.fillStyle(0x72a787, 1); body.fillRoundedRect(-31, -77, 62, 66, 18);
    body.fillStyle(0x5d9172, 1); body.fillRoundedRect(-31, -32, 62, 21, 9);
    this.backArm = this.add.rectangle(-37, -50, 17, 48, 9, 0xe5b48d).setOrigin(.5, .12).setRotation(-.1);
    this.frontArm = this.add.rectangle(34, -50, 17, 47, 9, 0xe5b48d).setOrigin(.5, .12).setRotation(.05);
    const head = this.add.circle(0, -101, 27, 0xf0c49b);
    const hair = this.add.graphics();
    hair.fillStyle(0x493a32, 1); hair.fillRoundedRect(-27, -130, 54, 27, 15); hair.fillCircle(-20, -110, 10); hair.fillCircle(4, -118, 12);
    const face = this.add.graphics();
    face.fillStyle(0x4c4940, 1); face.fillCircle(-9, -100, 2); face.fillCircle(9, -100, 2);
    face.lineStyle(2, 0x9b6558, 1); face.beginPath(); face.arc(0, -92, 6, .3, 2.8, false); face.strokePath();
    this.player.add([shadow, legs, this.backArm, body, this.frontArm, head, hair, face]);
  }

  createPunchingBag() {
    const bagX = 703;
    const bagTop = 244;
    const rope = this.add.graphics().setDepth(4);
    rope.lineStyle(5, 0x9b805c, 1); rope.lineBetween(bagX, 211, bagX, bagTop + 4);
    rope.fillStyle(0x9b805c, 1); rope.fillRoundedRect(bagX - 27, 204, 54, 9, 4);
    this.bag = this.add.container(bagX, 323).setDepth(7);
    const bagShadow = this.add.ellipse(0, 77, 77, 18, 0x75634d, .18);
    const body = this.add.graphics();
    body.fillStyle(0xcf745e, 1); body.fillRoundedRect(-31, -80, 62, 147, 24);
    body.fillStyle(0xe79276, 1); body.fillRoundedRect(-24, -73, 13, 131, 7);
    body.fillStyle(0xa95e53, 1); body.fillRoundedRect(-28, -18, 56, 7, 4); body.fillRoundedRect(-28, 36, 56, 7, 4);
    body.lineStyle(2, 0x9c594d, .75); body.strokeRoundedRect(-31, -80, 62, 147, 24);
    const label = this.add.text(0, -5, '沙包', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '15px', color: '#fff5e6', fontStyle: 'bold' }).setOrigin(.5);
    const target = this.add.circle(0, -7, 56, 0xffffff, 0).setInteractive({ useHandCursor: true });
    target.on('pointerdown', () => this.punchBag());
    target.on('pointerover', () => { if (!this.finished) this.input.setDefaultCursor('pointer'); });
    target.on('pointerout', () => this.input.setDefaultCursor('default'));
    this.bag.add([bagShadow, body, label, target]);
    this.bagTarget = target;
    this.add.text(bagX, 411, '安全練習區', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '12px', color: '#64806e', fontStyle: 'bold', backgroundColor: '#f8f3e8', padding: { left: 9, right: 9, top: 5, bottom: 5 } }).setOrigin(.5).setDepth(8);
  }

  createStressBubbles() {
    const seeds = [
      { x: 438, y: 316, color: 0x9bbaca, label: '煩' },
      { x: 552, y: 273, color: 0xb3a4d3, label: '累' },
      { x: 610, y: 354, color: 0xe9bd70, label: '悶' },
    ];
    seeds.forEach((seed, index) => this.addStressBubble(seed, index));
  }

  addStressBubble(seed, index) {
    if (this.finished) return;
    const bubble = this.add.container(seed.x, seed.y).setDepth(8);
    const shadow = this.add.ellipse(4, 10, 53, 16, 0x786e62, .11);
    const orb = this.add.circle(0, 0, 25, seed.color, .92).setStrokeStyle(3, 0xffffff, .85);
    const shine = this.add.circle(-8, -9, 6, 0xffffff, .53);
    const label = this.add.text(0, 0, seed.label, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '15px', color: '#fffdf5', fontStyle: 'bold' }).setOrigin(.5);
    const target = this.add.circle(0, 0, 34, 0xffffff, 0).setInteractive({ useHandCursor: true });
    target.on('pointerdown', () => this.popBubble(bubble, seed));
    target.on('pointerover', () => { if (!this.finished) this.input.setDefaultCursor('pointer'); });
    target.on('pointerout', () => this.input.setDefaultCursor('default'));
    bubble.add([shadow, orb, shine, label, target]);
    bubble.setScale(.86);
    this.tweens.add({ targets: bubble, y: seed.y - 9, duration: 1250 + index * 130, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.stressBubbles.push({ container: bubble, seed, index });
  }

  createInput() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D,SPACE');
    this.input.keyboard.on('keydown-SPACE', () => this.punchBag());
    this.input.on('pointerdown', (pointer, currentlyOver) => {
      // Tap open floor to walk; the bag and bubbles have their own pointer handlers.
      if (this.finished || currentlyOver.length) return;
      if (pointer.worldY > 410) this.walkTo(Phaser.Math.Clamp(pointer.worldX, 52, 900));
    });
  }

  update() {
    if (this.finished || !this.player || this.isPunching) return;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    this.moveDirection = left ? -1 : right ? 1 : 0;
    if (this.moveDirection) {
      this.player.x = Phaser.Math.Clamp(this.player.x + this.moveDirection * 3.4, 52, 906);
      this.player.scaleX = this.moveDirection > 0 ? 1 : -1;
    }
  }

  walkTo(x) {
    this.tweens.add({ targets: this.player, x, duration: 360, ease: 'Sine.easeOut' });
    this.player.scaleX = x >= this.player.x ? 1 : -1;
  }

  punchBag() {
    if (this.finished || this.isPunching) return;
    this.isPunching = true;
    this.player.scaleX = this.player.x <= this.bag.x ? 1 : -1;
    this.tweens.add({
      targets: this.player, x: this.bag.x - 80, duration: 210, ease: 'Sine.easeOut',
      onComplete: () => {
        this.frontArm.setRotation(-1.35);
        this.tweens.add({
          targets: this.bag, angle: { from: -8, to: 9 }, duration: 105, yoyo: true, repeat: 2,
          onComplete: () => { this.bag.setAngle(0); this.frontArm.setRotation(.05); this.isPunching = false; },
        });
        this.cameras.main.shake(90, .0025);
        this.addScore(10, this.bag.x, this.bag.y - 85, '+10 能量');
      },
    });
  }

  popBubble(bubble, seed) {
    if (this.finished || !bubble.active) return;
    const { x, y } = bubble;
    this.tweens.killTweensOf(bubble);
    this.tweens.add({ targets: bubble, scale: .05, alpha: 0, duration: 170, ease: 'Back.easeIn', onComplete: () => {
      bubble.destroy();
      const entry = this.stressBubbles.find(item => item.container === bubble);
      if (entry) this.stressBubbles.splice(this.stressBubbles.indexOf(entry), 1);
      this.time.delayedCall(1500, () => this.addStressBubble({ x: seed.x, y: seed.y, color: seed.color, label: ['呼', '鬆', '好'][Phaser.Math.Between(0, 2)] }, (seed.x % 3)));
    }});
    this.addScore(5, x, y - 28, '+5 放鬆');
    this.createSparkles(x, y, seed.color);
  }

  createSparkles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, .9).setDepth(18);
      const angle = (Math.PI * 2 * i) / 6;
      this.tweens.add({ targets: dot, x: x + Math.cos(angle) * 35, y: y + Math.sin(angle) * 35, alpha: 0, scale: .2, duration: 360, onComplete: () => dot.destroy() });
    }
  }

  addScore(amount, x, y, label) {
    if (this.finished) return;
    this.score = Math.min(GOAL, this.score + amount);
    this.scoreText.setText(String(this.score));
    this.progressFill.clear();
    this.progressFill.fillStyle(0x79a77e, 1);
    this.progressFill.fillRoundedRect(565, 46, 276 * this.score / GOAL, 15, 8);
    const popup = this.add.text(x, y, label, { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '18px', color: '#315a4e', fontStyle: '900', stroke: '#fffaf0', strokeThickness: 5 }).setOrigin(.5).setDepth(25);
    this.tweens.add({ targets: popup, y: y - 48, alpha: 0, duration: 850, ease: 'Cubic.easeOut', onComplete: () => popup.destroy() });
    if (this.score >= GOAL) this.finishGame();
  }

  showMessage(message, duration = 1000) {
    this.statusText.setText(message).setAlpha(1).setScale(.9);
    this.tweens.add({ targets: this.statusText, scale: 1, duration: 140, ease: 'Back.easeOut' });
    this.time.delayedCall(duration, () => {
      if (!this.finished) this.tweens.add({ targets: this.statusText, alpha: 0, duration: 220 });
    });
  }

  finishGame() {
    this.finished = true;
    this.input.setDefaultCursor('default');
    this.input.keyboard?.removeAllListeners();
    this.stressBubbles.forEach(({ container }) => container.destroy());
    this.stressBubbles = [];
    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x263d3b, .56).setDepth(40);
    const card = this.add.container(WIDTH / 2, HEIGHT / 2).setDepth(41);
    const panel = this.add.graphics();
    panel.fillStyle(0xfffcf4, 1); panel.fillRoundedRect(-229, -141, 458, 282, 24);
    panel.lineStyle(2, 0xd9e6d8, 1); panel.strokeRoundedRect(-229, -141, 458, 282, 24);
    const star = this.add.text(0, -96, '✦', { fontFamily: 'sans-serif', fontSize: '40px', color: '#e1b458' }).setOrigin(.5);
    const title = this.add.text(0, -40, '壓力釋放成功！', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '31px', color: '#315a50', fontStyle: '900' }).setOrigin(.5);
    const body = this.add.text(0, 10, '你為自己累積了 100 點能量。\n記得喝口水，給自己一個小小的休息。', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '16px', color: '#6d7f74', align: 'center', lineSpacing: 8 }).setOrigin(.5);
    const button = this.add.rectangle(0, 91, 176, 46, 0x5d9275).setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(0, 91, '再玩一次', { fontFamily: 'Nunito, Noto Sans TC, sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(.5);
    button.on('pointerover', () => button.setFillStyle(0x4d8065));
    button.on('pointerout', () => button.setFillStyle(0x5d9275));
    button.on('pointerdown', () => this.scene.restart());
    card.add([panel, star, title, body, button, buttonText]);
    this.tweens.add({ targets: card, scale: { from: .92, to: 1 }, alpha: { from: 0, to: 1 }, duration: 250, ease: 'Back.easeOut' });
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#e9eddf',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT,
  },
  input: { activePointers: 3 },
  scene: [ResetRoom],
});
