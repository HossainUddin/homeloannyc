// Page Custom Logic
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loan-inquiry-form");
  const successScreen = document.getElementById("success-screen");
  const formCard = document.getElementById("form-card");
  const submitBtn = document.getElementById("submit-btn");

  // Format number helper
  function formatNumber(val) {
    const cleanNum = val.replace(/\D/g, "").substring(0, 9);
    if (!cleanNum) return "";
    return Number(cleanNum).toLocaleString("en-US");
  }

  // Clean number helper
  function cleanNumber(val) {
    return parseFloat(val.replace(/,/g, "")) || 0;
  }

  // --- Income Formatting ---
  const incomeInput = document.getElementById("income-input");
  incomeInput.addEventListener("input", (e) => {
    const selectionStart = e.target.selectionStart;
    const oldLength = e.target.value.length;
    e.target.value = formatNumber(e.target.value);
    const diff = e.target.value.length - oldLength;
    e.target.setSelectionRange(selectionStart + diff, selectionStart + diff);
  });

  // --- Phone Formatting ---
  const phoneInput = document.getElementById("phone-input");
  phoneInput.addEventListener("input", (e) => {
    const cleanNum = e.target.value.replace(/\D/g, "");
    let formatted = "";
    if (cleanNum.length > 0) {
      formatted += "(" + cleanNum.substring(0, 3);
    }
    if (cleanNum.length >= 4) {
      formatted += ") " + cleanNum.substring(3, 6);
    }
    if (cleanNum.length >= 7) {
      formatted += "-" + cleanNum.substring(6, 10);
    }
    e.target.value = formatted;
  });

  // --- First Name & Last Name Restrictions (No numbers) ---
  const firstNameInput = document.getElementById("first-name-input");
  const lastNameInput = document.getElementById("last-name-input");
  [firstNameInput, lastNameInput].forEach((input) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\d/g, "");
    });
  });

  // --- Clear Select Validation Error on Option Click ---
  const dropdownOptions = document.querySelectorAll(".dropdown-option");
  dropdownOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      const dropdown = opt.closest(".custom-dropdown");
      const hiddenInput = dropdown.querySelector('input[type="hidden"]');
      const errorId = "error-" + hiddenInput.name.replace("_", "-");
      const errorEl = document.getElementById(errorId);
      if (errorEl) {
        errorEl.classList.add("hidden");
      }
    });
  });

  // Validation helper
  function validateField(inputEl, errorEl, checkFn) {
    const isValid = checkFn(inputEl.value);
    if (isValid) {
      errorEl.classList.add("hidden");
    } else {
      errorEl.classList.remove("hidden");
    }
    return isValid;
  }

  // Form Submit Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name-input");
    const lastName = document.getElementById("last-name-input");
    const email = document.getElementById("email-input");
    const phone = document.getElementById("phone-input");
    const address = document.getElementById("address-input");
    const reason = document.getElementById("loan-reason-input");
    const state = document.getElementById("state-input");
    const income = document.getElementById("income-input");
    const creditScore = document.getElementById("credit-score-input");

    const errFirstName = document.getElementById("error-first-name");
    const errLastName = document.getElementById("error-last-name");
    const errEmail = document.getElementById("error-email");
    const errPhone = document.getElementById("error-phone");
    const errAddress = document.getElementById("error-address");
    const errReason = document.getElementById("error-loan-reason");
    const errState = document.getElementById("error-state");
    const errIncome = document.getElementById("error-income");
    const errCreditScore = document.getElementById("error-credit-score");

    let isValid = true;

    // Check Address
    // Address is optional, so we hide the error and don't validate length
    errAddress.classList.add("hidden");

    // Check First Name
    if (
      !validateField(firstName, errFirstName, (val) => val.trim().length > 0 && !/\d/.test(val))
    ) {
      isValid = false;
    }
    // Check Last Name
    if (!validateField(lastName, errLastName, (val) => val.trim().length > 0 && !/\d/.test(val))) {
      isValid = false;
    }
    // Check Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validateField(email, errEmail, (val) => emailRegex.test(val.trim()))) {
      isValid = false;
    }
    // Check Phone
    const cleanPhone = phone.value.replace(/\D/g, "");
    if (!validateField(phone, errPhone, (val) => cleanPhone.length === 10)) {
      isValid = false;
    }
    // Check Reason for Loan
    if (!validateField(reason, errReason, (val) => val !== "")) {
      isValid = false;
    }
    // Check State
    if (!validateField(state, errState, (val) => val === "NY")) {
      isValid = false;
    }
    // Check Income
    const incomeVal = cleanNumber(income.value);
    if (!validateField(income, errIncome, (val) => incomeVal > 0)) {
      isValid = false;
    }
    // Check Credit Score
    if (!validateField(creditScore, errCreditScore, (val) => val !== "")) {
      isValid = false;
    }

    if (!isValid) {
      // Scroll to the first error
      const firstError = form.querySelector(".text-red-500:not(.hidden)");
      if (firstError) {
        firstError.previousElementSibling.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // Submission animation
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin text-sm"></i> Submitting...';

    setTimeout(() => {
      document.getElementById("success-name").innerText =
        firstName.value.trim();

      // Hide the form
      form.classList.add("hidden");

      // Adjust card style to make it look premium
      formCard.classList.remove("bg-slate-200");
      formCard.classList.add("bg-w-color", "border-none", "shadow-none");

      // Show success screen
      successScreen.classList.remove("hidden");

      // Scroll smoothly to success screen
      formCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 1200);
  });
});
