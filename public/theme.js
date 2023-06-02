var selectElement = document.getElementById("switch-options");
var activeSheet = document.getElementById("active-stylesheet");
var clearStorageButton = document.getElementById("clear-storage");

// Test to see if localStorage already has a value stored
if (localStorage.getItem("lastActiveSheet")) {
    activeSheet.setAttribute("href", localStorage.getItem("lastActiveSheet"));
}

// Assign the event listener to the select element
selectElement.addEventListener("change", switchStyle);

// Set the #active-stylesheet to be the light or dark stylesheet based on the selected option
function switchStyle() {
    var selectedOption = selectElement.options[selectElement.selectedIndex];
    var selectedSheet = selectedOption.getAttribute("data-stylesheet");
    activeSheet.setAttribute("href", selectedSheet);
    localStorage.setItem("lastActiveSheet", selectedSheet);
}

clearStorageButton.addEventListener("click", clearStorage);
function clearStorage() {
    localStorage.clear();
}

// Check if a theme is stored in the browser's local storage
const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
document.getElementById('switch-options').value = storedTheme;
}
    
// Change the theme and store it in local storage
document.getElementById('switch-options').addEventListener('change', function() {
    const selectedTheme = this.value;
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
});
    
// Apply the selected theme by adding/removing CSS classes or loading stylesheets
function applyTheme(theme) {
    // Implement the logic to apply the selected theme
    // For example, you can add or remove CSS classes on the document or load different stylesheets
    // Here's a simple example that adds/removes a 'dark-theme' class on the body element:
    if (theme === 'switch-options__dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}