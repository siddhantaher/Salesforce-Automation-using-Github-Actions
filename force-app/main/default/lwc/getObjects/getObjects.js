import { LightningElement,track,api } from 'lwc';
// import getRelatedListResult from '@salesforce/apex/Dynamic_DML.getRelatedListResult';
import getPaymentTerm from '@salesforce/apex/GetCustomSetting.getPaymentTerm';

export default class GetObjects extends LightningElement {

    @api firstName ='Salesforce Ohana!';
    @api cardTitle ='Welcome to Forceblogs.com';


    connectedCallback(){
        getRelatedListResult()
        console.log(this.firstName +' ' +this.cardTitle)
    }
}