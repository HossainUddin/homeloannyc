function showCaptcha() {
  document.getElementById("step-pre-captcha").classList.add("hidden");
  document.getElementById("step-0").classList.remove("hidden");
}

function onCaptchaSuccess() {
  sessionStorage.setItem("humanVerified", "true");
  setTimeout(() => {
    document.getElementById("step-0").classList.add("hidden");
    document.getElementById("step-1").classList.remove("hidden");
    document.getElementById("progress-container").classList.remove("hidden");
    updateProgress(1);
  }, 500);
}

// Check for persisted verification on load
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("humanVerified") === "true") {
    // Skip splash and captcha
    document.getElementById("step-pre-captcha").classList.add("hidden");
    document.getElementById("step-0").classList.add("hidden");
    document.getElementById("step-1").classList.remove("hidden");
    document.getElementById("progress-container").classList.remove("hidden");
    updateProgress(1);
  }
});

function nextStep(n) {
  // Validation
  const currentStepEl = document.querySelector(".step:not(.hidden)");
  if (currentStepEl && n > 0) {
    const currentStepNum = parseInt(currentStepEl.id.replace("step-", ""));
    if (n > currentStepNum) {
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
  document.getElementById(`step-${n}`).classList.remove("hidden");
  updateProgress(n);
}

function updateProgress(n) {
  const progress = (n / 4) * 100;
  document.getElementById("progress-bar").style.width = `${progress}%`;
}

function parseNum(str) {
  return parseFloat(str.toString().replace(/,/g, "")) || 0;
}

function formatCurr(num) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function calculateAffordability() {
  // Inputs
  const income = parseNum(document.getElementById("annualIncome").value);
  const debt = parseNum(document.getElementById("monthlyDebt").value);
  const downPayment = parseNum(document.getElementById("downPayment").value);
  const interestRate =
    parseNum(document.getElementById("interestRate").value) / 100 / 12;
  const term = parseNum(document.getElementById("loanTerm").value) * 12;

  // Monthly Fees
  const tax = parseNum(document.getElementById("propTax").value);
  const ins = parseNum(document.getElementById("homeIns").value);
  const pmi = parseNum(document.getElementById("pmi").value);
  const hoa = parseNum(document.getElementById("hoa").value);
  const totalFees = tax + ins + pmi + hoa;

  const monthlyGross = income / 12;

  // Logic:
  // Recommended Housing = min(28% gross, 36% gross - existing debt)
  // Max Housing = 43% gross - existing debt

  const recMonthlyBudget = Math.min(
    monthlyGross * 0.28,
    monthlyGross * 0.36 - debt,
  );
  const maxMonthlyBudget = monthlyGross * 0.43 - debt;

  function solveForHomePrice(monthlyBudget) {
    const availablePI = monthlyBudget - totalFees;
    if (availablePI <= 0) return downPayment; // Cannot afford anything

    // Mortgage Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    // Inverse: P = M * [ (1 + i)^n – 1 ] / [ i(1 + i)^n ]
    const p =
      (availablePI * (Math.pow(1 + interestRate, term) - 1)) /
      (interestRate * Math.pow(1 + interestRate, term));
    return p + downPayment;
  }

  const recHomePrice = solveForHomePrice(recMonthlyBudget);
  const maxHomePrice = solveForHomePrice(maxMonthlyBudget);

  // Display
  document.getElementById("recHomePrice").innerText = formatCurr(recHomePrice);
  document.getElementById("recMonthly").innerText =
    formatCurr(recMonthlyBudget);
  document.getElementById("recClosing").innerText = formatCurr(
    recHomePrice * 0.03,
  );

  document.getElementById("maxHomePrice").innerText = formatCurr(maxHomePrice);
  document.getElementById("maxMonthly").innerText =
    formatCurr(maxMonthlyBudget);
  document.getElementById("maxClosing").innerText = formatCurr(
    maxHomePrice * 0.03,
  );

  // Populate Selected Details Summary
  document.getElementById("summaryAnnualIncome").innerText = formatCurr(income);
  document.getElementById("summaryMonthlyDebt").innerText = formatCurr(debt);
  document.getElementById("summaryDownPayment").innerText = formatCurr(downPayment);
  document.getElementById("summaryLoanTerm").innerText = document.getElementById("loanTerm").value + " year fixed";
  document.getElementById("summaryInterestRate").innerText = document.getElementById("interestRate").value + "%";
  document.getElementById("summaryPropTax").innerText = formatCurr(tax) + "/mo";
  document.getElementById("summaryHomeIns").innerText = formatCurr(ins) + "/mo";
  document.getElementById("summaryPmi").innerText = formatCurr(pmi) + "/mo";
  document.getElementById("summaryHoa").innerText = formatCurr(hoa) + "/mo";

  // Check lock state
  const isUnlocked = sessionStorage.getItem("resultsUnlocked") === "true";
  const dataContainer = document.getElementById("results-data-container");
  const overlay = document.getElementById("results-unlock-overlay");
  const wrapper = document.getElementById("results-wrapper");

  if (isUnlocked) {
    dataContainer.classList.remove("blur-md", "pointer-events-none", "select-none");
    overlay.classList.add("hidden");
    if (wrapper) wrapper.classList.remove("max-h-[720px]", "overflow-hidden");
  } else {
    dataContainer.classList.add("blur-md", "pointer-events-none", "select-none");
    overlay.classList.remove("hidden");
    if (wrapper) wrapper.classList.add("max-h-[720px]", "overflow-hidden");
  }

  nextStep(4);
  
  // Scroll to results top so form is centered and visible on mobile
  const wizard = document.getElementById("affordability-wizard");
  if (wizard) {
    wizard.scrollIntoView({ behavior: "smooth" });
  }
}

// Add formatters for currency inputs
[
  "annualIncome",
  "monthlyDebt",
  "downPayment",
  "propTax",
  "homeIns",
  "pmi",
  "hoa",
].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => {
    const val = parseNum(input.value);
    input.value = val.toLocaleString();
  });
});

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
  const wrapper = document.getElementById("results-wrapper");
  
  dataContainer.classList.remove("blur-md", "pointer-events-none", "select-none");
  overlay.classList.add("hidden");
  if (wrapper) wrapper.classList.remove("max-h-[720px]", "overflow-hidden");

  // Scroll to results top
  const wizard = document.getElementById("affordability-wizard");
  if (wizard) {
    wizard.scrollIntoView({ behavior: "smooth" });
  }
}
