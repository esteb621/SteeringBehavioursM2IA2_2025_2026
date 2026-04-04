class Vehicle {
  static debug = false;
  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 4;
    // force maximale appliquée au véhicule
    this.maxForce = 0.1;
    // rayon du véhicule
    this.r = 16;
  }

  // seek est un comportement qui permet de faire se rapprocher le véhicule de 
  // la cible passée en paramètre (un vecteur p5.Vector, par exemple la position de 
  // la souris)
  seek(target) {

    // on calcule la direction vers la cible : la vitesse DESIREE
    // C'est l'ETAPE 1 (action : se diriger vers une cible)
    let desiredSpeed = p5.Vector.sub(target, this.pos);

    // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
    // on limite ce vecteur à la longueur maxSpeed
    desiredSpeed.setMag(this.maxSpeed);

    // Si on s'arrête ici, force = desiredSpeed

    // on calcule maintenant LA FORMULE MAGIQUE : force = desiredSpeed - currentSpeed
    let force = p5.Vector.sub(desiredSpeed, this.vel);

    // et on limite cette force à la longueur maxForce
    force.limit(this.maxForce);

    return force;
  }



  /* Poursuite d'un point devant la target !
   cette methode renvoie la force à appliquer au véhicule
*/
  pursue(target) {

    // On dessine le vecteur vitesse de la target
    if (Vehicle.debug) {
      this.drawVector(target.pos, target.vel.copy().mult(10));
    }
    // 1 - calcul de la position future de la cible
    // on fait une copie de la vitesse de la target
    // (pour ne pas modifier la vitesse de la target)
    let targetAhead = target.vel.copy();

    // On predit 20 frames
    targetAhead.mult(20);

    // 3 - on positionne  la target au bout de ce vecteur
    // (on ajoute ce vecteur à la position de la target)
    targetAhead.add(target.pos);
    // 6 - appel à seek avec ce point comme cible 
    let force = this.seek(targetAhead);

    // n'oubliez pas, on renvoie la force à appliquer au véhicule !
    return force;
  }

  drawVector(pos, v) {
    push();
    // Dessin du vecteur depuis pos comme origne
    strokeWeight(3);
    stroke("red");
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }


  // --------------------------------------------
  // LES DEUX METHODES SUIVANTES SONT INCHANGEES QUEL QUE SOIT LE COMPORTEMENT
  // --------------------------------------------
  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteur force au vecteur accélération
  applyForce(force) {
    this.acc.add(force);
  }

  cohesion(vehicles) {
    let perceptionRadius = 2 * this.perceptionRadius;
    let steering = createVector();
    let total = 0;

    for (let other of vehicles) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.pos);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);

      steering.sub(this.pos);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(vehicles) {
    let perceptionRadius = this.perceptionRadius;

    let steering = createVector();
    let total = 0;

    for (let other of vehicles) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d * d); // Weight by inverse distance squared
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // appelée 60 fois par seconde par la boucle d'animation de p5 (la fonction draw 
  // dans sketch.js)
  update() {
    // on ajoute l'accélération à la vitesse. 
    // L'accélération est un incrément de vitesse
    // (accélératiion = dérivée de la vitesse)
    this.vel.add(this.acc);
    // on contraint la vitesse à la valeur maxSpeed
    this.vel.limit(this.maxSpeed);
    // on ajoute la vitesse à la position. La vitesse est un incrément de position, 
    // (la vitesse est la dérivée de la position)
    this.pos.add(this.vel);

    // on remet l'accélération à zéro
    this.acc.set(0, 0);
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

  // que fait cette méthode ?
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}