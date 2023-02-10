import { LightningElement, api, track, wire } from "lwc";
import GetObjectData from "@salesforce/apex/GetObjectData.GetObjectData";
import GetFieldData from "@salesforce/apex/GetObjectData.GetFieldData";
import ResuableDynamicQuery from "@salesforce/apex/ResuableDynamicQuery.ResuableDynamicQuery";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

//ResuableDynamicQuery
export default class ProcessForm extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @track objectValue;
  @track accountselected = false;
  @track ObjectOptions;
  @track fieldOption;
  @track selectedField;
  @track selectedOptions = {};
  @track obbjOption = [];
  @api finalObject = {};
  @track selectedObject;
  @track selectedField;
  @track showField = false;

  connectedCallback() {
    // this.ObjectOptions=this.res
    GetObjectData().then((data) => {
      this.ObjectOptions = JSON.parse(data);
    });
  }

  handleObjectChange(event) {
    this.selectedObject = event.detail.value;
    console.log(this.selectedObject);
    this.showField = true;
    if (this.showField) {
      GetFieldData({ newObj: this.selectedObject }).then((data, error) => {
        if (data) {
          console.log(data);
          this.fieldOption = JSON.parse(data);
          console.log(data);
        } else {
          console.log(data);
        }
      });
    }
  }

  handleChange(event) {
    // Get the list of the "value" attribute on all the selected options
    this.selectedOptions = event.detail.value;
    console.log(this.selectedOptions);
  }

  createDataTable() {
    this.finalObject = JSON.stringify({
      objectName: this.selectedObject,
      fieldNames: this.selectedOptions,
    });
    var result = this.template.querySelector('lightning-combobox').reportValidity();
    var fieldNames= this.template.querySelector('lightning-dual-listbox').reportValidity();
    let payload = this.finalObject;

    const selectedEvent = new CustomEvent('eventfromform', { detail: this.finalObject });
    this.dispatchEvent(selectedEvent);

    if (
      this.selectedObject != undefined &&
      this.selectedOptions != undefined &&
      this.selectedOptions.length != 0 && result && fieldNames
    ) {
      fireEvent(this.pageRef, "NewEvent", this.finalObject);
    } else {
      const evt = new ShowToastEvent({
        title: "Please fill up required fields",
        message: "Please fill up required fields",
        variant: "error",
        mode: "dismissable",
      });
      this.dispatchEvent(evt);
    }
  }
}