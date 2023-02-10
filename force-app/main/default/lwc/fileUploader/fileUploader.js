import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import updateAccount from "@salesforce/apex/updateAccount.updateAccount";
import { deleteRecord } from "lightning/uiRecordApi";
const url = "/sfc/servlet.shepherd/document/download/";
import Src__c from "@salesforce/schema/account.Src__c";
import { NavigationMixin } from "lightning/navigation";

export default class FileUploader extends NavigationMixin(LightningElement) {
  @api
  recordId;

  @track files = [];
  @track isPreview;
  @track currentRecId;
  @track url;
  @track orderID
  @track showOrderLineItems=false
  get acceptedFilesFormat() {
    return [".jpg", ".jpeg", ".png"];
  }

  @track response = [
    { id: "1243", ordername: "order12", orderLineItems: ["1", "2", "3"] },
    { id: "1363", ordername: "order2", orderLineItems: ["1", "2", "3","4","5"] },
  ];

  connectedCallback(){
      console.log('inconnected')
      console.log(this.response)
  }

  getorderlineItem(event){
    this.orderID = event.target.name;
      console.log(event.target.name)
      console.log(event.target.value)
      this.showOrderLineItems=true

      for(var i=0;i<this.response.length;i++){
          if(this.orderID===this.response[i].id){
              console.log(this.response[i])
            this.showItems=this.response[i].orderLineItems
              console.log('GotSelectedOne' + this.response[i].orderLineItems)
          }
      }
  }
  closeModal() {
    this.showOrderLineItems = false
} 
saveMethod() {
  
    this.closeModal();
}

  //     handleFileUpload(event) {
  //         let uploadedFiles = event.detail.files;

  //         for (let index = 0; index < uploadedFiles.length; index++) { //for(let index in uploadedFiles) {
  //             if ({}.hasOwnProperty.call(uploadedFiles, index)) {
  //                 this.url=url + uploadedFiles[index].documentId
  //                 this.files = [...this.files, {
  //                     Id: uploadedFiles[index].documentId,
  //                     name: uploadedFiles[index].name,
  //                     src: url + uploadedFiles[index].documentId,
  //                     description: ''
  //                 }];
  //             }
  //         }

  //         console.log(" ==== ", JSON.stringify(this.files));
  //         this.dispatchEvent(
  //             new ShowToastEvent({
  //                 title: 'Succesful Uploads',
  //                 message: this.filesName + ' Files uploaded Successfully!',
  //                 variant: 'Success',
  //             }),
  //         );
  //         updateAccount({recordId:this.recordId,imagetext:this.url})

  //     }

  //     handleFilePreview(event) {
  //         let previewId = event.target.getAttribute('data-id');
  //         this.currentRecId = previewId;
  //         this.isPreview = true;
  //     }

  //     handleDelete(event) {
  //         deleteRecord(this.currentRecId)
  //             .then(() => {
  //                 for (let i = 0; i < this.files.length; i++) {
  //                     if (this.files[i].Id === this.currentRecId) {
  //                         this.files.splice(i, 1);
  //                     }
  //                 }

  //                 this.dispatchEvent(
  //                     new ShowToastEvent({
  //                         title: 'Success',
  //                         message: 'Record deleted',
  //                         variant: 'success'
  //                     })
  //                 );
  //                 this.isPreview = false;
  //             }).catch(error => {
  //                 this.dispatchEvent(
  //                     new ShowToastEvent({
  //                         title: 'Error deleting record',
  //                         message: error.body.message,
  //                         variant: 'error'
  //                     })
  //                 );
  //             });
  //     }

  //     handleSubmit(event) {
  //         event.preventDefault();

  //         this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);
  //         this.isPreview = false;

  //         this.dispatchEvent(new ShowToastEvent({
  //             title: 'Success!',
  //             message: ' file content updated.',
  //             variant: 'success'
  //         }), );
  //     }

  //     handleSuccess(event) {
  //         var description = event.detail.fields.Description;

  //         for (let i = 0; i < this.files.length; i++) {
  //             if (this.files[i].Id === this.currentRecId) {
  //                 this.files[i].Description = description.value;
  //             }
  //         }
  //     }
  //     handleChange(event) {
  //         // Display field-level errors and disable button if a name field is empty.
  //        if (!event.target.value) {
  //            event.target.reportValidity();
  //            this.disabled = true;
  //        }
  //        else {
  //            this.disabled = false;
  //        }
  //    }

  //    updateContact() {

  //            // Create the recordInput object
  //            const fields = {};
  //         //    fields[ID_FIELD.fieldApiName] = this.contactId;
  //         //    fields[FIRSTNAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='FirstName']").value;
  //         //    fields[LASTNAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='LastName']").value;
  //     fields[id]=this.recordId;
  //     fields[Src__c]=this.url

  //            const recordInput = { fields };

  //            updateRecord(recordInput)
  //                .then(() => {
  //                    this.dispatchEvent(
  //                        new ShowToastEvent({
  //                            title: 'Success',
  //                            message: 'Contact updated',
  //                            variant: 'success'
  //                        })
  //                    );
  //                    // Display fresponseh data in the form
  //                    return refresponsehApex(this.contact);
  //                })
  //                .catch(error => {
  //                    this.dispatchEvent(
  //                        new ShowToastEvent({
  //                            title: 'Error creating record',
  //                            message: error.body.message,
  //                            variant: 'error'
  //                        })
  //                    );
  //                });

  //             }
  //             navigateToRecordViewPage() {
  //                 // View a custom object record.
  //                 this[NavigationMixin.Navigate]({
  //                     type: 'standard__recordPage',
  //                     attributes: {
  //                         recordId: this.recordId,
  //                         actionName: 'view'
  //                     }
  //                 });
  //             }

}