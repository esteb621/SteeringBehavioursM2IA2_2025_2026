class Spear extends Vehicle {
  constructor(x, y, targetVehicle) {
    super(x, y);
    this.r = 30;
    this.maxSpeed = 8;
    this.targetVehicle = targetVehicle;
    
    // On prédit la position du cœur (facteur 10 pour correspondre à Vehicle.js)
    let prediction = targetVehicle.vel.copy().mult(10);
    let predictedPos = p5.Vector.add(targetVehicle.pos, prediction);

    // Vérification si la prédiction sort du cadre de combat (bX, bY, bW, bH sont globaux)
    let isInside = (predictedPos.x >= bX && predictedPos.x <= bX + bW &&
                    predictedPos.y >= bY && predictedPos.y <= bY + bH);

    if (isInside) {
      // On vise la prédiction
      this.vel = this.seek(predictedPos);
      this.predictedPos = predictedPos;
    } else {
      // La prédiction sort du cadre, on vise la position actuelle pour ne pas tirer dans le vide
      this.vel = this.seek(targetVehicle.pos);
      this.predictedPos = targetVehicle.pos.copy();
    }
    this.launchTime = millis();

    // Les lances ne tournent pas après avoir été lancées
    this.maxForce = 0;
  }

  update() {
    // Les spears avancent simplement en ligne droite
    this.vel.setMag(this.maxSpeed);
    this.pos.add(this.vel);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // On centre l'image : largeur 100 -> -50, hauteur 50 -> -25
    image(spearImg, -50, -25, 100, 50);
    noTint();

    if (Vehicle.debug) {
      // dessin sous la forme d'une flèche du vecteur vitesse
      noFill();
      stroke(255, 100);
      circle(0, 0, this.r * 2);
    }
    pop();

    if (Vehicle.debug) {
      // Cercle rouge à la position cible prédite pendant 1s
      if (millis() - this.launchTime < 1000) {
        push();
        noFill();
        stroke("red");
        strokeWeight(2);
        circle(this.predictedPos.x, this.predictedPos.y, 16);
        pop();
      }
    }
    this.drawVelocityVector();
  }
}