const palette = {
  ink: 0x3f4c43,
  muted: 0x7f8b7c,
  paper: 0xfaf5e7,
  white: 0xfffdf7,
  gold: 0xe9c450,
  goldDark: 0xc89c2f,
  green: 0x879a79,
  greenDark: 0x607a63,
  blue: 0x8fc0c3,
  coral: 0xd8846d,
  plum: 0x9d91b4,
  line: 0xe9e0c9
}

const colors = [palette.gold, palette.green, palette.coral, palette.blue, palette.plum]
const colorNames = ["金色", "綠色", "橘色", "藍色", "紫色"]
function label(scene, x, y, value, size = 15, color = palette.ink, origin = 0.5) {
  return scene.add.text(x, y, value, {
    fontFamily: 'system-ui, "PingFang TC", sans-serif',
    fontSize: size + "px",
    fontStyle: "bold",
    color: "#" + color.toString(16).padStart(6, "0")
  }).setOrigin(origin)
}

function rounded(scene, x, y, width, height, fill, stroke = palette.line, radius = 12) {
  const shape = scene.add.rectangle(x, y, width, height, fill)
  shape.setStrokeStyle(1, stroke)
  shape.setInteractive({ useHandCursor: true })
  return shape
}

function background(scene, title, hint) {
  scene.cameras.main.setBackgroundColor(palette.paper)
  label(scene, 20, 20, title, 14, palette.ink, 0)
  label(scene, 460, 20, hint, 11, palette.muted, 1)
  scene.add.rectangle(240, 39, 440, 1, palette.line)
}

