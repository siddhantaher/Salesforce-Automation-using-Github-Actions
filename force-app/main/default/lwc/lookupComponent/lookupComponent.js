import { LightningElement, track, wire, api } from "lwc";  
 import findRecords from "@salesforce/apex/lookupController.findRecords";
export default class LookupComponent extends LightningElement {

    @track show = false;
f(){
    const selected = this.template.querySelector(".selected");
const optionsContainer = this.template.querySelector(".options-container");
const searchBox = this.template.querySelector(".search-box input");

const optionsList = this.template.querySelectorAll(".option");

selected.addEventListener("click", () => {
  optionsContainer.classList.toggle("active");

  searchBox.value = "";
  filterList("");

  if (optionsContainer.classList.contains("active")) {
    searchBox.focus();
  }
});

optionsList.forEach(o => {
  o.addEventListener("click", () => {
    selected.innerHTML = o.querySelector("label").innerHTML;
    optionsContainer.classList.remove("active");
  });
});

searchBox.addEventListener("keyup", function(e) {
  filterList(e.target.value);
});

const filterList = searchTerm => {
  searchTerm = searchTerm.toLowerCase();
  optionsList.forEach(option => {
    let label = option.firstElementChild.nextElementSibling.innerText.toLowerCase();
    if (label.indexOf(searchTerm) != -1) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });
};
}
cl(event){
    console.log(event);
    this.show = true
}
}