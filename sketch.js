//variable that's going to cointain the data on the csv file
let data;
//variable for the outer margin
let outerMargin = 50;
//variables that are going to contain concrete information of the dataset
let minLat, maxLat, minLon, maxLon, minElev, maxElev;
//array with volcanos information
let volcanos = [];

function preload() {
  //loading the data from the csv file
  data = loadTable("assets/data.csv", "csv", "header");
  image = loadImage("assets/texture.jpg")
}

function setup() {
  //creating the canvas
  createCanvas(windowWidth, windowHeight);
  //checking if the data is loaded correctly
  console.log("data", data);
  
  //saving the latitude information in the variable latitudes
  let latitudes = data.getColumn("Latitude");
  //saving the longitude information in the variable longitudes
  let longitudes = data.getColumn("Longitude");
  //saving the elevation information in the variable elevations
  let elevations = data.getColumn("Elevation (m)");

  //minimum and maximum of latitude 
  minLat = min(latitudes);
  maxLat = max(latitudes);
  //minimum and maximum of longitude
  minLon = min(longitudes);
  maxLon = max(longitudes);
  //minimum and maximum of elevation
  minElev = min(elevations);
  maxElev = max(elevations);

  //calling function volcanosData to prepare the information
  volcanosData();
}

function draw() {
  //drawing the background
  background(image);
  noStroke();

  //drawing the header
  push ();
    fill(255);
    textSize(28);
    textAlign(CENTER);
    text("VOLCANO OVERVIEW", windowWidth/2, 50);
    textSize(12);
    text("Assignment 4 - Aroa López Rabasseda", windowWidth/2, 70);
  pop ();

  //iniciating the variable hovered by giving it a null value
  let hovered = null;

  // Determine hovered volcano first
  for (let v of volcanos) {
    let d = dist(mouseX, mouseY, v.x, v.y);
    if (d < v.radius) hovered = v;
  }

  //drawing the non hovered volcanos
  for (let v of volcanos) {
    let d = dist(mouseX, mouseY, v.x, v.y);
    if (d < v.radius) hovered = v;
    fill(red(v.color), green(v.color), blue(v.color), 160);
    noStroke();
    ellipse(v.x, v.y, v.radius * 2);
  }

  //drawing what's going to happen wile hovering
  if (hovered) {
    //highlighting the hovered ellipse
    fill(hovered.color);
    noStroke();
    ellipse(hovered.x, hovered.y, hovered.radius * 2);
    stroke(255);
    strokeWeight(2);
    noFill();
    ellipse(hovered.x, hovered.y, hovered.radius * 2 + 4);
    noStroke();
    drawTooltip(hovered);

    //calling the drawToolTip dunction
    drawTooltip(hovered);
  }

  //calling the drawLegend function
  drawLegend();
}


//setting up the volcanos data into an array
function volcanosData () {
  volcanos = [];
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let row = data.getRow(rowNumber);
    let latitude = parseFloat(row.get("Latitude"));
    let longitude = parseFloat(row.get("Longitude"));
    let elevation = parseFloat(row.get("Elevation (m)"));
    let type = row.get("TypeCategory");
    let name = row.get("Volcano Name");
    let country = row.get("Country");
    let lastEruption = row.get("Last Known Eruption");

    if (isNaN(latitude) || isNaN(longitude) || isNaN(elevation)) continue;

    let x = map(longitude, minLon, maxLon, outerMargin, width - outerMargin);
    let y = map(latitude, minLat, maxLat, height - outerMargin, outerMargin);
    let radius = map(elevation, minElev, maxElev, 3, 15);
    let c = colorByType(type);

    volcanos.push({x, y, radius, color: c, name, type, country, elevation, lastEruption, longitude, latitude});
  }
}

//drawing a box with information that appears while hovering (toolTip)
function drawTooltip(v) {
  push();
    textSize(12);
    textAlign(LEFT, TOP);
    fill(255);

    let infoLines = [`Name: ${v.name}`,`Country: ${v.country}`,`Elevation: ${v.elevation}m`,];
  
    //calculating maximum width of the text
    let boxW = 0;
    for (let line of infoLines) {
      boxW = max(boxW, textWidth(line));
    }
    boxW += 20; //interior margin
    let boxH = infoLines.length * 18 + 12;

    //position of the box (tooltip)
    let x = constrain(mouseX + 15, 0, width - boxW);
    let y = constrain(mouseY + 15, 0, height - boxH);

    //background of tooltip
    fill(3, 22, 29, 215);
    noStroke();
    rect(x, y, boxW, boxH, 8);

    //text
    fill(255);
    let ty = y + 8;
    for (let line of infoLines) {
      text(line, x + 10, ty);
      ty += 18;
    }
  pop();
}

//assigning colors to each volcano type
function colorByType(type) {
  type = type.toLowerCase();

  if (type.includes("strato")) return color(255, 120, 100);
  if (type.includes("submarine")) return color(100, 150, 255);
  if (type.includes("cone")) return color(255, 200, 80);
  if (type.includes("crater")) return color(180, 255, 100);
  if (type.includes("shield")) return color(255, 100, 180);
  if (type.includes("maar")) return color(100, 255, 220);
  if (type.includes("caldera")) return color(200, 120, 255);
  if (type.includes("subglacial")) return color(200, 240, 255);
  if (type.includes("other") || type.includes("unknown")) return color(180);

  return color(220); //color by default
}

//drawing the bottom legend to uncode the colors
function drawLegend() {
  push();
    textSize(12);
    let types = ["Stratovolcano", "Submarine volcano", "Cone", "Crater System",
    "Shield Volcano", "Maars / Tuff ring", "Subglacial", "Caldera", "Other / Unknown"];

    let circleSize = 10;
    let spacing = 25; //space fixed between elements
    let y = height - 25;

    //calculating total width
    let totalWidth = 0;
    for (let i = 0; i < types.length; i++) {
      totalWidth += circleSize + 5 + textWidth(types[i]);
      if (i < types.length - 1) totalWidth += spacing;
    }

    //starting in the middle
    let startX = (width - totalWidth) / 2;

    //drawing each text + ellipse
    textAlign(LEFT, CENTER);
    let x = startX;
    for (let i = 0; i < types.length; i++) {
      let label = types[i];
      fill(colorByType(label));
      ellipse(x + circleSize / 2, y, circleSize);
      x += circleSize + 5;
      fill(255);
      text(label, x, y);
      x += textWidth(label) + spacing;
    }
  pop();
}

function mousePressed() {
  for (let v of volcanos) {
    let d = dist(mouseX, mouseY, v.x, v.y);
    if (d < v.radius) {
      let url = `detail.html?name=${encodeURIComponent(v.name)}&x=${v.x}&y=${v.y}&r=${v.radius}&c=${red(v.color)},${green(v.color)},${blue(v.color)}`;
      window.location.href = url;
      break;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  //recalculate positions when the window is modified
  volcanosData();
}