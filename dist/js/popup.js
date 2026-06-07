// Multi-step Mortgage Inquiry Wizard JS

// Global Wizard State
let currentWizardStep = 1;
let wizardData = {
  intent: "purchase", // "purchase" or "refinance"
  residencyType: "",
  decisionProcess: "",
  propertyType: "",
  zipCode: "",
  propertyValue: 450000,
  downPayment: 50000,
  annualIncome: 215000,
  creditScore: 700,
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  suffix: "",
  smsConsent: false
};

// Zip Codes suggestions database
const zipDatabase = [
  { zip: "10001", city: "New York", state: "NY" },
  { zip: "11214", city: "Brooklyn", state: "NY" },
  { zip: "11101", city: "Long Island City", state: "NY" },
  { zip: "11207", city: "Brooklyn", state: "NY" },
  { zip: "11220", city: "Brooklyn", state: "NY" },
  { zip: "10002", city: "New York", state: "NY" },
  { zip: "10003", city: "New York", state: "NY" },
  { zip: "11201", city: "Brooklyn", state: "NY" },
  { zip: "11211", city: "Brooklyn", state: "NY" },
  { zip: "11215", city: "Brooklyn", state: "NY" },
  { zip: "11218", city: "Brooklyn", state: "NY" },
  { zip: "11226", city: "Brooklyn", state: "NY" },
  { zip: "11235", city: "Brooklyn", state: "NY" },
  { zip: "10301", city: "Staten Island", state: "NY" },
  { zip: "10451", city: "Bronx", state: "NY" },
  { zip: "11432", city: "Jamaica", state: "NY" },
  { zip: "11354", city: "Flushing", state: "NY" },
  { zip: "11209", city: "Brooklyn", state: "NY" },
  { zip: "11229", city: "Brooklyn", state: "NY" },
  { zip: "11234", city: "Brooklyn", state: "NY" },
  { zip: "11230", city: "Brooklyn", state: "NY" }
];

// Open Wizard Modal
function openWizard(intent) {
  wizardData.intent = intent;
  currentWizardStep = 1;
  
  // Reset fields to defaults
  document.getElementById("wizard-info-form").reset();
  document.getElementById("wizard-suffix").value = "";
  document.querySelector('[data-placeholder="Select Suffix"] .dropdown-trigger span').innerText = "Select Suffix";
  document.querySelector('[data-placeholder="Select Suffix"] .dropdown-trigger span').classList.add("text-slate-400");
  
  // Set up step 6 values based on intent
  const range6 = document.getElementById("wizard-range-6");
  const minLabel = document.getElementById("wizard-range-6-min-label");
  const maxLabel = document.getElementById("wizard-range-6-max-label");
  const dpPctContainer = document.getElementById("wizard-dp-pct-container");
  const step6Title = document.getElementById("wizard-step-6-title");

  if (intent === "purchase") {
    step6Title.innerText = "Estimated down payment";
    range6.min = 10000;
    range6.max = 400000;
    range6.step = 5000;
    range6.value = 50000;
    minLabel.innerText = "$10K";
    maxLabel.innerText = "$400K+";
    dpPctContainer.classList.remove("hidden");
  } else {
    step6Title.innerText = "Current mortgage balance";
    range6.min = 50000;
    range6.max = 1500000;
    range6.step = 10000;
    range6.value = 300000;
    minLabel.innerText = "$50K";
    maxLabel.innerText = "$1.5M+";
    dpPctContainer.classList.add("hidden");
  }

  // Reset Zip Code
  const zipInput = document.getElementById("wizard-zip-input");
  zipInput.value = "";
  document.getElementById("wizard-zip-next-btn").disabled = true;

  // Sync inputs
  updateSliderProgress(document.getElementById("wizard-range-5"));
  updateSliderProgress(range6);
  updateSliderProgress(document.getElementById("wizard-range-7"));
  updateSliderProgress(document.getElementById("wizard-range-8"));
  
  syncSliderValue(5);
  syncSliderValue(6);
  syncSliderValue(7);
  syncSliderValue(8);

  // Show Modal
  document.getElementById("wizard-modal").classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  
  updateWizardUI();
}

