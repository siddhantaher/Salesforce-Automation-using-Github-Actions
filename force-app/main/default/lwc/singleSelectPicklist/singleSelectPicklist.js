import {LightningElement, track, api} from 'lwc';
import {isObjectEmpty} from "c/commonUtils";

export default class SingleSelectPicklist extends LightningElement {
  @api picklistName;
  @api picklistPlaceholder;
  @api options;
  @api isDisabled=false;
  @api picklistRequired = false;
  @track displayOptions = [];
  @track selectedOption = {};
  @track isSelected = false;
  @track displaySelectedVal = "";
  @api value
  @track showValidationError = false;
  @track validationMessage = "";

  get showLabel() {
      return this.picklistName !== undefined;
  }

  @api
  get selectedValue() {
      return this.displaySelectedVal;
  }
  set selectedValue(value) {
      this.displaySelectedVal = value;
  }

  get options() {
      return this._allOptions;
  }
  set options(value) {
      if(value) {
          this._allOptions = value.map(x => Object.assign({}, x));
          this.displayOptions = value.map(x => Object.assign({}, x));
          let preSelectedOption = this.displayOptions.find(x => x.isSelected === true);
          if(preSelectedOption) {
              this.displaySelectedVal = preSelectedOption.label;
              this.selectedOption = preSelectedOption;
          }
      }
  }

  moveAwayHandler(event) {
      this.doElementToggle("searchResult", "slds-is-close", "slds-is-open");
  }

  dropDownSelectHandler(event) {
      this.doElementToggle("searchResult", "slds-is-open", "slds-is-close");
  }

  handlePicklistSelection(event) {
      this.doElementToggle("searchResult", "slds-is-close", "slds-is-open");
      this.selectedOption = {};
      let _option = event.detail;
      this.displayOptions.forEach(x => {
          x.isSelected = x.value === _option.value;
      });
      this.cleaValidationError();
      this.selectedOption = this.displayOptions.find(x => x.isSelected);
      this.displaySelectedVal = this.selectedOption.label;
      this.pushSelectedOptionsToParent();
  }

  doElementToggle(dataElement, add, remove) {
      const selectedItem = this.template.querySelector('[data-id="'+dataElement+'"]');
      if(selectedItem !== undefined) {
          selectedItem.classList.add(add);
          selectedItem.classList.remove(remove);
      }
  }

  pushSelectedOptionsToParent() {
      const bubbleSelectedOptions = new CustomEvent('bubbleselectedoptions', {detail : this.selectedOption});
      this.dispatchEvent(bubbleSelectedOptions);
  }

  @api clearSelected(event) {
      this.selectedOption = {};
      this._allOptions.forEach(x => x.isSelected = false);
      this.pushSelectedOptionsToParent();
      this.displayOptions = [];
      this.displaySelectedVal = "";
      this.displayOptions = this._allOptions.map(x => Object.assign({}, x));
  }

  @api
  validateSelectedPicklist(){
      if(isObjectEmpty(this.selectedOption) || this.selectedOption.value === ""){
          this.doElementToggle('inputSelectField','slds-has-error',undefined);
      } else {
          this.cleaValidationError();
      }
  }
  
  cleaValidationError() {
      this.doElementToggle('inputSelectField',undefined,'slds-has-error');
  }

  @api getSelectedValue() {
      return (!isObjectEmpty(this.selectedOption) ? this.selectedOption.value : "");
  }
}