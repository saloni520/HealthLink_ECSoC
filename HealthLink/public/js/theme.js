(function () {
    const storageKey = "healthlink-theme";
    const root = document.documentElement;
    const savedTheme = localStorage.getItem(storageKey);
    const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";

    root.dataset.theme = initialTheme;

    function updateToggle(toggle) {
        const isDark = root.dataset.theme === "dark";
        toggle.setAttribute("aria-pressed", String(isDark));
        toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        toggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    }

    function setTheme(theme) {
        root.dataset.theme = theme;
        localStorage.setItem(storageKey, theme);
        document.querySelectorAll(".theme-toggle").forEach(updateToggle);
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".theme-toggle").forEach(function (toggle) {
            updateToggle(toggle);
            toggle.addEventListener("click", function () {
                setTheme(root.dataset.theme === "dark" ? "light" : "dark");
            });
        });
    });
})();