// Close Wizard Modal
function closeWizard() {
  document.getElementById("wizard-modal").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

// Navigate to Next Step
function nextWizardStep() {
  if (currentWizardStep < 10) {
    currentWizardStep++;
    updateWizardUI();
  }
}

// Navigate to Previous Step
function prevWizardStep() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    updateWizardUI();
  }
}

// Update UI based on active step
function updateWizardUI() {
  // Hide all steps
  document.querySelectorAll(".wizard-step").forEach(step => {
    step.classList.add("hidden");
  });

  // Show current step
  const activeStep = document.getElementById(`wizard-step-${currentWizardStep}`);
  if (activeStep) {
    activeStep.classList.remove("hidden");
  }

  // Handle Back Button visibility
  const prevBtn = document.getElementById("wizard-prev-btn");
  if (currentWizardStep > 1 && currentWizardStep < 10) {
    prevBtn.classList.remove("hidden");
  } else {
    prevBtn.classList.add("hidden");
  }

  // Calculate and update progress percentage
  // Logical progress mappings
  const progressMap = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 80,
    9: 90,
    10: 100
  };
  
  const pct = progressMap[currentWizardStep] || 0;
  document.getElementById("wizard-progress-bar").style.width = `${pct}%`;
  document.getElementById("wizard-progress-text").innerText = `${pct}%`;

  // Scroll wizard container to top of viewport
  const stepsContainer = document.querySelector("#wizard-modal .flex-1.overflow-y-auto");
  if (stepsContainer) {
    stepsContainer.scrollTop = 0;
  }
}

// Select residency type card (Step 1)
function selectResidency(value) {
  wizardData.residencyType = value;
  nextWizardStep();
}

// Select decision process (Step 2)
function selectDecision(value) {
  wizardData.decisionProcess = value;
  nextWizardStep();
}

// Select property type card (Step 3)
function selectPropertyType(value) {
  wizardData.propertyType = value;
  nextWizardStep();
}

// Sync slider input changes with UI
function syncSliderValue(stepNum) {
  const slider = document.getElementById(`wizard-range-${stepNum}`);
  const display = document.getElementById(`wizard-val-display-${stepNum}`);
  if (!slider || !display) return;

  const val = parseFloat(slider.value);
  
  if (stepNum === 8) {
    // Credit score
    display.innerText = val;
    wizardData.creditScore = val;
  } else {
    // Currency format
    display.innerText = formatCurrency(val);
    if (stepNum === 5) wizardData.propertyValue = val;
    if (stepNum === 6) wizardData.downPayment = val;
    if (stepNum === 7) wizardData.annualIncome = val;
  }

  // Update down payment percentage dynamically in Step 6 (only in purchase mode)
  if (stepNum === 6 && wizardData.intent === "purchase") {
    const propVal = wizardData.propertyValue;
    const dpVal = wizardData.downPayment;
    const pct = propVal > 0 ? Math.round((dpVal / propVal) * 100) : 0;
    document.getElementById("wizard-dp-pct-container").innerText = `Down Payment: ${pct}%`;
  }
}

// Format number to USD currency representation
function formatCurrency(val) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(val);
}

// Slider track color fill progress
function updateSliderProgress(slider) {
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const percent = ((val - min) / (max - min)) * 100;
  
  const rootStyle = getComputedStyle(document.documentElement);
  const primaryColor = rootStyle.getPropertyValue('--color-primary').trim() || '#d96b27';
  
  slider.style.background = `linear-gradient(to right, ${primaryColor} ${percent}%, #cbd5e1 ${percent}%)`;
}

// Form validation and submit
let wizardChartInstance = null;

function submitWizardForm(event) {
  event.preventDefault();

  const firstName = document.getElementById("wizard-firstName").value.trim();
  const lastName = document.getElementById("wizard-lastName").value.trim();
  const email = document.getElementById("wizard-email").value.trim();
  const phone = document.getElementById("wizard-phoneNumber").value.trim();
  const suffix = document.getElementById("wizard-suffix").value;
  const smsConsent = document.getElementById("wizard-smsConsent").checked;

  if (!firstName || !lastName || !email || !phone || !smsConsent) {
    alert("Please fill in all required fields and accept the SMS consent.");
    return;
  }

  // Store variables
  wizardData.firstName = firstName;
  wizardData.lastName = lastName;
  wizardData.email = email;
  wizardData.phoneNumber = phone;
  wizardData.suffix = suffix;
  wizardData.smsConsent = smsConsent;

  // Print results to console
  console.log("Wizard submission received:", wizardData);

  // Perform mortgage calculation and render
  renderWizardResults();

  // Scroll wizard container to top
  const stepsContainer = document.querySelector("#wizard-modal .flex-1.overflow-y-auto");
  if (stepsContainer) {
    stepsContainer.scrollTop = 0;
  }

  nextWizardStep();
}

