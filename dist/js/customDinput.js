// Custom Dropdown Logic
const dropdowns = document.querySelectorAll(".custom-dropdown");

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector(".dropdown-trigger");
  const menu = dropdown.querySelector(".dropdown-menu");
  const options = dropdown.querySelectorAll(".dropdown-option");
  const hiddenInput = dropdown.querySelector('input[type="hidden"]');
  const triggerText = trigger.querySelector("span");
  const arrow = trigger.querySelector("svg");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains("hidden");

    // Close all other dropdowns
    document.querySelectorAll(".dropdown-menu").forEach((m) => {
      if (m !== menu) m.classList.add("hidden");
    });
    document.querySelectorAll(".dropdown-trigger svg").forEach((a) => {
      if (a !== arrow) a.style.transform = "rotate(0deg)";
    });

    if (isOpen) {
      menu.classList.add("hidden");
      arrow.style.transform = "rotate(0deg)";
    } else {
      menu.classList.remove("hidden");
      arrow.style.transform = "rotate(180deg)";
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.getAttribute("data-value");
      triggerText.innerText = value;
      triggerText.classList.remove("text-slate-400");
      triggerText.classList.add("text-slate-900");
      hiddenInput.value = value;
      menu.classList.add("hidden");
      arrow.style.transform = "rotate(0deg)";
    });
  });
});

// Close dropdowns when clicking outside
window.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu").forEach((m) => {
    m.classList.add("hidden");
  });
  document.querySelectorAll(".dropdown-trigger svg").forEach((a) => {
    a.style.transform = "rotate(0deg)";
  });
});
