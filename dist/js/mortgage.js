// Global Chart Instance
let paymentChart = null;

// On DOM load, initialize to step 1
document.addEventListener("DOMContentLoaded", () => {
  nextStep(1);
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
    let dpp = (dpa / hp) * 100;
    if (dpp > 99) dpp = 99;
    if (dpp >= 10) {
      dpPercentInput.value = Math.round(dpp).toString();
    } else {
      dpPercentInput.value = dpp.toFixed(1).replace(/\.0$/, "");
    }
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
  const creditScoreInput = document.getElementById("creditScore");
  const creditScoreDropdown = creditScoreInput ? creditScoreInput.closest(".custom-dropdown") : null;
  const creditScoreSpan = creditScoreDropdown ? creditScoreDropdown.querySelector(".dropdown-trigger span") : null;
  const creditScoreText = creditScoreSpan ? creditScoreSpan.innerText.trim() : (creditScoreInput ? creditScoreInput.value + "+" : "N/A");
  document.getElementById("summaryCreditScore").innerText = creditScoreText;
  document.getElementById("summaryZipCode").innerText = document.getElementById("zipCode").value || "N/A";



  // Update Progress Bar
  document.getElementById("piBar").style.width =
    totalMonthly > 0 ? `${(monthlyPI / totalMonthly) * 100}%` : "0%";

  nextStep(3);
  
  // Scroll to results top so form is centered and visible on mobile
  const wizard = document.getElementById("mortgage-wizard");
  if (wizard) {
    wizard.scrollIntoView({ behavior: "smooth" });
  }
  
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

// Restrict numeric and decimal inputs to numbers only
document.addEventListener("DOMContentLoaded", () => {
  const integerIds = ["homePrice", "downPaymentAmount", "zipCode", "propTax", "homeIns", "pmi", "hoa"];
  const decimalIds = ["downPaymentPercent", "interestRate"];
  const max9DigitIds = ["homePrice", "downPaymentAmount", "propTax", "homeIns", "pmi", "hoa"];
  const max2DigitIds = ["interestRate", "downPaymentPercent"];

  integerIds.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    
    input.addEventListener("keypress", (e) => {
      if (e.key.length > 1) return; // Allow navigation/control keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
        return;
      }

      if (max9DigitIds.includes(id)) {
        const currentDigits = input.value.replace(/\D/g, "");
        let isSelectionSupported = true;
        try {
          if (input.selectionStart !== input.selectionEnd) {
            return; // Allow typed key to replace selection
          }
        } catch (err) {
          isSelectionSupported = false;
        }
        if (currentDigits.length >= 9 && isSelectionSupported) {
          e.preventDefault();
        }
      }
    });

    input.addEventListener("input", () => {
      let val = input.value.replace(/\D/g, "");
      if (max9DigitIds.includes(id) && val.length > 9) {
        val = val.slice(0, 9);
      }
      input.value = val;
    });
  });

  decimalIds.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("keypress", (e) => {
      if (e.key.length > 1) return; // Allow navigation/control keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === ".") {
        if (input.value.includes(".")) {
          e.preventDefault();
          return;
        }
      } else if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
        return;
      }

      let maxDigits = 0;
      if (max9DigitIds.includes(id)) {
        maxDigits = 9;
      } else if (max2DigitIds.includes(id)) {
        maxDigits = 2;
      }

      if (maxDigits > 0) {
        const currentDigits = input.value.replace(/[^0-9]/g, "");
        let isSelectionSupported = true;
        try {
          if (input.selectionStart !== input.selectionEnd) {
            return; // Allow typed key to replace selection
          }
        } catch (err) {
          isSelectionSupported = false;
        }
        if (currentDigits.length >= maxDigits && isSelectionSupported) {
          e.preventDefault();
        }
      }
    });

    input.addEventListener("input", () => {
      let val = input.value;
      val = val.replace(/[^0-9.]/g, "");
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }

      let maxDigits = 0;
      if (max9DigitIds.includes(id)) {
        maxDigits = 9;
      } else if (max2DigitIds.includes(id)) {
        maxDigits = 2;
      }

      if (maxDigits > 0) {
        let digitCount = 0;
        let cleaned = "";
        for (let i = 0; i < val.length; i++) {
          if (/[0-9]/.test(val[i])) {
            if (digitCount < maxDigits) {
              cleaned += val[i];
              digitCount++;
            }
          } else if (val[i] === ".") {
            cleaned += val[i];
          }
        }
        val = cleaned;
      }

      input.value = val;
    });
  });
});


