const PAN_SPEED = 6;
let panX, panY;
let panning;
let cameraPosition;

const MAX_ZOOM = 2;
const MIN_ZOOM = 0.2;
const ZOOM_FACTOR = 0.1;
let zoom = 1;
let targetZoom = zoom;

const timeFactor = 60;
const GravitationalConstant = 6.6743e-11

let stars = [];
let starSize;
let starMass;

let sizeSlider = document.getElementById("sizeRange");
let sizeLabel = document.getElementById("sizeLabel");

let massSlider = document.getElementById("massRange");
let massLabel = document.getElementById("massLabel");


// Constant time array element removal
Array.prototype.deref = function arrayDeref(i) {
  this[i] = this[this.length - 1];
  this[i].updateIndex(i);
  this.pop();
}


// Fast distance computation
// Skips determining the squareroot and accepts vector objects
function quickDist(pos1, pos2) {
  let x = sq(pos2.x - pos1.x);
  let y = sq(pos2.y - pos1.y);
  return abs(x + y);
}


// Returns the vector offset between two Stars scaled by the ratio of their sizes
function distRatio(s1, s2, V1, V2) {
  let sizeDiff = V1 - V2;
  let sizeSign = sizeDiff / abs(sizeDiff);
  let unitOffset = s2.position.copy().sub(s1.position).normalize();
  return(unitOffset.mult(sizeSign));
}


// Returns a unit vector pointing from v1 to v2
p5.Vector.prototype.getVectorTowards = function vectorTowards(v) {
  //return p5.Vector.fromAngle(this.angleBetween(v));
  return this.copy().sub(v).normalize();
}


// Computes the force between two stars
function computeGravitationalForce(s1, s2) { 
  return GravitationalConstant *
    (s1.mass * s2.mass) / quickDist(s1.position, s2.position);
}


// Converts radius to volume
function radiusToVolume(r) {
  return pow(r,3)*PI*(4/3);
}


// Converts volume to radius
function volumeToRadius(V) {
  return pow(3*(V/(4*PI)),(1/3));
}


// Called when the program starts
function setup() {
  sizeLabel.innerHTML = pixelsToMegameters(sizeSlider.value) + " Mm";
  starSize = sizeSlider.value;
  
  massLabel.innerHTML = massSlider.value + " t";
  starMass = tonsToGrams(massSlider.value);
  
  createCanvas(800, 400);
  fill(255);
  noStroke();
  cameraPosition = createVector(0, 0);
}


// Draws every frame
function draw() {
  background(0);
  zoom = lerp(zoom, targetZoom, 0.1);
  translate(cameraPosition.x + width/2, cameraPosition.y + height/2);
  scale(zoom);
  
  panX = 0;
  panY = 0;
  panning = createVector(0, 0);
  if (keyIsDown(83)) {// S
    panY -= 1;
  }
  if (keyIsDown(87)) { // W
    panY += 1;
  }
  if (keyIsDown(65)) { // A
    panX += 1;
  }
  if (keyIsDown(68)) { // D
    panX -= 1;
  }
  panning = createVector(panX, panY).normalize().mult(PAN_SPEED);
  cameraPosition.add(panning);
  translate(-width/2, -height/2);
  
  for (let s = 0; s < stars.length; s++) {
    let star = stars[s];
    if (star.dead) {
      continue;
    }
    
    star.inflictGravity();
    star.process();
  }
}


// User clicked mouse
function mouseClicked() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    // User clicked outside canvas
    return;
  }
  
  stars.push(new Star(
    stars.length,
    createVector(((mouseX - width/2) / zoom + width/2 - cameraPosition.x/zoom),
                 ((mouseY - height/2) / zoom + height/2 - cameraPosition.y/zoom)),
    starSize, starMass
  ));
  
  return false;
}


// User scrolled mouse wheel
function mouseWheel(event) {
  targetZoom -= (event.deltaY / 100) * ZOOM_FACTOR;
  targetZoom = constrain(targetZoom, MIN_ZOOM, MAX_ZOOM);
}


// Converts pixels to megameters (Mm)
function pixelsToMegameters(p) {
  return p / 10;
}


// Converts metric tons to grams
function tonsToGrams(t) {
  return t * 1000000;
}


// Update size label with size slider
sizeSlider.oninput = function() {
  starSize = this.value;
  sizeLabel.innerHTML = str(pixelsToMegameters(this.value)) + " Mm";
}


// Update mass label with mass slider
massSlider.oninput = function() {
  starMass = tonsToGrams(this.value);
  massLabel.innerHTML = this.value + " t";
}