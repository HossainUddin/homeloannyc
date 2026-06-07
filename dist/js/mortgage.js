// Global Chart Instance
let paymentChart = null;

function showCaptcha() {
  document.getElementById("step-pre-captcha").classList.add("hidden");
  document.getElementById("step-0").classList.remove("hidden");
}

// Gatekeeper Success
function onCaptchaSuccess() {
  sessionStorage.setItem("humanVerified", "true");
  setTimeout(() => {
    nextStep(1);
    document.getElementById("progress-container").classList.remove("hidden");
  }, 300);
}

// Check for persisted verification on load
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("humanVerified") === "true") {
    // Skip splash and captcha
    nextStep(1);
    document.getElementById("progress-container").classList.remove("hidden");
  }
});

// Step Management
function nextStep(stepNumber) {
  // Validation check
  const currentStepEl = document.querySelector(".step:not(.hidden)");
  if (currentStepEl && stepNumber > 0) {
    const currentStepId = currentStepEl.id;
    const currentStepNum = parseInt(currentStepId.replace("step-", ""));

    // Only validate when moving forward
    if (stepNumber > currentStepNum) {
      const inputs = currentStepEl.querySelectorAll(
        "input[required], select[required]",
      );
      let isValid = true;
      inputs.forEach((input) => {
        if (
          !input.value.trim() ||
          (input.type === "email" && !input.checkValidity())
        ) {
          input.classList.add("border-red-500");
          isValid = false;
        } else {
          input.classList.remove("border-red-500");
        }
      });

      if (!isValid) {
        alert("Please fill in all required fields correctly.");
        return;
      }
    }
  }

  document.querySelectorAll(".step").forEach((s) => s.classList.add("hidden"));
  document.getElementById(`step-${stepNumber}`).classList.remove("hidden");

  // Update Progress Bar
  const progress = (stepNumber / 3) * 100;
  document.getElementById("progress-bar").style.width = `${progress}%`;
}

function resetWizard() {
  nextStep(1);
}

// Formatting Utility
function formatCurrency(val) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function parseFormattedNumber(str) {
  return parseFloat(str.replace(/,/g, "")) || 0;
}

// Input Sync: Home Price -> Down Payment
const homePriceInput = document.getElementById("homePrice");
const dpAmountInput = document.getElementById("downPaymentAmount");
const dpPercentInput = document.getElementById("downPaymentPercent");

homePriceInput.addEventListener("blur", () => {
  let val = parseFormattedNumber(homePriceInput.value);
  homePriceInput.value = val.toLocaleString();
  updateDpFromPercent();
});

dpAmountInput.addEventListener("blur", () => {
  let val = parseFormattedNumber(dpAmountInput.value);
  dpAmountInput.value = val.toLocaleString();
  updatePercentFromAmount();
});

dpPercentInput.addEventListener("blur", () => {
  updateDpFromPercent();
});

function updateDpFromPercent() {
  const hp = parseFormattedNumber(homePriceInput.value);
  const dpp = parseFloat(dpPercentInput.value) || 0;
  const dpa = (hp * dpp) / 100;
  dpAmountInput.value = dpa.toLocaleString();
}

function updatePercentFromAmount() {
  const hp = parseFormattedNumber(homePriceInput.value);
  const dpa = parseFormattedNumber(dpAmountInput.value);
  if (hp > 0) {
    const dpp = (dpa / hp) * 100;
    dpPercentInput.value = dpp.toFixed(2).replace(/\.00$/, "");
  }
}

