let screenWIDTH = window.innerWidth;
let screenHEIGHT = window.innerHeight;
window.addEventListener('resize', () => {
    screenWIDTH = window.innerWidth;
    screenHEIGHT = window.innerHeight;
});

const particleSize = 1;
const particleNum = 1000;
let particles = [];

function Particle(x, y, color, no) {
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.color = color;
  this.no = no;
  this.aggressiveness = 0.0;
  this.isDead = false;
}

function create(count, color) {
  var group = [];
    for(let i = 0; i < count; i++) {
      const x = Math.random() * (screenWIDTH - 10) + 10;
      const y = Math.random() * (screenHEIGHT - 10) + 10;
      const particle = new Particle(x, y, color, i);
      group.push(particle);
    }
    return group;
}
let red = create(particleNum, "red");
let yellow = create(particleNum, "yellow");
let green = create(particleNum, "green");
let blue = create(particleNum, "blue");

function getDistance(a, b) {
  let distance_x = a.x - b.x;
  let distance_y = a.y - b.y;
  return Math.sqrt(distance_x * distance_x + distance_y * distance_y);
}
const colors = ["red", "yellow", "green", "blue"];
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
function NearbyParticles(mainParticle, color, distanceLimit = 40) {
  let nearbyParticles = [];
  for (const particle of particles) {
    if (particle.color == color && getDistance(mainParticle, particle) < distanceLimit) {
      nearbyParticles.push(particle);
    }
  }
  return nearbyParticles.sort((a, b) => {
    getDistance(mainParticle, a) < getDistance(mainParticle, b)
  });
}
function movementRule(affected, influencer, g) {
  for (const a of affected) {
    let fx = 0, fy = 0;
    for (const b of influencer) {
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0 && d < 40) {
        const F = g / d;
        fx += F * dx;
        fy += F * dy;
      }
    }
    a.vx = (a.vx + fx) * 0.7;
    a.vy = (a.vy + fy) * 0.7;
    a.x += a.vx;
    a.y += a.vy;
    //kenarla çarpma
    if (a.x <= 0 || a.x >= screenWIDTH - particleSize) {
      a.vx = -a.vx * 0.5;
      a.x = Math.max(0, Math.min(a.x, screenWIDTH - particleSize));
    }
    if (a.y <= 0 || a.y >= screenHEIGHT - particleSize) {
      a.vy = -a.vy * 0.5;
      a.y = Math.max(0, Math.min(a.y, screenHEIGHT - particleSize));
    }
  }
}
function clamp(num, lower, upper) {
  return Math.min(Math.max(num, lower), upper);
}
function calculate_aggressiveness(opponent_aggressiveness, distance, num_nearby_friends, num_nearby_enemies, average_friend_aggressiveness) {
  const A1 = 1 / (1 + distance);
  const A2 = (num_nearby_friends > num_nearby_enemies) ? 0.3 : -0.1;
  const aggressiveness = clamp(A1 + A2 + 0.4 * average_friend_aggressiveness + 0.4 * opponent_aggressiveness, 0.0, 1.0);
  return aggressiveness;
}
function interactionRule() {
  let randColor = getRandomColor();
  for (const particle of particles) {
    while (particle.color != randColor) randColor = getRandomColor();
    const nearbyEnemies = NearbyParticles(particle, randColor);
    const friends = NearbyParticles(particle, particle.color);
    if (nearbyEnemies.length == 0 && friends.length > 0) { particle.aggressiveness = 0.0; continue; }
    const averageFriendAggressiveness = friends.reduce((sum, friendP) => {
        return sum + friendP.aggressiveness;
    }, 0) / friends.length;
    const distance = getDistance(particle, nearbyEnemies[0]);
    const aggressiveness = calculate_aggressiveness(
        nearbyEnemies[0].aggressiveness,
        distance,
        friends.length,
        nearbyEnemies.length,
        averageFriendAggressiveness
    );
    particle.aggressiveness = aggressiveness;
  }
  for (const particle of particles) {
    while (particle.color != randColor) randColor = getRandomColor();
    const nearbyEnemies = NearbyParticles(particle, randColor);
    if (nearbyEnemies.length != 0 && particle.aggressiveness>nearbyEnemies[0].aggressiveness) {
      nearbyEnemies[0].isDead = true;
      console.log(`Dead\nColor: ${nearbyEnemies[0].color}\nNo: ${nearbyEnemies[0].no}\nAggressiveness: ${nearbyEnemies[0].aggressiveness}\nDistance: ${getDistance(particle, nearbyEnemies[0])}\n`);
    }
    yellow = yellow.filter((p) => !p.isDead);
    red = red.filter((p) => !p.isDead);
    green = green.filter((p) => !p.isDead);
    blue = blue.filter((p) => !p.isDead);
  }
}
function randomG() {
  return Math.random() * 2 - 1;
}
function render(ctx) {
  ctx.clearRect(0, 0, screenWIDTH, screenHEIGHT);
  for (const particle of particles) {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particleSize, particleSize);
  }
}

const fps_meter = document.getElementById('fps_meter');
function fpsMeter() {
  let prevTime = Date.now(), frames = 0;
  requestAnimationFrame(function loop() {
    const time = Date.now();
    frames++;
    if (time > prevTime + 1000) {
      let fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
      prevTime = time;
      frames = 0;
      //console.info('FPS: ', fps);
      fps_meter.innerText = fps;
    }
    requestAnimationFrame(loop);
  });
} fpsMeter();

g2g=randomG();
g2r=randomG();
g2y=randomG();
g2b=randomG();
r2r=randomG();
r2g=randomG();
r2y=randomG();
r2b=randomG();
y2y=randomG();
y2g=randomG();
y2r=randomG();
y2b=randomG();
b2b=randomG();
b2y=randomG();
b2g=randomG();
b2r=randomG();

function simulationLoop(ctx) {
  particles = [...yellow, ...red, ...green, ...blue];
  console.log("Remaining particles: "+particles.length);
  movementRule(green, green, g2g);
  movementRule(green, red, g2r);
  movementRule(green, yellow, g2y);
  movementRule(green, blue, g2b);

  movementRule(red, red, r2r);
  movementRule(red, green, r2g);
  movementRule(red, yellow, r2y);
  movementRule(red, blue, r2b);

  movementRule(yellow, yellow, y2y);
  movementRule(yellow, green, y2g);
  movementRule(yellow, red, y2r);
  movementRule(yellow, blue, y2b);

  movementRule(blue, blue, b2b);
  movementRule(blue, yellow, b2y);
  movementRule(blue, green, b2g);
  movementRule(blue, red, b2r);
  interactionRule();

  render(ctx);
  requestAnimationFrame(() => simulationLoop(ctx));
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'simulationCanvas';
  canvas.width = screenWIDTH;
  canvas.height = screenHEIGHT;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  simulationLoop(ctx);
});