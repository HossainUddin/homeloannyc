(function () {
  const saved = localStorage.getItem("theme") || "green";
  document.documentElement.setAttribute("data-theme", saved);
})();

const themeSwitcher = document.getElementById("themeSwitcher");

// Load saved theme, default to green
const savedTheme = localStorage.getItem("theme") || "green";

document.documentElement.setAttribute("data-theme", savedTheme);

if (themeSwitcher) {
  themeSwitcher.value = savedTheme;
  themeSwitcher.addEventListener("change", function () {
    const theme = this.value;

    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    localStorage.setItem("theme", theme);
  });
}
