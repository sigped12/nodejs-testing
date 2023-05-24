if (localStorage.visits) {
    localStorage.visits = Number(localStorage.visits) + 1;
} else {
    localStorage.visits = 1;
}
let visit_text = document.querySelector('#visit-text');
visit_text.innerHTML = "This is your " + localStorage.visits + ". visit.";