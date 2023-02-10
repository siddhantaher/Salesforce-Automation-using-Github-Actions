import { LightningElement ,wire,track } from 'lwc';
import  getOpportunityRecords from "@salesforce/apex/getAccount.getOpportunityRecords"
const columns = [
    { label: 'Name', fieldName: 'Name'},

];

export default class NewDatableWithPrePopulateValue extends LightningElement {

    // connectedCallback(){
    //     console.log('in')
    //     getAccounts().then((data,error)=>{
    //         console.log(data)
    //     })
    // }

    result;
    columns = columns;
  preSelectedRows = ['0013h000008nYK8AAM'];

    @wire(getOpportunityRecords)
    getAcc({error,data}) {
        if(data)
        {
            this.result = data.oppList
            let myid = []
            // myid.push(this.result[0].Id);

            // setTimeout(
            //     () => this.preSelectedRows = this.result.map(record=>record.Id)
            // );
            // console.log(this.preSelectedRows)
            // this.preSelectedRows = myid
            console.log(this.preSelectedRows)
        }

    }
}