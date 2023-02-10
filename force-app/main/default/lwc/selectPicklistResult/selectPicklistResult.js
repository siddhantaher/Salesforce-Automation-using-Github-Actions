import {LightningElement, track, api} from 'lwc';

export default class SelectPicklistResult extends LightningElement {
    @api option;

    get showIsSelected() {
        return "slds-media slds-listbox__option_plain slds-media_small slds-listbox__option " + ((this.option.isSelected === true) ? ' slds-is-selected' : '');
    }

    selectHandler(event) {
        const selectOption = new CustomEvent('picklistselect', {detail : this.option});
        this.dispatchEvent(selectOption);
    }
}