var phonePopupOpen = false;

/* Mobile (≤1024 px) → go straight to dialer; Desktop → popup */
function handleFabClick(e) {
  if (window.innerWidth <= 1024) {
    return true; /* allow tel: href to fire */
  }
  e.preventDefault();
  phonePopupOpen ? closePhonePopup() : openPhonePopup();
  return false;
}

function openPhonePopup() {
  phonePopupOpen = true;
  document.getElementById("phone-popup").classList.add("open");
  document
    .getElementById("phone-fab-btn")
    .setAttribute("aria-expanded", "true");
  document.getElementById("phone-fab-icon").className = "fa-solid fa-xmark";
}

function closePhonePopup() {
  phonePopupOpen = false;
  document.getElementById("phone-popup").classList.remove("open");
  document
    .getElementById("phone-fab-btn")
    .setAttribute("aria-expanded", "false");
  document.getElementById("phone-fab-icon").className = "fa-solid fa-phone";
}

/* Close popup on outside click (desktop) */
document.addEventListener("click", function (e) {
  var fab = document.getElementById("phone-fab");
  if (phonePopupOpen && fab && !fab.contains(e.target)) {
    closePhonePopup();
  }
});