function renderWizardResults() {
  const hp = wizardData.propertyValue;
  const dp = wizardData.downPayment;
  const credit = wizardData.creditScore;
  const zip = wizardData.zipCode || "N/A";
  const intent = wizardData.intent;
  const propType = wizardData.propertyType || "Single Family Home";

  // Calculate dynamic interest rate based on credit score
  let interestRateVal = 6.5; // default
  if (credit >= 740) interestRateVal = 5.99;
  else if (credit >= 700) interestRateVal = 6.25;
  else if (credit >= 680) interestRateVal = 6.5;
  else if (credit >= 620) interestRateVal = 6.99;
  else interestRateVal = 7.5;

  const annualRate = interestRateVal / 100;
  const monthlyRate = annualRate / 12;
  const termMonths = 30 * 12; // 30 years fixed standard
  
  // Principal amount
  const principal = hp - (intent === "purchase" ? dp : 0);

  // Monthly P&I Calculation
  let monthlyPI = 0;
  if (monthlyRate === 0) {
    monthlyPI = principal / termMonths;
  } else {
    monthlyPI = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  // Property Tax (1.2% per year)
  const monthlyTax = (hp * 0.012) / 12;

  // Home Insurance (0.35% per year)
  const monthlyIns = (hp * 0.0035) / 12;

  // PMI: Only for purchase if down payment is less than 20%
  let monthlyPMI = 0;
  const dpPercent = hp > 0 ? (dp / hp) * 100 : 0;
  if (intent === "purchase" && dpPercent < 20) {
    // 0.75% of loan balance per year
    monthlyPMI = (principal * 0.0075) / 12;
  }

  // HOA: Condo / Townhome gets HOA, others $0
  let monthlyHOA = 0;
  if (propType.includes("Condo")) {
    monthlyHOA = 250;
  } else if (propType.includes("Townhome")) {
    monthlyHOA = 150;
  } else if (propType.includes("Multi Unit")) {
    monthlyHOA = 100;
  }

  const totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyPMI + monthlyHOA;

  // Populate HTML fields in Step 10
  document.getElementById("wizard-summary-purpose").innerText = intent === "purchase" ? "Purchase" : "Refinance";
  document.getElementById("wizard-summary-homePrice").innerText = formatCurrency(hp);
  
  const dpLabel = document.getElementById("wizard-summary-downPayment-label");
  const dpDisplay = document.getElementById("wizard-summary-downPayment");
  
  if (intent === "purchase") {
    dpLabel.innerText = "Down Payment";
    dpDisplay.innerText = `${formatCurrency(dp)} (${Math.round(dpPercent)}%)`;
  } else {
    dpLabel.innerText = "Mortgage Balance";
    dpDisplay.innerText = formatCurrency(dp);
  }

  document.getElementById("wizard-summary-interestRate").innerText = `${interestRateVal.toFixed(2)}%`;
  document.getElementById("wizard-summary-creditScore").innerText = `${credit}+`;
  document.getElementById("wizard-summary-zipCode").innerText = zip;
  document.getElementById("wizard-summary-totalPayment").innerText = formatCurrency(totalMonthly);

  // Breakdown values
  document.getElementById("wizard-breakdown-pi").innerText = formatCurrency(monthlyPI);
  document.getElementById("wizard-breakdown-tax").innerText = formatCurrency(monthlyTax);
  document.getElementById("wizard-breakdown-ins").innerText = formatCurrency(monthlyIns);

  // Handle rows visibility
  const pmiRow = document.getElementById("wizard-breakdown-pmi-row");
  if (intent === "purchase" && monthlyPMI > 0) {
    pmiRow.classList.remove("hidden");
    document.getElementById("wizard-breakdown-pmi").innerText = formatCurrency(monthlyPMI);
  } else {
    pmiRow.classList.add("hidden");
  }

  const hoaRow = document.getElementById("wizard-breakdown-hoa-row");
  if (monthlyHOA > 0) {
    hoaRow.classList.remove("hidden");
    document.getElementById("wizard-breakdown-hoa").innerText = formatCurrency(monthlyHOA);
  } else {
    hoaRow.classList.add("hidden");
  }

  // Draw chart
  initWizardChart(monthlyPI, monthlyTax, monthlyIns, monthlyPMI, monthlyHOA);
}

function initWizardChart(pi, tax, ins, pmi, hoa) {
  const canvas = document.getElementById("wizard-payment-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (wizardChartInstance) {
    wizardChartInstance.destroy();
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const primaryColor = rootStyle.getPropertyValue('--color-primary').trim() || '#d96b27';

  // Build values arrays
  const chartData = [pi, tax, ins];
  const chartLabels = ["P&I", "Taxes", "Insurance"];
  const chartColors = [primaryColor, "#3b82f6", "#a855f7"];

  if (pmi > 0) {
    chartData.push(pmi);
    chartLabels.push("PMI");
    chartColors.push("#f97316");
  }
  if (hoa > 0) {
    chartData.push(hoa);
    chartLabels.push("HOA");
    chartColors.push("#ec4899");
  }

  wizardChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      cutout: "80%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    },
  });
}


