class Fragment extends Vehicle {
  constructor(x, y, color = [255, 0, 0]) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 6));
    this.r = random(4, 10);
    this.life = 255;
    this.color = color;
    
    // Les fragments n'ont pas de vitesse max ou force max contraignantes
    this.maxSpeed = 20;
    this.maxForce = 1;
  }

  update() {
    // Gravité
    this.applyForce(createVector(0, 0.2));
    super.update();
    this.life -= 4;
  }

  show() {
    push();
    fill(this.color[0], this.color[1], this.color[2], this.life);
    noStroke();
    // Triangular fragment look
    beginShape();
    vertex(this.pos.x, this.pos.y - this.r);
    vertex(this.pos.x + this.r, this.pos.y + this.r);
    vertex(this.pos.x - this.r, this.pos.y + this.r);
    endShape(CLOSE);
    pop();
  }
}