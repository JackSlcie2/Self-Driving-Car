const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i !== 0) {
      //MAKE CARS MORE OR LESS SIMILAR TO EACH OTHER
      NeuralNetwork.mutate(cars[i].brain, 0.2);
    }
  }
}

const traffic = []; // Array to hold the traffic cars

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomPosition() {
  const laneIndex = Math.floor(getRandomNumber(0, 3));
  const laneCenter = road.getLaneCenter(laneIndex);
  const y = getRandomNumber(-5000, -100); // Adjust the range as per your requirements
  return { x: laneCenter, y };
}

function spawnCar() {
  const randomPosition = getRandomPosition();
  const car = new Car(randomPosition.x, randomPosition.y, 30, 50, "DUMMY", 2);
  traffic.push(car);
}

// Spawn initial cars
for (let i = 0; i < 10; i++) {
  spawnCar();
}

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain'");
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 29, 50, "AI"));
  }
  return cars;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red");
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  // Spawn new car with a certain probability
  if (Math.random() < 0.01) {
    spawnCar();
  }

  requestAnimationFrame(animate);
}
