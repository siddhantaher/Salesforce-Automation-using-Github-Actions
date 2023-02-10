import { LightningElement, api, track, wire } from 'lwc';

export default class ReusableContainer extends LightningElement {

    @track cmpVisibilty = false;
    @track Result=['Welcome','Menu', 'Order']
    getDatatable(event) {
        /*eslint-disable no-console */
        this.cmpVisibilty = true;
    }


}