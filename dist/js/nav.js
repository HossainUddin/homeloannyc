// Mobile Menu toggle
const menuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const menuIcon = document.getElementById("menu-icon");

menuButton.addEventListener("click", () => {
  const isHidden = mobileMenu.classList.contains("hidden");
  if (isHidden) {
    mobileMenu.classList.remove("hidden");
    menuIcon.setAttribute("d", "M6 18L18 6M6 6l12 12");
  } else {
    mobileMenu.classList.add("hidden");
    menuIcon.setAttribute("d", "M4 12h16M4 6h16M4 18h16");
  }
});

// Generic Dropdown Toggle Helper
function setupDropdown(btnId, dropdownId, arrowId) {
  const btn = document.getElementById(btnId);
  const dropdown = document.getElementById(dropdownId);
  const arrow = document.getElementById(arrowId);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = dropdown.classList.contains("hidden");

    // Close all other dropdowns first
    document
      .querySelectorAll('[id$="-dropdown"]')
      .forEach((d) => d.classList.add("hidden"));
    document
      .querySelectorAll('[id$="-arrow"]')
      .forEach((a) => (a.style.transform = "rotate(0deg)"));
    document
      .querySelectorAll('[id$="-button"]')
      .forEach((b) => b.classList.remove("text-primary"));

    if (isHidden) {
      dropdown.classList.remove("hidden");
      if (arrow) arrow.style.transform = "rotate(180deg)";
      btn.classList.add("text-primary");
    }
  });
}

setupDropdown("shop-rates-button", "shop-rates-dropdown", "shop-rates-arrow");
setupDropdown(
  "loan-programs-button",
  "loan-programs-dropdown",
  "loan-programs-arrow",
);
setupDropdown("join-us-button", "join-us-dropdown", "join-us-arrow");

// Close dropdowns when clicking outside
window.addEventListener("click", (e) => {
  document.querySelectorAll('[id$="-dropdown"]').forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
      const arrowId = dropdown.id.replace("-dropdown", "-arrow");
      const arrow = document.getElementById(arrowId);
      if (arrow) arrow.style.transform = "rotate(0deg)";
      const btnId = dropdown.id.replace("-dropdown", "-button");
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.remove("text-primary");
    }
  });
});

// Mobile Accordion Helper
function setupMobileAccordion(btnId, contentId, arrowId) {
  const btn = document.getElementById(btnId);
  const content = document.getElementById(contentId);
  const arrow = document.getElementById(arrowId);

  btn.addEventListener("click", () => {
    const isHidden = content.classList.contains("hidden");
    if (isHidden) {
      content.classList.remove("hidden");
      arrow.style.transform = "rotate(180deg)";
      btn.classList.add("text-primary");
    } else {
      content.classList.add("hidden");
      arrow.style.transform = "rotate(0deg)";
      btn.classList.remove("text-primary");
    }
  });
}

setupMobileAccordion(
  "mobile-shop-rates-btn",
  "mobile-shop-rates-content",
  "mobile-arrow",
);
setupMobileAccordion(
  "mobile-loan-btn",
  "mobile-loan-content",
  "mobile-loan-arrow",
);
setupMobileAccordion(
  "mobile-join-btn",
  "mobile-join-content",
  "mobile-join-arrow",
);
