import { api, LightningElement, track, wire } from 'lwc';
import search from '@salesforce/apex/SObjectLookup.search';

export default class CustomLookUp extends LightningElement {
    @api objName;
    @api iconName;
    @api filter = '';
    @api searchPlaceholder='Search';

    @track selectedName;
    @track records;
    @track isValueSelected;
    @track blurTimeout;

    searchTerm;
    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';

    @wire(search, {searchTerm : '$searchTerm', myObject : '$objName', filter : '$filter'})
    wiredRecords({ error, data }) {
        if (data) {
            this.error = undefined;
            this.records = data;
            console.log(data);
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }


    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
       
        const valueSelectedEvent = new CustomEvent('lookupselected', {detail:  selectedName });
        this.dispatchEvent(valueSelectedEvent);
        this.isValueSelected = true;
        this.selectedName = selectedName;
        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        this.isValueSelected = false;
        const valueSelectedEvent = new CustomEvent('lookupremoved');
        this.dispatchEvent(valueSelectedEvent);

    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }
    
   onAccountSelection(event){  
    this.accountName = event.detail.selectedValue;  
    this.accountRecordId = event.detail.selectedRecordId;  
    }  
}