/*
  Calcule la projection orthogonale du point a sur le vecteur b
  a et b sont des vecteurs calculés comme ceci :
  let v1 = p5.Vector.sub(a, pos); soit v1 = pos -> a
  let v2 = p5.Vector.sub(b, pos); soit v2 = pos -> b
  */
function findProjection(pos, a, b) {
  let v1 = p5.Vector.sub(a, pos);
  let v2 = p5.Vector.sub(b, pos);
  v2.normalize();
  let sp = v1.dot(v2);
  v2.mult(sp);
  v2.add(pos);
  return v2;
}
class Heart extends Vehicle {

  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.color = "white";
    this.dureeDeVie = 5;

    this.r_pourDessin = 8;
    this.r = this.r_pourDessin * 3;

    // Pour évitement d'obstacle
    this.largeurZoneEvitementDevantVaisseau = this.r / 2;

    // chemin derrière vaisseaux
    this.path = [];
    this.pathMaxLength = 30;

    // Perception radius for 360 avoidance
    this.perceptionRadius = 150;
  }

  // on fait une méthode applyBehaviors qui applique les comportements
  // évitement d'obstacles et limites
  applyBehaviors(obstacles, bx, by, bw, bh, d) {
    let avoidForce = this.avoid(obstacles);
    let boundaryForce = this.boundaries(bx, by, bw, bh, d);

    avoidForce.mult(5);
    boundaryForce.mult(10);

    this.applyForce(avoidForce);
    this.applyForce(boundaryForce);
  }

  avoid(obstacles) {
    let steer = createVector(0, 0);
    let count = 0;
    
    let currentMaxSpeed = this.maxSpeed;
    let currentMaxForce = this.maxForce;

    // Detection 360° : On boucle sur tous les obstacles
    obstacles.forEach(o => {
      let d = p5.Vector.dist(this.pos, o.pos);

      // Si la spear est très proche (zone de danger critique)
      if (d > 0 && d < this.perceptionRadius / 2) {
        currentMaxSpeed = this.maxSpeed * 2;
        currentMaxForce = this.maxForce * 2;
      }

      // Si l'obstacle est dans notre rayon de perception
      if (d > 0 && d < this.perceptionRadius) {
        // Force de fuite (flee)
        let diff = p5.Vector.sub(this.pos, o.pos);
        diff.normalize();
        diff.div(d); // Poids inversement proportionnel à la distance
        steer.add(diff);
        count++;
      }
    });

    if (count > 0) {
      steer.div(count);
      steer.setMag(currentMaxSpeed);
      steer.sub(this.vel);
      steer.limit(currentMaxForce);
    }

    return steer;
  }

  boundaries(bx, by, bw, bh, d) {
    let desired = null;

    if (this.pos.x < bx + d) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > bx + bw - d) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < by + d) {
      desired = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > by + bh - d) {
      desired = createVector(this.vel.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 5);
      return steer;
    }

    return createVector(0, 0);
  }

  update() {
    super.update();

    // mise à jour du path (la trainée derrière)
    this.path.push(this.pos.copy());
    if (this.path.length > this.pathMaxLength) {
      this.path.shift();
    }

    // durée de vie
    this.dureeDeVie -= 0.01;
  }

  show() {
    this.drawVehicle();
  }

  drawVehicle() {
    stroke(255);
    strokeWeight(2);
    fill(this.color);
    push();
    translate(this.pos.x, this.pos.y);

    if (this.hitTime !== undefined && millis() - this.hitTime < 500) {
      tint(100);
    }
    image(heartImg, -this.r / 2, -this.r / 2, this.r, this.r);
    noTint();

    // Cercles de détection (Perception et Danger) centré sur le coeur
    if (Vehicle.debug) {
      push();
      noFill();
      strokeWeight(2);
      stroke(0, 255, 0);
      circle(0, 0, this.perceptionRadius * 2);
      stroke(255, 0, 0);
      circle(0, 0, this.perceptionRadius);
      stroke(255);
      circle(0, 0, this.r * 2);
      pop();
    }
    pop();
  }
}