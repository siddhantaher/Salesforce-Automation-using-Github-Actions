import { LightningElement , track, wire } from 'lwc';
import stateRegionMappingController from '@salesforce/apex/countryRegionMappingController.stateRegionMappingController'
export default class CountryRegionMapping extends LightningElement {
    
    selectedCountry;
    selectedState;
    filterCriteria;
    whereField;
    stateList = [];
    stateDisabled = true;


    connectedCallback(){

    }

    handleAccountSelection(event){
        console.log("the selected record id is"+event.detail);
        this.selectedCountry = event.detail
        console.log(this.selectedCountry);
        
        // console.log(event.detail);
        // if(this.selectedState){
           
        //     this.filterCriteria = this.selectedState.toString();
        // }
        // console.log(this.filterCriteria);
        stateRegionMappingController({countryId:this.selectedCountry}).then((data,error)=>{
            console.log(data);
            this.stateList = data;
            this.stateDisabled = false;
        })
        console.log(this.stateList);
       
        
    }

    handleStateSelection(event){
        console.log("the selected record id is"+event.detail);

    }
    clearAccount(event){
        this.selectedCountry = '';
        this.stateList = [];
        console.log(this.selectedCountry);
        this.stateDisabled = true;


    }

}