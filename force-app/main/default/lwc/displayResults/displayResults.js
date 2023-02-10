import { LightningElement,api, track } from 'lwc';

export default class DisplayResults extends LightningElement {
    @api des;
    @api record;
    @api fieldname;
    @api iconname;
  
    handleSelect() {
      const selectedRecord = new CustomEvent("select", {
        detail: this.record.description
      });
      this.dispatchEvent(selectedRecord);
    }
}