// Main Calculation Logic
function calculateAndShowResults() {
  const homePrice = parseFormattedNumber(homePriceInput.value);
  const downPayment = parseFormattedNumber(dpAmountInput.value);
  const loanTerm = parseInt(document.getElementById("loanTerm").value);
  const interestRate =
    parseFloat(document.getElementById("interestRate").value) / 100 / 12;

  const propTaxValue = parseFormattedNumber(
    document.getElementById("propTax").value,
  );
  const homeInsValue = parseFormattedNumber(
    document.getElementById("homeIns").value,
  );
  const pmiValue = parseFormattedNumber(document.getElementById("pmi").value);
  const hoaValue = parseFormattedNumber(document.getElementById("hoa").value);

  const principal = homePrice - downPayment;
  const numberOfPayments = loanTerm * 12;

  // Monthly P&I Calculation
  let monthlyPI = 0;
  if (interestRate === 0) {
    monthlyPI = principal / numberOfPayments;
  } else {
    monthlyPI =
      (principal *
        interestRate *
        Math.pow(1 + interestRate, numberOfPayments)) /
      (Math.pow(1 + interestRate, numberOfPayments) - 1);
  }

  const totalMonthly =
    monthlyPI + propTaxValue + homeInsValue + pmiValue + hoaValue;

  // Populate Result Fields
  document.getElementById("totalPaymentDisplay").innerText =
    formatCurrency(totalMonthly);
  document.getElementById("piAmount").innerText = formatCurrency(monthlyPI);

  document.getElementById("resPropTax").innerText = formatCurrency(propTaxValue);
  document.getElementById("resHomeIns").innerText = formatCurrency(homeInsValue);
  document.getElementById("resPmi").innerText = formatCurrency(pmiValue);
  document.getElementById("resHoa").innerText = formatCurrency(hoaValue);

  // Populate Summary Details
  document.getElementById("summaryHomePrice").innerText = formatCurrency(homePrice);
  const dpPercent = dpPercentInput.value || "0";
  document.getElementById("summaryDownPayment").innerText = `${formatCurrency(downPayment)} (${dpPercent}%)`;
  document.getElementById("summaryLoanTerm").innerText = `${loanTerm} years fixed`;
  document.getElementById("summaryInterestRate").innerText = `${(parseFloat(document.getElementById("interestRate").value) || 0).toFixed(2)}%`;
  document.getElementById("summaryCreditScore").innerText = document.getElementById("creditScore").value + "+";
  document.getElementById("summaryZipCode").innerText = document.getElementById("zipCode").value || "N/A";

  // Check lock state
  const isUnlocked = sessionStorage.getItem("resultsUnlocked") === "true";
  const dataContainer = document.getElementById("results-data-container");
  const overlay = document.getElementById("results-unlock-overlay");

  if (isUnlocked) {
    dataContainer.classList.remove("blur-md", "pointer-events-none", "select-none");
    overlay.classList.add("hidden");
  } else {
    dataContainer.classList.add("blur-md", "pointer-events-none", "select-none");
    overlay.classList.remove("hidden");
  }

  // Update Progress Bar
  document.getElementById("piBar").style.width =
    totalMonthly > 0 ? `${(monthlyPI / totalMonthly) * 100}%` : "0%";

  nextStep(3);
  initChart(monthlyPI, propTaxValue, homeInsValue, pmiValue, hoaValue);
}

function initChart(pi, tax, ins, pmi, hoa) {
  const ctx = document.getElementById("paymentChart").getContext("2d");

  if (paymentChart) {
    paymentChart.destroy();
  }

  // Retrieve dynamic theme primary color from computed CSS variables
  const rootStyle = getComputedStyle(document.documentElement);
  const primaryColor = rootStyle.getPropertyValue('--color-primary').trim() || '#d96b27';

  paymentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["P&I", "Taxes", "Insurance", "PMI", "HOA"],
      datasets: [
        {
          data: [pi, tax, ins, pmi, hoa],
          backgroundColor: [
            primaryColor,
            "#3b82f6",
            "#a855f7",
            "#f97316",
            "#ec4899",
          ],
          borderWidth: 0,
          hoverOffset: 10,
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

// Redraw the chart when the theme is changed to keep colors in sync
document.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.getElementById("themeSwitcher");
  if (themeSwitcher) {
    themeSwitcher.addEventListener("change", () => {
      setTimeout(() => {
        const currentStepEl = document.querySelector(".step:not(.hidden)");
        if (currentStepEl && currentStepEl.id === "step-3") {
          // Re-trigger calculation to update values and chart colors
          calculateAndShowResults();
        }
      }, 100);
    });
  }
});

// Static breakdown, dynamic recalculation triggered via step wizard recalculate button

function unlockResults() {
  const form = document.getElementById("unlockForm");
  const inputs = form.querySelectorAll("input[required]");
  let isValid = true;
  inputs.forEach((input) => {
    if (!input.value.trim() || (input.type === "email" && !input.checkValidity())) {
      input.classList.add("border-red-500");
      isValid = false;
    } else {
      input.classList.remove("border-red-500");
    }
  });

  if (!isValid) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  // Save state
  sessionStorage.setItem("resultsUnlocked", "true");

  // Unlock UI
  const dataContainer = document.getElementById("results-data-container");
  const overlay = document.getElementById("results-unlock-overlay");
  
  dataContainer.classList.remove("blur-md", "pointer-events-none", "select-none");
  overlay.classList.add("hidden");

  // Scroll to results top
  document.getElementById("mortgage-wizard").scrollIntoView({ behavior: "smooth" });
}
