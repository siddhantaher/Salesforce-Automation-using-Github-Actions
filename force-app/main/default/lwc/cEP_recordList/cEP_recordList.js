import { LightningElement, api } from "lwc";

export default class RecordList extends LightningElement {
  @api des;
  @api record;
  @api fieldname;
  @api iconname;

  handleSelect() {
    const selectedRecord = new CustomEvent("select", {
      detail: this.record
    });
    console.log(JSON.stringify(this.record));
    this.dispatchEvent(selectedRecord);
  }
}