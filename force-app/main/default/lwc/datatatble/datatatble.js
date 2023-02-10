import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
//import getAccounts from "@salesforce/apex/GetObjectData.getAccounts";
import ResuableDynamicQuery from "@salesforce/apex/ResuableDynamicQuery.ResuableDynamicQuery";
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';


export default class Datatatble extends NavigationMixin(LightningElement) {

@wire (CurrentPageReference) pageRef;
@track accountlist;
@api payload;
@track columns = [];
@track searchKey;
@track recId;
@track response;

navigateToViewRecordPage() {
this[NavigationMixin.Navigate]({
    type: 'standard__recordPage',
    attributes: {
        recordId: this.recId,
        objectApiName: 'Account',
        actionName: 'view'
    }
});
}

search(event){
    let searchResults = [];
    this.searchKey = event.target.value;
    this.accountlist = this.response;
    
    for(let i=0; i<this.accountlist.length;i++) {
        if(this.accountlist[i].Name.toLowerCase().includes(this.searchKey.toLowerCase())){
            console.log('This is the first substring instance ', this.accountlist[i]);
            searchResults.push(this.accountlist[i]);
            console.log('This is the search result array ', searchResults);
        }
        else{
            console.log('Nothing happened');
        }
    }
    this.accountlist = searchResults;
}


connectedCallback() {       

    /*eslint-disable no-console  */
    
    console.log('This is the payload from the container' , this.payload);
    //register the event from ProcessForm
    //registerListener('NewEvent', this.handleCallbackEvent, this);

    let headers = [];
    let inputString = '{"objectName":"Account","fieldNames":["name","type","billingstreet"]}';
    let JSONObject = JSON.parse(inputString);
    headers = JSONObject.fieldNames;
    console.log('This is the parsed fieldnames array: ', headers);

    ResuableDynamicQuery({inputQuery : inputString})
    .then(result => {            
    this.accountlist = result;
    this.response = result;
    console.log('This is the result : ' ,result);
    this.columns = headers;
    //this.columns = Object.keys(result[0]);
    //console.log('This is the accountlist: ' , JSON.stringify(this.accountlist));
})

}

disconnectedCallback() {
    unregisterAllListeners(this);
}

// handleCallbackEvent(details) {
//     alert('in the handleCallback' , details);
//     console.log('These passed field names are : ', details);
//     this.fieldnames = details;
//     console.log('this is the fieldnames in the handlecallback: ', this.fieldnames);

// }



navigateToRec(event) {
    alert('Value = ' + event.currentTarget.dataset.value);
    this.recId = event.currentTarget.dataset.value;
    //alert(this.recId)
    this.navigateToViewRecordPage();        
}
}