const modes = {
  platformer: {
    create() {
      background(this, "跳躍收集", "方向鍵移動　空白鍵跳躍")
      this.score = 0
      this.scoreLabel = label(this, 26, 51, "星星 0", 12, palette.goldDark, 0)
      this.platforms = [
        { x: 143, y: 218, w: 98 },
        { x: 286, y: 176, w: 94 },
        { x: 410, y: 132, w: 92 }
      ]
      this.platforms.forEach((platform) => {
        this.add.rectangle(platform.x, platform.y, platform.w, 11, palette.green)
        this.add.rectangle(platform.x, platform.y + 6, platform.w, 3, palette.greenDark)
      })
      this.add.rectangle(240, 279, 480, 42, palette.green)
      this.add.rectangle(240, 258, 480, 4, palette.greenDark)
      this.player = { x: 52, y: 237, vx: 0, vy: 0, grounded: true }
      this.hero = this.add.container(this.player.x, this.player.y)
      this.hero.add(this.add.ellipse(0, 0, 25, 28, palette.gold))
      this.hero.add(this.add.ellipse(-5, -2, 3, 5, palette.ink))
      this.hero.add(this.add.ellipse(5, -2, 3, 5, palette.ink))
      this.hero.add(this.add.ellipse(0, 5, 7, 3, palette.coral))
      this.stars = [
        { x: 98, y: 226, taken: false },
        { x: 171, y: 195, taken: false },
        { x: 300, y: 153, taken: false },
        { x: 422, y: 109, taken: false }
      ]
      this.stars.forEach((star) => {
        star.shape = this.add.star(star.x, star.y, 5, 6, 13, palette.gold)
      })
      this.keys = this.input.keyboard.addKeys("LEFT,RIGHT,SPACE,UP")
    },
    update(_, delta) {
      const p = this.player
      const left = this.keys.LEFT.isDown
      const right = this.keys.RIGHT.isDown
      p.vx = left ? -210 : right ? 210 : 0
      if ((Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.UP)) && p.grounded) {
        p.vy = -390
        p.grounded = false
      }
      p.x = Phaser.Math.Clamp(p.x + p.vx * delta / 1000, 12, 468)
      const priorY = p.y
      p.vy += 930 * delta / 1000
      p.y += p.vy * delta / 1000
      p.grounded = false
      if (p.y > 244 && priorY <= 244 && p.vy > 0) {
        p.y = 244
        p.vy = 0
        p.grounded = true
      }
      this.platforms.forEach((platform) => {
        if (p.vy > 0 && priorY + 12 <= platform.y - 5 && p.y + 12 >= platform.y - 5 && Math.abs(p.x - platform.x) < platform.w / 2 + 8) {
          p.y = platform.y - 17
          p.vy = 0
          p.grounded = true
        }
      })
      this.hero.setPosition(p.x, p.y)
      this.stars.forEach((star) => {
        if (!star.taken && Phaser.Math.Distance.Between(p.x, p.y, star.x, star.y) < 22) {
          star.taken = true
          star.shape.setVisible(false)
          this.score += 1
          this.scoreLabel.setText("星星 " + this.score)
        }
      })
    }
  },
  clicker: {
    create() {
      background(this, "點擊金幣", "點一下金幣就得分")
      this.score = 0
      this.scoreLabel = label(this, 240, 66, "分數 0", 18, palette.goldDark)
      this.coins = []
      for (let i = 0; i < 6; i += 1) modes.clicker.addCoin.call(this, i)
    },
    addCoin(index) {
      const x = 65 + (index % 3) * 175 + Phaser.Math.Between(-16, 16)
      const y = 125 + Math.floor(index / 3) * 82 + Phaser.Math.Between(-12, 12)
      const coin = this.add.circle(x, y, 25, palette.gold).setStrokeStyle(3, palette.goldDark)
      const shine = this.add.circle(x - 7, y - 8, 5, palette.white)
      coin.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.score += 10
        this.scoreLabel.setText("分數 " + this.score)
        coin.setPosition(Phaser.Math.Between(42, 438), Phaser.Math.Between(106, 242))
        shine.setPosition(coin.x - 7, coin.y - 8)
      })
      this.coins.push(coin)
    }
  },
  dodge: {
    create() {
      background(this, "閃避與收集", "方向鍵左右移動")
      this.score = 0
      this.scoreLabel = label(this, 27, 52, "收集 0", 12, palette.goldDark, 0)
      for (let x = 24; x < 480; x += 48) this.add.rectangle(x, 165, 1, 210, palette.line)
      this.player = this.add.circle(240, 252, 14, palette.gold).setStrokeStyle(3, palette.goldDark)
      this.keys = this.input.keyboard.addKeys("LEFT,RIGHT,A,D")
      this.falling = []
      this.spawnClock = 0
      this.input.on("pointermove", (pointer) => {
        if (pointer.isDown) this.player.x = Phaser.Math.Clamp(pointer.x, 18, 462)
      })
    },
    spawn() {
      const isGood = Phaser.Math.Between(0, 100) < 35
      const x = Phaser.Math.Between(26, 454)
      const y = 56
      const shape = isGood ? this.add.star(x, y, 5, 6, 13, palette.gold) : this.add.circle(x, y, 13, palette.coral)
      this.falling.push({ shape, good: isGood, speed: Phaser.Math.Between(95, 160) })
    },
    update(_, delta) {
      const dt = delta / 1000
      const move = (this.keys.RIGHT.isDown || this.keys.D.isDown ? 1 : 0) - (this.keys.LEFT.isDown || this.keys.A.isDown ? 1 : 0)
      this.player.x = Phaser.Math.Clamp(this.player.x + move * 260 * dt, 18, 462)
      this.spawnClock += delta
      if (this.spawnClock > 760) {
        this.spawnClock = 0
        this.spawn()
      }
      this.falling = this.falling.filter((item) => {
        item.shape.y += item.speed * dt
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, item.shape.x, item.shape.y) < 23) {
          if (item.good) {
            this.score += 1
            this.scoreLabel.setText("收集 " + this.score)
          } else {
            this.player.setFillStyle(palette.coral)
            this.time.delayedCall(220, () => this.player.setFillStyle(palette.gold))
          }
          item.shape.destroy()
          return false
        }
        if (item.shape.y > 320) {
          item.shape.destroy()
          return false
        }
        return true
      })
    }
  },
  breakout: {
    create() {
      background(this, "反彈預測", "移動滑鼠控制擋板")
      this.score = 0
      this.scoreLabel = label(this, 27, 52, "磚塊 0", 12, palette.goldDark, 0)
      this.bricks = []
      const brickColors = [palette.coral, palette.gold, palette.blue]
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 8; col += 1) {
          const x = 48 + col * 55
          const y = 84 + row * 24
          this.bricks.push({ x, y, shape: this.add.rectangle(x, y, 46, 15, brickColors[row]) })
        }
      }
      this.paddle = this.add.rectangle(240, 267, 94, 13, palette.green).setStrokeStyle(2, palette.greenDark)
      this.ball = this.add.circle(240, 239, 8, palette.goldDark)
      this.velocity = { x: 190, y: -190 }
      this.input.on("pointermove", (pointer) => this.paddle.setX(Phaser.Math.Clamp(pointer.x, 48, 432)))
      this.input.on("pointerdown", () => {
        if (this.ball.y > 245) this.velocity.y = -190
      })
    },
    update(_, delta) {
      const dt = delta / 1000
      const b = this.ball
      b.x += this.velocity.x * dt
      b.y += this.velocity.y * dt
      if (b.x < 8 || b.x > 472) this.velocity.x *= -1
      if (b.y < 50) this.velocity.y *= -1
      if (this.velocity.y > 0 && b.y + 8 >= this.paddle.y - 6 && b.y < this.paddle.y && Math.abs(b.x - this.paddle.x) < 55) {
        this.velocity.y = -Math.abs(this.velocity.y)
        this.velocity.x += (b.x - this.paddle.x) * 1.2
      }
      const hit = this.bricks.find((brick) => brick.shape.visible && Math.abs(b.x - brick.x) < 27 && Math.abs(b.y - brick.y) < 13)
      if (hit) {
        hit.shape.setVisible(false)
        this.velocity.y *= -1
        this.score += 1
        this.scoreLabel.setText("磚塊 " + this.score)
      }
      if (b.y > 310) {
        b.setPosition(240, 239)
        this.velocity.y = -Math.abs(this.velocity.y)
      }
    }
  },
  snake: {
    create() {
      background(this, "貪食蛇", "方向鍵改變前進方向")
      this.score = 0
      this.scoreLabel = label(this, 27, 52, "長度 3", 12, palette.goldDark, 0)
      this.grid = { x: 78, y: 63, size: 18, cols: 18, rows: 12 }
      this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]
      this.direction = { x: 1, y: 0 }
      this.food = { x: 13, y: 7 }
      this.turnClock = 0
      this.input.keyboard.on("keydown", (event) => {
        const next = { ...this.direction }
        if (event.code === "ArrowUp" && next.y !== 1) Object.assign(next, { x: 0, y: -1 })
        if (event.code === "ArrowDown" && next.y !== -1) Object.assign(next, { x: 0, y: 1 })
        if (event.code === "ArrowLeft" && next.x !== 1) Object.assign(next, { x: -1, y: 0 })
        if (event.code === "ArrowRight" && next.x !== -1) Object.assign(next, { x: 1, y: 0 })
        this.direction = next
      })
      modes.snake.drawBoard.call(this)
    },
    drawBoard() {
      if (this.boardGroup) this.boardGroup.destroy(true)
      this.boardGroup = this.add.container(0, 0)
      const { x, y, size } = this.grid
      for (let row = 0; row < this.grid.rows; row += 1) {
        for (let col = 0; col < this.grid.cols; col += 1) {
          this.boardGroup.add(this.add.rectangle(x + col * size + 8, y + row * size + 8, size - 2, size - 2, (row + col) % 2 ? 0xf2ebd8 : 0xf6f0e2))
        }
      }
      this.boardGroup.add(this.add.circle(x + this.food.x * size + 8, y + this.food.y * size + 8, 6, palette.coral))
      this.snake.forEach((part, index) => {
        this.boardGroup.add(this.add.rectangle(x + part.x * size + 8, y + part.y * size + 8, size - 3, size - 3, index === 0 ? palette.gold : palette.green))
      })
    },
    update(_, delta) {
      this.turnClock += delta
      if (this.turnClock < 145) return
      this.turnClock = 0
      const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y }
      const hitWall = head.x < 0 || head.y < 0 || head.x >= this.grid.cols || head.y >= this.grid.rows
      const hitSelf = this.snake.some((part, index) => index > 0 && part.x === head.x && part.y === head.y)
      if (hitWall || hitSelf) {
        this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]
        this.direction = { x: 1, y: 0 }
        this.score = 0
        this.scoreLabel.setText("長度 3")
      } else {
        this.snake.unshift(head)
        if (head.x === this.food.x && head.y === this.food.y) {
          this.score += 1
          this.scoreLabel.setText("長度 " + (this.snake.length))
          this.food = { x: Phaser.Math.Between(0, this.grid.cols - 1), y: Phaser.Math.Between(0, this.grid.rows - 1) }
        } else {
          this.snake.pop()
        }
      }
      modes.snake.drawBoard.call(this)
    }
  },
  memory: {
    create() {
      background(this, "寶可夢屬性配對", "找到寶可夢與屬性卡")
      this.state = "memory"
      this.pairs = [
        { id: "electric", pokemon: "⚡ 皮卡丘", type: "電系", fact: "皮卡丘是電系，地面系招式對電系效果絕佳" },
        { id: "fire", pokemon: "🔥 小火龍", type: "火系", fact: "小火龍是火系，火系招式對草系效果絕佳" },
        { id: "water", pokemon: "💧 傑尼龜", type: "水系", fact: "傑尼龜是水系，水系招式對火系效果絕佳" },
        { id: "grass-poison", pokemon: "🌱 妙蛙種子", type: "草／毒", fact: "妙蛙種子同時有草與毒兩種屬性" },
        { id: "normal", pokemon: "⭐ 伊布", type: "一般系", fact: "伊布是一般系，幽靈系招式對一般系無效" },
        { id: "ghost-poison", pokemon: "👻 耿鬼", type: "幽靈／毒", fact: "耿鬼同時有幽靈與毒兩種屬性" }
      ]
      this.moves = 0
      this.matches = 0
      this.hud = label(this, 25, 53, "配對 0 / 6　翻牌 0", 12, palette.goldDark, 0)
      this.replayButton = rounded(this, 423, 53, 94, 30, 0xfff2c5, 0xe9c450)
      label(this, 423, 53, "再玩一次", 11, palette.goldDark)
      this.replayButton.on("pointerdown", () => this.scene.restart())
      this.feedback = label(this, 240, 279, "翻開兩張卡，配對寶可夢與屬性", 10, palette.muted)
      this.deck = Phaser.Utils.Array.Shuffle(this.pairs.flatMap((pair) => [
        { pairId: pair.id, role: "pokemon", content: pair.pokemon, pair },
        { pairId: pair.id, role: "type", content: pair.type, pair }
      ]))
      this.openCards = []
      this.locked = false
      this.cards = []
      this.deck.forEach((entry, index) => {
        const col = index % 4
        const row = Math.floor(index / 4)
        const x = 67 + col * 115
        const y = 117 + row * 55
        const card = rounded(this, x, y, 100, 47, palette.white, palette.line)
        const face = label(this, x, y, "✦", 18, palette.goldDark)
        card.on("pointerdown", () => modes.memory.flipCard.call(this, index))
        this.cards.push({ card, face, entry, open: false, matched: false })
      })
    },
    flipCard(index) {
      const card = this.cards[index]
      if (this.state !== "memory" || this.locked || card.open || card.matched) return
      card.open = true
      card.face.setText(card.entry.content)
      card.face.setFontSize(card.entry.role === "pokemon" ? 16 : 18)
      card.card.setFillStyle(card.entry.role === "pokemon" ? 0xfff2c5 : 0xe8f0df)
      this.openCards.push(card)
      if (this.openCards.length < 2) return
      this.moves += 1
      this.hud.setText("配對 " + this.matches + " / 6　翻牌 " + this.moves)
      const [first, second] = this.openCards
      if (first.entry.pairId === second.entry.pairId && first.entry.role !== second.entry.role) {
        first.matched = true
        second.matched = true
        this.matches += 1
        this.hud.setText("配對 " + this.matches + " / 6　翻牌 " + this.moves)
        this.feedback.setText("配對成功｜" + first.entry.pair.fact)
        this.feedback.setColor("#607a63")
        this.openCards = []
        if (this.matches === this.pairs.length) {
          this.time.delayedCall(2400, () => modes.memory.startQuiz.call(this))
        }
        return
      }
      this.feedback.setText("這組不相符，記住屬性線索再試一次")
      this.feedback.setColor("#d8846d")
      this.locked = true
      this.time.delayedCall(650, () => {
        this.openCards.forEach((item) => {
          item.open = false
          item.face.setText("✦")
          item.face.setFontSize(18)
          item.card.setFillStyle(palette.white)
        })
        this.openCards = []
        this.locked = false
        this.feedback.setText("翻開兩張卡，配對寶可夢與屬性")
        this.feedback.setColor("#7f8b7c")
      })
    },
    startQuiz() {
      this.state = "quiz"
      this.cards.forEach((item) => {
        item.card.destroy()
        item.face.destroy()
      })
      this.quizQuestions = [
        { question: "哪一種招式對皮卡丘效果絕佳？", options: ["地面系招式", "水系招式"], answer: 0, fact: "地面系招式對電系效果絕佳" },
        { question: "火系招式對哪種屬性效果絕佳？", options: ["草系", "水系"], answer: 0, fact: "火系招式對草系效果絕佳" },
        { question: "幽靈系招式對哪種屬性無效？", options: ["一般系", "火系"], answer: 0, fact: "幽靈系招式對一般系無效" }
      ]
      this.quizIndex = 0
      this.quizCorrect = 0
      this.feedback.setText("配對完成，接著用屬性知識解題")
      this.feedback.setColor("#607a63")
      this.drawQuestion()
    },
    drawQuestion() {
      if (this.questionPanel) this.questionPanel.destroy()
      if (this.questionText) this.questionText.destroy()
      if (this.optionObjects) this.optionObjects.forEach((item) => {
        item.button.destroy()
        item.text.destroy()
      })
      const item = this.quizQuestions[this.quizIndex]
      this.hud.setText("知識挑戰 " + (this.quizIndex + 1) + " / " + this.quizQuestions.length)
      this.questionPanel = this.add.rectangle(240, 137, 432, 72, palette.white).setStrokeStyle(1, palette.line)
      this.questionText = label(this, 240, 137, item.question, 20, palette.ink)
      this.optionObjects = []
      item.options.forEach((option, index) => {
        const x = index === 0 ? 135 : 345
        const button = rounded(this, x, 224, 190, 48, palette.white, palette.line)
        const text = label(this, x, 224, option, 18, palette.greenDark)
        button.on("pointerdown", () => modes.memory.answerQuestion.call(this, index))
        this.optionObjects.push({ button, text })
      })
      this.answerLocked = false
    },
    answerQuestion(index) {
      if (this.answerLocked || this.state !== "quiz") return
      this.answerLocked = true
      const item = this.quizQuestions[this.quizIndex]
      const correct = index === item.answer
      if (correct) this.quizCorrect += 1
      this.optionObjects.forEach((option, optionIndex) => {
        option.button.disableInteractive()
        if (optionIndex === item.answer) option.button.setFillStyle(0xe8f0df)
        else if (optionIndex === index) option.button.setFillStyle(0xf8e6df)
      })
      this.feedback.setText((correct ? "答對了｜" : "再記住一次｜") + item.fact)
      this.feedback.setColor(correct ? "#607a63" : "#b56c58")
      this.hud.setText("答對 " + this.quizCorrect + " / " + this.quizQuestions.length)
      this.time.delayedCall(1250, () => {
        this.quizIndex += 1
        if (this.quizIndex < this.quizQuestions.length) modes.memory.drawQuestion.call(this)
        else modes.memory.showSummary.call(this)
      })
    },
    showSummary() {
      this.state = "complete"
      if (this.questionPanel) this.questionPanel.destroy()
      if (this.questionText) this.questionText.destroy()
      if (this.optionObjects) this.optionObjects.forEach((item) => {
        item.button.destroy()
        item.text.destroy()
      })
      this.hud.setText("學習任務完成")
      this.feedback.setText("")
      label(this, 240, 122, "挑戰完成！", 26, palette.goldDark)
      label(this, 240, 162, "答對 " + this.quizCorrect + " / 3 題　屬性相剋記得更牢了", 16, palette.greenDark)
      const restart = rounded(this, 240, 225, 156, 48, 0xfff2c5, 0xe9c450)
      label(this, 240, 225, "再玩一次", 14, palette.goldDark)
      restart.on("pointerdown", () => this.scene.restart())
    }
  },
  speed: {
    create() {
      background(this, "快速搜尋", "找出上方相同圖案")
      this.score = 0
      this.seconds = 20
      this.target = "🍋"
      this.hud = label(this, 25, 53, "得分 0", 12, palette.goldDark, 0)
      this.timer = label(this, 455, 53, "20 秒", 12, palette.coral, 1)
      this.targetLabel = label(this, 240, 79, "目標　" + this.target, 17, palette.ink)
      modes.speed.drawChoices.call(this)
      this.time.addEvent({ delay: 1000, loop: true, callback: () => {
        this.seconds -= 1
        if (this.seconds <= 0) this.seconds = 20
        this.timer.setText(this.seconds + " 秒")
      } })
    },
    drawChoices() {
      if (this.choiceGroup) this.choiceGroup.destroy(true)
      this.choiceGroup = this.add.container(0, 0)
      const symbols = Phaser.Utils.Array.Shuffle(["🍋", "🌼", "⭐", "🍀", "☁️", "🍎", "🍋", "🌼", "⭐"])
      symbols.forEach((symbol, index) => {
        const x = 98 + (index % 3) * 142
        const y = 139 + Math.floor(index / 3) * 47
        const tile = rounded(this, x, y, 112, 35, palette.white)
        const face = label(this, x, y, symbol, 19, palette.ink)
        this.choiceGroup.add([tile, face])
        tile.on("pointerdown", () => {
          if (symbol === this.target) {
            this.score += 1
            this.hud.setText("得分 " + this.score)
            this.target = Phaser.Utils.Array.GetRandom(["🍋", "🌼", "⭐", "🍀", "☁️", "🍎"])
            this.targetLabel.setText("目標　" + this.target)
            modes.speed.drawChoices.call(this)
          }
        })
      })
    }
  },
  flood: {
    create() {
      background(this, "顏色策略", "用有限步數擴張區域")
      this.moves = 0
      this.limit = 14
      this.board = Array.from({ length: 40 }, () => Phaser.Math.Between(0, colors.length - 1))
      this.hud = label(this, 26, 52, "步數 0／14", 12, palette.goldDark, 0)
      modes.flood.drawBoard.call(this)
      colors.forEach((color, index) => {
        const x = 136 + index * 52
        const choice = this.add.circle(x, 266, 16, color).setStrokeStyle(2, palette.white).setInteractive({ useHandCursor: true })
        choice.on("pointerdown", () => modes.flood.chooseColor.call(this, index))
        label(this, x, 289, colorNames[index], 8, palette.muted)
      })
    },
    drawBoard() {
      if (this.boardGroup) this.boardGroup.destroy(true)
      this.boardGroup = this.add.container(0, 0)
      this.board.forEach((color, index) => {
        const col = index % 8
        const row = Math.floor(index / 8)
        const tile = this.add.rectangle(152 + col * 25, 102 + row * 25, 22, 22, colors[color])
        this.boardGroup.add(tile)
      })
    },
    chooseColor(nextColor) {
      const oldColor = this.board[0]
      if (nextColor === oldColor || this.moves >= this.limit) return
      const queue = [0]
      const visited = new Set(queue)
      while (queue.length) {
        const index = queue.shift()
        const row = Math.floor(index / 8)
        const col = index % 8
        const neighbors = [index - 1, index + 1, index - 8, index + 8]
        neighbors.forEach((neighbor) => {
          const nRow = Math.floor(neighbor / 8)
          const nCol = neighbor % 8
          if (neighbor >= 0 && neighbor < 40 && Math.abs(nRow - row) + Math.abs(nCol - col) === 1 && !visited.has(neighbor) && this.board[neighbor] === oldColor) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        })
      }
      visited.forEach((index) => this.board[index] = nextColor)
      this.moves += 1
      this.hud.setText("步數 " + this.moves + "／" + this.limit)
      modes.flood.drawBoard.call(this)
    }
  },
  mines: {
    create() {
      background(this, "數字線索", "左鍵翻開　右鍵標記")
      this.flags = 0
      this.opened = 0
      this.hud = label(this, 27, 52, "標記 0", 12, palette.goldDark, 0)
      this.input.mouse.disableContextMenu()
      this.mines = new Set(Phaser.Utils.Array.Shuffle(Array.from({ length: 36 }, (_, i) => i)).slice(0, 5))
      this.tiles = []
      for (let index = 0; index < 36; index += 1) {
        const col = index % 6
        const row = Math.floor(index / 6)
        const x = 153 + col * 35
        const y = 79 + row * 35
        const tile = rounded(this, x, y, 30, 30, 0xe9e0cb, 0xd9ceb3, 5)
        const face = label(this, x, y, "", 13, palette.ink)
        tile.on("pointerdown", (pointer) => {
          if (pointer.rightButtonDown()) {
            if (face.text === "⚑") {
              face.setText("")
              this.flags -= 1
            } else if (!face.text) {
              face.setText("⚑")
              face.setColor("#c89c2f")
              this.flags += 1
            }
            this.hud.setText("標記 " + this.flags)
            return
          }
          if (face.text) return
          if (this.mines.has(index)) {
            face.setText("✹")
            face.setColor("#d8846d")
            this.hud.setText("找到地雷　繼續找線索")
            return
          }
          const count = modes.mines.neighborCount.call(this, index)
          face.setText(count ? String(count) : "·")
          face.setColor(count ? "#607a63" : "#b7b7a4")
          tile.setFillStyle(palette.white)
          this.opened += 1
        })
        this.tiles.push({ tile, face })
      }
    },
    neighborCount(index) {
      const row = Math.floor(index / 6)
      const col = index % 6
      let total = 0
      for (let y = -1; y <= 1; y += 1) {
        for (let x = -1; x <= 1; x += 1) {
          if (x === 0 && y === 0) continue
          const nx = col + x
          const ny = row + y
          if (nx >= 0 && nx < 6 && ny >= 0 && ny < 6 && this.mines.has(ny * 6 + nx)) total += 1
        }
      }
      return total
    }
  },
  sliding: {
    create() {
      background(this, "滑塊拼圖", "點擊空格旁的數字")
      this.moves = 0
      this.hud = label(this, 27, 52, "步數 0", 12, palette.goldDark, 0)
      this.board = [1, 2, 3, 4, 5, 6, 7, 8, 0]
      for (let i = 0; i < 48; i += 1) {
        const empty = this.board.indexOf(0)
        const neighbors = modes.sliding.neighbors.call(this, empty)
        const pick = Phaser.Utils.Array.GetRandom(neighbors)
        modes.sliding.swap.call(this, empty, pick)
      }
      modes.sliding.drawBoard.call(this)
    },
    neighbors(index) {
      const row = Math.floor(index / 3)
      const col = index % 3
      return [index - 3, index + 3, index - 1, index + 1].filter((next) => next >= 0 && next < 9 && Math.abs(Math.floor(next / 3) - row) + Math.abs(next % 3 - col) === 1)
    },
    swap(first, second) {
      const value = this.board[first]
      this.board[first] = this.board[second]
      this.board[second] = value
    },
    drawBoard() {
      if (this.boardGroup) this.boardGroup.destroy(true)
      this.boardGroup = this.add.container(0, 0)
      this.board.forEach((value, index) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        const x = 184 + col * 57
        const y = 113 + row * 54
        if (value === 0) {
          const empty = this.add.rectangle(x, y, 50, 46, 0xeee7d5)
          empty.setStrokeStyle(1, 0xe0d7c0)
          this.boardGroup.add(empty)
          return
        }
        const tile = rounded(this, x, y, 50, 46, value % 2 ? 0xfff2c5 : 0xe5eddf, palette.line, 8)
        const number = label(this, x, y, String(value), 20, palette.ink)
        this.boardGroup.add([tile, number])
        tile.on("pointerdown", () => {
          const empty = this.board.indexOf(0)
          if (!modes.sliding.neighbors.call(this, empty).includes(index)) return
          modes.sliding.swap.call(this, empty, index)
          this.moves += 1
          this.hud.setText("步數 " + this.moves)
          modes.sliding.drawBoard.call(this)
        })
      })
    }
  }
}

