// Star class


class Star {
  constructor(index, position, size, mass) {
    this.index = index;
    this.position = position;
    this.size = size;
    this.mass = mass;
    this.velocity = createVector(0,0);//p5.Vector.random2D().mult(random(3)*10000).div(this.mass);
    this.acceleration = createVector(0, 0);
    this.dead = false;
  }
  
  
  // Returns the density of this star
  getDensity() {
    return this.mass / radiusToVolume(this.size);
  }
  
  
  // Updates this Star's memory of its index
  updateIndex(i) {
    this.index = i;
  }
  
  
  // Returns true if this Star intersects the passed Star
  isIntersecting(star) {
    let distance = quickDist(this.position, star.position);
    let radialSum = sq(max(this.size, star.size));
    
    // Check if Cells intersect
    if (radialSum > distance) {
      return true;
    } else {
      return false;
    }
  }
  
  
  // Inflicts gravity on other bodies
  inflictGravity() {    
     for (let s = 0; s < stars.length; s++) {
      let star = stars[s];
      
      // Do not apply force to self
      if (star === this) {
        continue;
      }      
      
      let force = computeGravitationalForce(this, star);
      let direction = this.position.getVectorTowards(star.position);
      star.applyForce(direction.mult(force));
      
      // Stars collided
      if (this.isIntersecting(star)) {
        this.collide(star);
        return;
      }
    }   
  }
  
  // Renders the Star for a frame
  process() {
    // Consume acceleration
    this.velocity.add(this.acceleration.copy().mult(timeFactor));
    this.acceleration.setMag(0);
    
    // Apply velocity
    this.position.add(this.velocity.copy().mult(timeFactor));
    
    // Draw star
    circle(this.position.x, this.position.y, this.size*2);
  }
  
  
  // Applies a force to this Star
  applyForce(force) {
    this.timesForceApplied++;
    this.acceleration.add(force.div(this.mass));
  }
  
  
  // Collided with the passed star
  collide(star) {
    if (this.dead) {
      return;
    }
    
    this.acceleration = createVector(0,0);
    star.acceleration = createVector(0,0);
    
    let density = this.getDensity();
    let V1 = radiusToVolume(this.size);
    let V2 = radiusToVolume(star.size);
    this.position.add(distRatio(this, star, V1, V2));
    let combinedMass = this.mass + star.mass;
    
    this.velocity.mult(this.mass).add(star.velocity.mult(star.mass))
    this.velocity.div(combinedMass);
    this.mass = combinedMass;
    this.size = volumeToRadius(this.mass / density);
    star.destroy();
  }
  
  
  // Destroys self
  destroy() {
    this.dead = true;
    stars.deref(this.index);
  }
}