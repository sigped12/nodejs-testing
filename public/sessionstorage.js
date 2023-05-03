const light_mode = 'light';
const dark_mode = 'dark';
const default_mode = light_mode;

const btn = document.querySelector('#theme-switch')

init();

function init() {
    let storedMode = sessionStorage.getItem('mode');
    if (!storedMode) {
        storedMode = default_mode;
        sessionStorage.setItem('mode', default_mode);
    }
    setMode(storedMode);
}

function setMode(mode = default_mode) {
    if (mode === dark_mode) {
        btn.textContent = dark_mode;
        document.body.classList.add(dark_mode);

    } else if (mode === light_mode) {
        btn.textContent = light_mode;
        document.body.classList.remove(dark_mode);
    }
}

btn.addEventListener('click', function () {
    let mode = sessionStorage.getItem('mode');
    if (mode) {
        let newMode = mode == dark_mode ? light_mode : dark_mode;
        setMode(newMode);
        sessionStorage.setItem('mode', newMode);
    }
});