function launchMiniGame(stage) {
  const mode = stage.dataset.mode
  const demo = modes[mode]
  if (!demo || !window.Phaser) {
    stage.textContent = "遊戲載入中，請稍後再試"
    return
  }
  const scene = {
    key: mode,
    create() {
      try {
        demo.create.call(this)
      } catch (error) {
        console.error("Phaser example error", mode, error)
        stage.textContent = "範例暫時無法啟動，請重新整理頁面"
      }
    },
    update(time, delta) { if (demo.update) demo.update.call(this, time, delta) }
  }
  try {
    new Phaser.Game({
      type: Phaser.CANVAS,
      width: 480,
      height: 300,
      parent: stage,
      backgroundColor: "#faf5e7",
      antialias: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [scene]
    })
  } catch (error) {
    stage.textContent = "遊戲載入失敗，請重新整理頁面"
  }
}

function connectDemos() {
  const demos = document.querySelectorAll(".gameStage[data-mode]")
  demos.forEach((stage) => {
    const source = stage.dataset.example
    const address = new URL("https://labs.phaser.io/phaser4-view.html")
    address.searchParams.set("src", source)
    address.searchParams.set("v", "4.0.0")
    if (stage.dataset.module === "true") address.searchParams.set("module", "true")
    const link = stage.closest(".gameWindow").querySelector(".openDemo")
    link.href = address.href
  })
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.started === "true") return
        entry.target.dataset.started = "true"
        launchMiniGame(entry.target)
        observer.unobserve(entry.target)
      })
    }, { rootMargin: "220px 0px" })
    demos.forEach((stage) => observer.observe(stage))
  } else {
    demos.forEach(launchMiniGame)
  }
}

if (window.Phaser) connectDemos()
else window.addEventListener("load", connectDemos, { once: true })
