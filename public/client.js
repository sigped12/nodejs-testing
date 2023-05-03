if (localStorage.visits) {
    localStorage.visits = Number(localStorage.visits) + 1;
} else {
    localStorage.visits = 1;
}
let visit_text = document.querySelector('#visit-text')
visit_text.innerHTML = "This is your " + localStorage.visits + ". visit.";


// let reset_button = document.querySelector('#reset-button')
// reset_button.addEventListener("click", reset);
// function reset() {
//     localStorage.clear();
// }


// // List
// let list = document.querySelector("#list");
// let list_input = document.querySelector("#list-input");
// let list_button = document.querySelector("#list-button");
// list_button.addEventListener("click", leggTilFilm);
// let list_content = [];

// makeList();

// // Function to write out content
// function makeList() {
//   // Check for old content
//   if (localStorage.cList) {
//     let text = localStorage.cList;
//     list_content = text.split(":");
//   }

//   // Clear list
//   list.innerHTML = "";

//   for (let i = 0; i < list_content.length; i++) {
//     // Create <li> element
//     let li = document.createElement("li");
//     li.innerHTML = list_content[i];
//     list.appendChild(li);
//   }
// }

// // Function for adding to list
// function addToList() {
//   let newListAdd = list_input.value;
//   list_content.push(newListAdd);

//   // Update localStorage
//   let text = "";

//   for (let i = 0; i < list_content.length; i++) {
//     if (i == 0) {
//       text += list_content[i];
//     } else {
//       text += ":" + list_content[i];
//     }
//   }

//   localStorage.cList = text;

//   // Viser listen på nytt
//   makeList();
// }