import { LightningElement } from 'lwc';
import getPaymentTerm from '@salesforce/apex/GetCustomSetting.getPaymentTerm';

export default class TestComponent extends LightningElement {
    dummyValue = '12';
    hideText = false;
    payTerm = [];
    error = 'Value incorrect' ;

    connectedCallback(){
        getPaymentTerm().then((data,error)=>{
            console.log(data);
            this.payTerm = data;
        })
        for(var i = 0;i<this.payTerm.length;i++){
            console.log(this.payTerm[i].value);
            if(this.payTerm[i].value === this.dummyValue){
                console.log(this.payTerm[i].value);
                console.log(this.dummyValue);
                this.error = ''
            }
            else{
                this.error = 'Incorrect value'
            }
            console.log(this.error);
        }
        console.log(this.error);

    }

    showPaymentTerms(){
        console.log('show');
        console.log(this.error);
        this.hideText = true;
        
    }
    handleChange(){
        for(var i = 0;i<this.payTerm.length;i++){
            console.log(this.payTerm[i].value);
            if(this.payTerm[i].value === this.dummyValue){
                console.log(this.payTerm[i].value);
                console.log(this.dummyValue);
                this.error = ''
            }
            else{
                this.error = 'Value incorrect'
            }
            console.log(this.error);
        }
    }
}