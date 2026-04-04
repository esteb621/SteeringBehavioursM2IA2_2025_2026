class Laser extends Vehicle {
    constructor(x, y, targetX, targetY) {
        super(x, y);
        this.r = 10;
        this.maxSpeed = 8;

        // Direction vers la cible (véhicule)
        let target = createVector(targetX, targetY);
        let dir = p5.Vector.sub(target, this.pos);
        dir.setMag(this.maxSpeed);
        this.vel = dir;

        // Changed maxForce to > 0 so lasers can steer
        this.maxForce = 0.2;

        this.perceptionRadius = 50; // Increased a bit to make cohesion visible
        // pour le comportement align
        this.alignWeight = 1.5;
        // pour le comportement cohesion
        this.cohesionWeight = 1;
        // Pour la séparation
        this.separationWeight = 2;
        // Pour le confinement
        this.boundariesWeight = 10;
        // pour le avoid
        this.avoidWeight = 15;
    }



    applyBehaviors(target, lasers) {
        let seekForce = this.seek(target);

        let cohesionForce = createVector(0, 0);
        let separationForce = createVector(0, 0);
        if (lasers) {
            cohesionForce = this.cohesion(lasers);
            cohesionForce.mult(this.cohesionWeight);

            separationForce = this.separation(lasers);
            separationForce.mult(this.separationWeight);
        }

        this.applyForce(seekForce);
        this.applyForce(cohesionForce);
        this.applyForce(separationForce);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Dessin du laser (lignes jaunes en pixel art)
        stroke(255, 255, 0); // Yellow
        strokeWeight(4);
        strokeCap(SQUARE); // Pixel art style
        line(-15, 0, 15, 0); // Corps du laser


        // Debug circle
        if (Vehicle.debug) {
            noFill();
            stroke(255, 100);
            circle(0, 0, this.r * 2);

        }
        pop();
        this.drawVelocityVector();
    }
}