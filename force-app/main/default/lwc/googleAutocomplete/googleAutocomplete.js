import { LightningElement,track } from 'lwc';
import getSuggestions from '@salesforce/apex/AutoComplete.getSuggestions'
import getPlaceDetails from '@salesforce/apex/AutoComplete.getPlaceDetails'
export default class GoogleAutocomplete extends LightningElement {
    searchParam = ''
    selectedPlace = ''
    selectedRecord
    result =[]
    street;
    country;
    postalcode;
    postalCodeSuffix;
    route;
    city;
    state;
    stateCode;
    CountryCode;
    showAddressForm = false;
    getSugestion(event){

        this.searchParam = event.target.value;
        getSuggestions({input:this.searchParam}).then((data,error)=>{
           let c = JSON.parse(data);
            this.result = c.predictions;

            console.log(this.result);
            this.fullStreet = '';
            this.postalcode = '';
        this.postalCodeSuffix = '';
    this.route = '';
    this.city = '';
    this.state = '';
    this.stateCode = '';
    this.CountryCode = '';
    this.country = '';
        });

    }

    // getSugestion(event){
    //     this.selectedPlace = event.target.value;
    //     getPlaceDetails({placeId:this.selectedPlace}).then((data,error)=>{
    //         console.log(data);
    //     })
    // }
    handleSelect(event){
        const selectedRecordId = event.detail;
        console.log(selectedRecordId.place_id);
        getPlaceDetails({placeId:selectedRecordId.place_id}).then((data,error)=>{
            let c = JSON.parse(data)
            this.showAddressForm = true
            console.log(c);
                    this.placedetails= (c)
                    console.log(this.placedetails);
                    for(let i =0;i<this.placedetails.result.address_components.length;i++){
                        let fieldLabel = this.placedetails.result.address_components[i].types[0];
                        console.log(fieldLabel);
                        if(fieldLabel == "street_number"||"country"|| "postal_code"||"postal_code_suffix"||"rounte"||"administrative_area_level_1"||"locality"){
                            switch (fieldLabel){
                                case 'street_number':
                                    this.street = this.placedetails.result.address_components[i].long_name;

                                    console.log(this.street);
                                    break;
                                case 'country':
                                    this.country = this.placedetails.result.address_components[i].long_name;
                                    this.CountryCode = this.placedetails.result.address_components[i].short_name
                                    console.log(this.country);
                                    break;
                                case 'postal_code':
                                    this.postalcode = this.placedetails.result.address_components[i].long_name;
                                    break;
                                case 'postal_code_suffix':
                                    this.postalCodeSuffix = this.placedetails.result.address_components[i].long_name;
                                    break;
                                case 'route':
                                    this.route = this.placedetails.result.address_components[i].long_name;
                                    break;
                                case 'postal_code':
                                    this.postalcode = this.placedetails.result.address_components[i].long_name;
                                    break;
                                case 'locality':
                                    this.city = this.placedetails.result.address_components[i].long_name;
                                    break;
                                case 'administrative_area_level_1':
                                    this.state = this.placedetails.result.address_components[i].long_name;
                                    this.stateCode = this.placedetails.result.address_components[i].short_name

                              

                                    

                            }

                            this.fullStreet = this.street + ' ' + this.route
                        }
                      

                    }

                })
                this.result =[]
    }
    clearSearch(){
        console.log('in');
    }


}