class Spear extends Vehicle {
  constructor(x, y, targetVehicle) {
    super(x, y);
    this.r = 30;
    this.maxSpeed = 8;
    this.targetVehicle = targetVehicle;

    // On utilise la fonction pursue de Vehicle pour calculer la direction
    // Puisque la vitesse initiale est 0, pursue() renvoie directement le vecteur vers la position prédite
    this.vel = this.pursue(targetVehicle);

    // On stocke quand même la position prédite manuellement pour l'affichage du cercle rouge
    this.predictedPos = targetVehicle.vel.copy().mult(20).add(targetVehicle.pos);
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
      this.drawVelocityVector();

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
  }

  drawVelocityVector() {
    push();

    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke("red");
    line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    rotate(this.vel.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);

    pop();
  }
}