// Document Ready triggers setup
document.addEventListener("DOMContentLoaded", () => {
  // Bind trigger buttons
  const btnPurchase = document.getElementById("btn-hero-purchase");
  const btnRefinance = document.getElementById("btn-hero-refinance");

  if (btnPurchase) {
    btnPurchase.addEventListener("click", () => openWizard("purchase"));
  }
  if (btnRefinance) {
    btnRefinance.addEventListener("click", () => openWizard("refinance"));
  }

  // Setup slider listeners
  for (let i = 5; i <= 8; i++) {
    const slider = document.getElementById(`wizard-range-${i}`);
    if (slider) {
      // Input event captures sliding live
      slider.addEventListener("input", function() {
        syncSliderValue(i);
        updateSliderProgress(this);
      });
      // Initial background setup
      updateSliderProgress(slider);
    }
  }

  // Setup ZIP code autocomplete logic
  const zipInput = document.getElementById("wizard-zip-input");
  const suggestionsBox = document.getElementById("wizard-zip-suggestions");
  const nextBtn = document.getElementById("wizard-zip-next-btn");

  if (zipInput) {
    zipInput.addEventListener("input", function() {
      const val = this.value.trim().toLowerCase();
      suggestionsBox.innerHTML = "";

      if (!val) {
        suggestionsBox.classList.add("hidden");
        nextBtn.disabled = true;
        return;
      }

      // Filter matches
      const matches = zipDatabase.filter(item => {
        return item.zip.includes(val) || 
               item.city.toLowerCase().includes(val) ||
               item.state.toLowerCase().includes(val);
      });

      if (matches.length > 0) {
        suggestionsBox.classList.remove("hidden");
        matches.slice(0, 5).forEach(item => {
          const div = document.createElement("div");
          div.className = "px-5 py-3 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors font-semibold text-sm text-title";
          div.innerText = `${item.city}, ${item.state} ${item.zip}`;
          div.addEventListener("click", () => {
            zipInput.value = `${item.city}, ${item.state} ${item.zip}`;
            wizardData.zipCode = item.zip;
            suggestionsBox.classList.add("hidden");
            nextBtn.disabled = false;
          });
          suggestionsBox.appendChild(div);
        });
      } else {
        suggestionsBox.classList.add("hidden");
      }

      // Enable next if zip format matches 5-digit regex
      const isValidZip = /^\d{5}$/.test(val) || /^[a-zA-Z\s,]+\d{5}$/.test(val);
      nextBtn.disabled = !isValidZip;
      if (isValidZip) {
        wizardData.zipCode = val;
      }
    });

    // Close suggestions list on outer clicks
    document.addEventListener("click", (e) => {
      if (!zipInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.add("hidden");
      }
    });
  }


});
