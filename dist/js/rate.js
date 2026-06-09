// Purchase/Refinance Toggle Logic
const purchaseBtn = document.getElementById("toggle-purchase");
const refinanceBtn = document.getElementById("toggle-refinance");

purchaseBtn.addEventListener("click", () => {
  purchaseBtn.className =
    "px-10 py-3 rounded-full font-bold text-sm transition-all bg-primary text-w-color";
  refinanceBtn.className =
    "px-10 py-3 rounded-full font-bold text-sm transition-all text-title hover:bg-w-color";
  updateRates("Purchase");
});

refinanceBtn.addEventListener("click", () => {
  refinanceBtn.className =
    "px-10 py-3 rounded-full font-bold text-sm transition-all bg-primary text-w-color";
  purchaseBtn.className =
    "px-10 py-3 rounded-full font-bold text-sm transition-all text-title hover:bg-w-color";
  updateRates("Refinance");
});

// Tab Data & Switching
const rateData = {
  Purchase: {
    "30 Year Fixed": [
      { interest: "5.999%", apr: "6.173%", points: "+1.617" },
      { interest: "6.124%", apr: "6.237%", points: "+0.977" },
      { interest: "6.125%", apr: "6.235%", points: "+0.945" },
    ],
    "15 Year Fixed": [
      { interest: "5.250%", apr: "5.587%", points: "+1.983" },
      { interest: "5.375%", apr: "5.657%", points: "+1.625" },
      { interest: "5.625%", apr: "5.812%", points: "+1.011" },
    ],
  },
  Refinance: {
    "30 Year Fixed": [
      { interest: "5.99%", apr: "6.188%", points: "+1.90" },
      { interest: "6.125%", apr: "6.268%", points: "+1.315" },
      { interest: "6.25%", apr: "6.332%", points: "+0.672" },
    ],
    "15 Year Fixed": [
      { interest: "5.25%", apr: "5.579%", points: "+1.889" },
      { interest: "5.375%", apr: "5.616%", points: "+1.328" },
      { interest: "5.50%", apr: "5.685%", points: "+0.961" },
    ],
  },
};

const avgData = {
  "30 Year Fixed": "6.38%",
  "15 Year Fixed": "5.88%",
};

let currentProgram = "30 Year Fixed";
let currentType = "Purchase";

function updateRates(type = currentType, program = currentProgram) {
  currentType = type;
  currentProgram = program;

  const cards = [
    document.getElementById("rate-card-1"),
    document.getElementById("rate-card-2"),
    document.getElementById("rate-card-3"),
  ];

  const programRates = rateData[type][program];
  const avgValue = avgData[program];

  document.getElementById("avg-label").textContent = program;
  document.getElementById("avg-value").textContent = avgValue;

  cards.forEach((card, index) => {
    const data = programRates[index];
    card.querySelector(".type-label").textContent = type;
    card.querySelector(".program-label").textContent = program;
    card.querySelector(".interest-value").textContent = data.interest;
    card.querySelector(".apr-value").textContent = data.apr;
    card.querySelector(".points-value").textContent = data.points;

    // Add a small fade animation
    card.style.opacity = "0";
    setTimeout(() => {
      card.style.opacity = "1";
    }, 50 * index);
  });
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const programName = btn.textContent.trim();

    // Update UI active state
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.className =
        "tab-btn px-6 py-2.5 rounded-lg font-bold text-[13px] transition-all bg-w-color text-title hover:bg-border";
    });
    btn.className =
      "tab-btn px-6 py-2.5 rounded-lg font-bold text-[13px] transition-all bg-title text-w-color";

    updateRates(currentType, programName);
  });
});
