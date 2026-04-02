let pursuer1;
let target;
let spears = [];
let lasers = [];
let heartImg;
let heartLives = 5;
let playerLives = 3;
let gameState = "PLAY"; // PLAY, WIN, LOSE, BREAKING
let gameTimer = 30;
let startTime;
let fragments = [];
let restartButton;

// Cooldown pour les lasers
let laserCooldown = 2000;
let lastLaserTime = 0;

// Cooldown pour les spears
let spearCooldown = 2000;
let lastSpearTime = 0;

let munition = 10;
let isRecharging = false;

// Définition des limites du carré (Boundary)
let bX, bY, bW, bH;
let boundaryMargin = 1;

let breakStartTime;
let lastResetTime = 0;

function preload() {
  heartImg = loadImage("assets/images/heart.png");
  soundFormats('mp3', 'ogg');
  battleMusic = loadSound("assets/music/battle.mp3");
  damageGivenSound = loadSound("assets/music/undertale-damage-taken.mp3");
  spear = loadSound("assets/music/spear.mp3")
  winSong = loadSound("assets/music/win.mp3")
  heartBreak = loadSound("assets/music/heartbreak.m4a")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetGame();

  restartButton = createButton('Recommencer');
  restartButton.position(width / 2 - 50, height / 2 + 50);
  restartButton.mousePressed(resetGame);
  restartButton.hide();
}

function resetGame() {
  gameTimer = 30;
  startTime = millis();
  gameState = "PLAY";
  spears = [];
  fragments = [];
  munition = 10;
  isRecharging = false;

  if (restartButton) restartButton.hide();

  bW = min(windowWidth, windowHeight) * 0.5;
  bH = bW;
  bX = (windowWidth - bW) / 2;
  bY = (windowHeight - bH) / 1.1;

  heart = new Heart(bX + bW / 2, bY + bH / 2);
  heartLives = 5;
  playerLives = 3;
  lasers = [];
  lastResetTime = millis();
  // Play music

  battleMusic.loop();

}

function draw() {
  background(0, 0, 0, 100);

  if (gameState === "PLAY") {
    playLoop();
  } else if (gameState === "BREAKING") {
    breakingLoop();
  } else if (gameState === "WIN") {
    winScreen();
  } else if (gameState === "LOSE") {
    loseScreen();
  }
}

function playLoop() {
  let elapsed = (millis() - startTime) / 1000;
  let remaining = max(0, gameTimer - elapsed);
  let targetPlayer = createVector(mouseX, mouseY);
  // Dessin du carré limite
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(bX, bY, bW, bH);

  // UI
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text("Objectif: " + heartLives + " hits", 20, 20);
  text("Temps: " + ceil(remaining) + "s", 20, 100);

  // Votre vie
  text("Votre vie: ", 20, 50);
  for (let i = 0; i < playerLives; i++) {
    image(heartImg, 170 + i * 40, 50, 30, 30);
  }

  // Munitions
  text("Munitions: ", 20, 140);
  if (munition > 0) {
    text(munition, 200, 140);
  } else {
    fill(255, 0, 0);
    text("Recharge...", 200, 140);
    if (!isRecharging) {
      isRecharging = true;
      setTimeout(recharge, spearCooldown);
    }
  }



  // Lancer des lasers (toutes les 5 secondes)
  if (millis() - lastLaserTime > laserCooldown) {
    lastLaserTime = millis();
    launchLaser();
  }

  // Supression du lasers au bout de 10secondes
  if (millis() - lastLaserTime > 2000) {
    console.log("Laser removed");
    lasers.splice(0, lasers.length);
  }
  for (let i = lasers.length - 1; i >= 0; i--) {
    let l = lasers[i];

    if (l.pos.dist(targetPlayer) < l.r + 10) {
      playerLives--;
      damageGivenSound.play();

      lasers.splice(i, 1); // On retire le laser qui a touché
      continue;
    }
    for (let j = spears.length - 1; j >= 0; j--) {
      let s = spears[j];
      if (l.pos.dist(s.pos) < l.r + s.r) {
        lasers.splice(i, 1);
        spears.splice(j, 1);
        i--;
        break;
      }
    }
    l.applyBehaviors(targetPlayer);
    l.update();
    l.show();
  }


  // Check Game State
  if (heartLives === 0) {
    gameState = "BREAKING";
    breakStartTime = millis();
    initHeartBreak(heart.pos.copy());
    heart = null; // Hide heart
    battleMusic.stop();
    heartBreak.play();
    return;
  }

  if (remaining <= 0 || playerLives <= 0) {
    gameState = "LOSE";
    restartButton.show();
    return;
  }

  // Spears logic
  for (let i = spears.length - 1; i >= 0; i--) {
    let s = spears[i];
    s.update();
    s.show();

    let d = p5.Vector.dist(s.pos, heart.pos);
    if (d < s.r + heart.r_pourDessin) {
      damageGivenSound.play();
      heartLives--;
      spears.splice(i, 1);
      break;
    }
  }
  // Heart logic
  heart.applyBehaviors(spears, bX, bY, bW, bH, boundaryMargin);
  heart.update();
  heart.show();

}
function initHeartBreak(pos) {
  heartBreak.play();
  // Create fragments
  for (let i = 0; i < 15; i++) {
    fragments.push(new Fragment(pos.x, pos.y));
  }
}

function launchLaser() {
  laser = new Vehicle(heart.pos.x, heart.pos.y);
  lasers.push(laser);
}

function breakingLoop() {
  for (let i = fragments.length - 1; i >= 0; i--) {
    fragments[i].update();
    fragments[i].show();
  }

  // Transition to Win Screen after 2 seconds
  if (millis() - breakStartTime > 2000) {
    gameState = "WIN";
    winSong.play();
    restartButton.show();
  }
}

function winScreen() {
  fill(0, 255, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("VOUS AVEZ GAGNÉ !", width / 2, height / 2);
}

function loseScreen() {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  battleMusic.stop();
  text("GAME OVER", width / 2, height / 2);
}

function mousePressed() {
  // On ignore le clic s'il vient de relancer le jeu (évite de tirer une spear en cliquant sur recommencer)
  if (millis() - lastResetTime < 200) return;
  let isOutside = mouseX < bX || mouseX > bX + bW || mouseY < bY || mouseY > bY + bH;
  if (gameState === "PLAY" && mouseButton === LEFT && munition > 0 && isOutside) {
    munition--;
    let closestV = null;
    let minD = Infinity;
    let d = dist(mouseX, mouseY, heart.pos.x, heart.pos.y);
    if (d < minD) {
      minD = d;
      closestV = heart;
    }

    if (closestV) {
      spears.push(new Spear(mouseX, mouseY, closestV.pos.x, closestV.pos.y));
    }
  }
}

function recharge() {
  munition = 10;
  isRecharging = false;
}

