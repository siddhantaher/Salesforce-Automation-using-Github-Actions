import { LightningElement, track } from 'lwc';

export default class TypeSearch extends LightningElement {

    @track searchParam ='';
    new;
    @track coutry = [{label:'USA',value:'US'},{label:'Nigeria',value:'NG'},{label:'India',value:'In'},{label:'Indus',value:'Ins'},{label:'USAsd',value:'USa'},{label:'Nigerias',value:'NGds'},{label:'Inddia',value:'Insd'},{label:'Inddus',value:'Inds'}];
    showResult = false;
    result = []
    @track showEdit = true
    showInput = true;

    handleInputChange(event){
        let countryArray = []
        console.log(event.target.value +'substring');
        const key = event.target.value;
        this.searchParam = event.target.value
        if(event.target.value){
            this.showResult = true;
            countryArray = this.coutry.filter(country => country.label.toLowerCase().includes(event.target.value));
            this.result= countryArray.map(country => country)
            console.log(this.result);
        }
        else{
            this.showResult = false;
        }

    }
    checkOption(event){
        this.Selected = true
        this.showInput = false
        console.log(event.target.value);
        // this.template.querySelector('listbox').value;
        console.log(this.template.querySelector('.listbox'));
        console.log(this.template.querySelector('.listbox').value);
        console.log( event.currentTarget.dataset.id);
        this.searchParam = event.currentTarget.dataset.id ;
        this.showResult = false;
        this.showEdit = false;

        console.log('in');

    }
    remove(){
        console.log('k');
        this.searchParam = '';
        this.Selected= false;
        this.showInput = true;
    }
}