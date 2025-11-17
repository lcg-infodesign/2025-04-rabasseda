let data;
let image;
let outerMargin = 50;
let volcano;
let startPos = { x: 0, y: 0, r: 10 };
let animProgress = 0;
let titleReveal = 0;   //variable to control the timing to write the volcan name (title)
let panelDelay = 0.0;  //variable to control the delaying of the legend

function preload() {
  //loading the data from the csv file
  data = loadTable("assets/data.csv", "csv", "header");
  image = loadImage("assets/texture.jpg");
}

function setup() {
  //creating the canvas
  createCanvas(windowWidth, windowHeight);
  //checking if the data is loaded correctly
  console.log("data", data);
  
  //reading parameters from url (sketch)
  const params = new URLSearchParams(window.location.search);
  const volcanoName = params.get("volcano") || params.get("name");
  const volcanoId = params.get("id");

  //getting positions from url
  startPos.x = float(params.get("x") || width / 2);
  startPos.y = float(params.get("y") || height / 2);
  startPos.r = float(params.get("r") || 10);

  let colorString = params.get("c");
  if (colorString) {
    let rgb = colorString.split(",").map(Number);
    volcanoColor = color(rgb[0], rgb[1], rgb[2]);
  } else {
    volcanoColor = color(255, 120, 120); //predetermined color
  }

  //searching the volcano in the dataset
  for (let row of data.rows) {
    if (
      (volcanoName && row.get("Volcano Name") === volcanoName) ||
      (volcanoId && row.get("Volcano Number") === volcanoId)
    ) {
      volcano = row;
      break;
    }
  }

  if (!volcano) {
    console.error("Volcano not found!");
    noLoop();
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Volcano not found", width / 2, height / 2);
    return;
  }

  textFont("Helvetica");
}

function draw() {
  background(image);

  //the detail page works in 3 phases:
  //Phase1: volcano circle to the middle
  //Phase2: writing volcano name next to circle
  //Phase3: making the details of the volcano appear

  animProgress = min(animProgress + 0.02, 1);
  let p1 = easeInOutCubic(animProgress);

  //start writing volcano name when phase1 is finished
  if (animProgress >= 1) {
    titleReveal = min(titleReveal + 0.4, volcano.get("Volcano Name").length);
  }

  //when phase2 is finished start phase3
  if (titleReveal >= volcano.get("Volcano Name").length) {
    panelDelay = min(panelDelay + 0.02, 1);
  }

  drawDetail(volcano, p1);
}

function drawDetail(v, p1) {
  let name = v.get("Volcano Name");
  let titleLength = name.length;
  let r = startPos.r;

  //Phase1: volcano circle to the middle
  if (animProgress < 1) {
    let circleX = lerp(startPos.x, width / 2, p1);
    let circleY = lerp(startPos.y, height / 2, p1);

    noStroke();
    fill(volcanoColor);
    ellipse(circleX, circleY, r * 2);
    return;
  }

  //Phase2: writing volcano name next to circle
  let partialName = name.substring(0, floor(titleReveal));
  textSize(45);
  textAlign(LEFT, CENTER);

  let titleWidth = textWidth(partialName);
  let blockW = r * 2 + 20 + titleWidth;
  let blockX = width / 2 - blockW / 2;
  let blockY = height / 2;

  let circleX = blockX + r;
  let circleY = blockY;
  let titleX = blockX + r * 2 + 20;

  //drawing the cirle for phase2
  //if title (volcano name) is still being written draw phase2 and exit
  if (titleReveal < titleLength) {
    fill(volcanoColor);
    ellipse(circleX, circleY, r * 2);

    fill(255);
    text(partialName, titleX, circleY);
    return;
  }

  //Phase3: making the details of the volcano appear
  let panelYShift = easeInOutCubic(panelDelay);
  let verticalOffset = lerp(0, -height * 0.18, panelYShift);

  //drawing the cirle for phase3
  fill(volcanoColor);
  ellipse(circleX, circleY + verticalOffset, r * 2);

  //drawing the title fot phase3
  fill(255);
  text(partialName, titleX, circleY + verticalOffset);

  //details of the volcano (legend)
  let fields = [
    ["Volcano Number", v.get("Volcano Number")],
    ["Country", v.get("Country")],
    ["Location", v.get("Location")],
    ["Latitude", v.get("Latitude")],
    ["Longitude", v.get("Longitude")],
    ["Elevation (m)", v.get("Elevation (m)")],
    ["Type", v.get("Type")],
    ["Type Category", v.get("TypeCategory")],
    ["Status", v.get("Status")],
    ["Last Known Eruption", v.get("Last Known Eruption")]
  ];

  let alpha = 200 * panelDelay;

  // width of the panel
  let boxW = 380;
  let boxH = fields.length * 26 + 60;
  let boxX = width / 2 - boxW / 2;
  let boxY = height * 0.55 + verticalOffset;

  fill(15, 35, 45, alpha);
  rect(boxX, boxY, boxW, boxH, 12);

  textAlign(LEFT, TOP);
  textSize(15);
  let labelCol = color(180, 180, 180, alpha);
  let valueCol = color(255, alpha);

  //positions for text
  let labelX = boxX + 20;
  let valueX = boxX + 180;

  let ty = boxY + 25;
  for (let [label, value] of fields) {
    fill(labelCol);
    text(label + ":", labelX, ty);

    fill(valueCol);
    text(value || "—", valueX, ty);

    ty += 26;
  }

  //instructions to get out of volcano detail page
  fill(255, alpha);
  textAlign(CENTER);
  textSize(12);
  text("Click or press ESC to go back", width / 2, height - 25);
}

//easing function to make the animation seamless
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
}

//function to return to map (overview)
function mousePressed() {
  window.location.href = "index.html"; 
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    window.location.href = "index.html";
  }
}