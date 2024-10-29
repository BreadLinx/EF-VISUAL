const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.style.backgroundColor = "#000";
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let charges = [];
let selectedCharge = null;
let offsetX = 0,
  offsetY = 0;
let mode = "electricField"; // Mode can be 'electricField' or 'electricPotential'

const egg = document.createElement("div");
egg.style.position = "fixed";
egg.style.bottom = "10px";
egg.style.right = "10px";
egg.style.color = "#fff";
egg.style.fontFamily = "Arial";
egg.style.fontSize = "12px";
egg.innerHTML = "Mr. Bilak is very cute";
document.body.appendChild(egg);

// Create a toggle button in the bottom left corner
const toggleButton = document.createElement("button");
toggleButton.style.position = "absolute";
toggleButton.style.bottom = "10px";
toggleButton.style.left = "10px";
toggleButton.style.padding = "10px";
toggleButton.style.backgroundColor = "#444";
toggleButton.style.color = "white";
toggleButton.style.border = "none";
toggleButton.style.cursor = "pointer";
toggleButton.innerText = "Switch to Potential Mode";
document.body.appendChild(toggleButton);

toggleButton.addEventListener("click", () => {
  mode = mode === "electricField" ? "electricPotential" : "electricField";
  toggleButton.innerText =
    mode === "electricField" ? "Switch to Potential Mode" : "Switch to Field Mode";
  draw();
});

// Create modal for adding charges
const modal = document.createElement("div");
modal.style.position = "fixed";
modal.style.top = "50%";
modal.style.left = "50%";
modal.style.transform = "translate(-50%, -50%)";
modal.style.padding = "40px 20px 20px 20px";
modal.style.backgroundColor = "#fff";
modal.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
modal.style.borderRadius = "10px";
modal.style.display = "none";
modal.style.transition = "opacity 0.3s ease";
modal.style.opacity = "0";
modal.style.zIndex = "5";
modal.style.width = "500px";

const modalInput = document.createElement("input");
modalInput.type = "number";
modalInput.placeholder = "Enter charge magnitude (C)";
modalInput.style.marginBottom = "20px";
modalInput.style.display = "block";
modalInput.style.width = "100%";
modalInput.style.padding = "10px";
modalInput.style.border = "1px solid #ccc";
modalInput.style.borderRadius = "5px";
modalInput.style.boxSizing = "border-box";

const modalButton = document.createElement("button");
modalButton.innerText = "Add Charge";
modalButton.style.padding = "10px";
modalButton.style.backgroundColor = "#444";
modalButton.style.color = "white";
modalButton.style.border = "none";
modalButton.style.cursor = "pointer";
modalButton.style.borderRadius = "10px";
modalButton.style.marginRight = "10px";
modalButton.style.width = "100%";

const closeIcon = document.createElement("span");
closeIcon.innerHTML = "&times;";
closeIcon.style.position = "absolute";
closeIcon.style.top = "10px";
closeIcon.style.right = "10px";
closeIcon.style.cursor = "pointer";
closeIcon.style.fontSize = "32px";
closeIcon.style.color = "#888";
closeIcon.style.height = "20px";
closeIcon.style.width = "20px";
closeIcon.style.display = "flex";
closeIcon.style.justifyContent = "center";
closeIcon.style.alignItems = "center";

modal.appendChild(modalInput);
modal.appendChild(modalButton);
modal.appendChild(closeIcon);
document.body.appendChild(modal);

let newChargePosition = { x: 0, y: 0 };

modalButton.addEventListener("click", () => {
  const magnitude = parseFloat(modalInput.value);
  if (!isNaN(magnitude) && magnitude !== 0) {
    addCharge(newChargePosition.x, newChargePosition.y, magnitude);
    closeModal();
  }
});

closeIcon.addEventListener("click", () => {
  closeModal();
});

function openModal() {
  modal.style.display = "block";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 0);
}

function closeModal() {
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.style.display = "none";
    modalInput.value = "";
  }, 300);
}

// Function to add charge
function addCharge(x, y, magnitude) {
  charges.push({ x, y, magnitude });
  draw();
}

// Function to remove charge
function removeCharge(index) {
  charges.splice(index, 1);
  draw();
}

// Function to calculate electric potential at a given point
function electricPotential(x, y) {
  let V = 0;
  for (let charge of charges) {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const r = Math.sqrt(dx * dx + dy * dy);

    if (r === 0) continue;

    const k = 9000; // Coulomb constant, not in standard units to keep magnitudes manageable
    V += (k * charge.magnitude) / r;
  }
  return V;
}

// Function to draw the charges and the field/potential lines
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw charges
  for (let charge of charges) {
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = charge.magnitude > 0 ? "red" : "blue";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`${charge.magnitude} C`, charge.x + 12, charge.y - 12);
  }
  // Draw field or potential lines
  if (mode === "electricField") {
    drawFieldLines();
  } else if (mode === "electricPotential") {
    for (let x = 0; x < canvas.width; x += 5) {
      for (let y = 0; y < canvas.height; y += 5) {
        const V = electricPotential(x, y);
        let intensity;
        let color;

        if (V > 0) {
          // Положительный потенциал - красный цвет
          intensity = Math.min(255, Math.max(0, 255 - V / 100));
          color = `rgb(255, ${intensity}, ${intensity})`;
        } else {
          // Отрицательный потенциал - синий цвет
          intensity = Math.min(255, Math.max(0, 255 - Math.abs(V) / 100));
          color = `rgb(${intensity}, ${intensity}, 255)`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 10, 10);
      }
    }
  }
}

// Function to draw electric field lines
function drawFieldLines() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  const numLines = 24;
  const stepSize = 5;

  charges.forEach(charge => {
    for (let i = 0; i < numLines; i++) {
      let angle = (i / numLines) * 2 * Math.PI;
      let x = charge.x + Math.cos(angle) * 10;
      let y = charge.y + Math.sin(angle) * 10;

      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let j = 0; j < 1000; j++) {
        const { Ex, Ey } = electricField(x, y);
        const length = Math.sqrt(Ex * Ex + Ey * Ey);
        if (length === 0) break;

        x += (Ex / length) * stepSize;
        y += (Ey / length) * stepSize;

        ctx.lineTo(x, y);

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
          break;
        }
      }
      ctx.stroke();
    }
  });

  // Draw lines for isolated negative charges
  charges.forEach(charge => {
    if (charge.magnitude < 0) {
      for (let i = 0; i < numLines; i++) {
        let angle = (i / numLines) * 2 * Math.PI;
        let x = charge.x + Math.cos(angle) * 10;
        let y = charge.y + Math.sin(angle) * 10;

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let j = 0; j < 1000; j++) {
          const { Ex, Ey } = electricField(x, y);
          const length = Math.sqrt(Ex * Ex + Ey * Ey);
          if (length === 0) break;

          x -= (Ex / length) * stepSize;
          y -= (Ey / length) * stepSize;

          ctx.lineTo(x, y);

          if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            break;
          }
        }
        ctx.stroke();
      }
    }
  });
}
// Function to draw potential lines
function drawLines() {
  charges.forEach(charge => {
    const { x: centerX, y: centerY } = charge;
    const numContours = 10; // Number of equipotential lines to draw
    const maxPotential = 100; // Arbitrary maximum potential level for visualization

    for (let i = 1; i <= numContours; i++) {
      const targetPotential = (i / numContours) * maxPotential;
      const points = [];

      // Finding points along the equipotential line
      for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
        let radius = 5; // Initial guess for radius
        let potential = 0;
        let delta = 0.5; // Step size to adjust the radius

        // Iteratively adjust radius until the potential at (x, y) is close to the target potential
        while (Math.abs(potential - targetPotential) > 0.1) {
          let x = centerX + Math.cos(angle) * radius;
          let y = centerY + Math.sin(angle) * radius;
          potential = electricPotential(x, y);
          radius += potential < targetPotential ? delta : -delta;
        }

        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }

      // Draw equipotential line
      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.stroke();
      }
    }
  });
}

// Function to calculate electric field at a given point
function electricField(x, y) {
  let Ex = 0,
    Ey = 0;

  for (let charge of charges) {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const rSquared = dx * dx + dy * dy;
    const r = Math.sqrt(rSquared);

    if (r === 0) continue;

    const k = 9000; // Coulomb constant, not in standard units to keep magnitudes manageable
    const E = (k * charge.magnitude) / rSquared;
    Ex += E * (dx / r);
    Ey += E * (dy / r);
  }
  return { Ex, Ey };
}

// Event listener to add or select charges by clicking
canvas.addEventListener("mousedown", e => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  // Check if clicking on an existing charge
  for (let i = 0; i < charges.length; i++) {
    const charge = charges[i];
    const dx = clickX - charge.x;
    const dy = clickY - charge.y;
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
      selectedCharge = charge;
      offsetX = dx;
      offsetY = dy;
      canvas.style.cursor = "pointer";
      return;
    }
  }

  // If no charge selected, show modal to add a new charge
  newChargePosition = { x: clickX, y: clickY };
  openModal();
});

// Event listener to move charges
canvas.addEventListener("mousemove", e => {
  let hoveringOverCharge = false;
  for (let i = 0; i < charges.length; i++) {
    const charge = charges[i];
    const dx = e.clientX - charge.x;
    const dy = e.clientY - charge.y;
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
      canvas.style.cursor = "pointer";
      hoveringOverCharge = true;
      break;
    }
  }
  if (!hoveringOverCharge) {
    canvas.style.cursor = "default";
  }

  if (selectedCharge) {
    selectedCharge.x = e.clientX - offsetX;
    selectedCharge.y = e.clientY - offsetY;
    draw();
  }
});

// Event listener to drop charges
canvas.addEventListener("mouseup", () => {
  selectedCharge = null;
  canvas.style.cursor = "default";
});

// Event listener to remove charges by double-clicking
canvas.addEventListener("dblclick", e => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  // Check if double-clicking on an existing charge
  for (let i = 0; i < charges.length; i++) {
    const charge = charges[i];
    const dx = clickX - charge.x;
    const dy = clickY - charge.y;
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
      removeCharge(i);
      return;
    }
  }
});
