public with sharing class countryRegionMappingController {

    @AuraEnabled
    public static List <CountryRegionMappingWrapper> countryRegionMappingController(){
        string Id;
        List<CountryRegionMappingWrapper> countryRegionMappingList = new List<CountryRegionMappingWrapper>();

        try {

                List<sObject> countriesList= SObjectLookup.search('' ,'Country__c','');

                     for( sObject cR: countriesList){

                    CountryRegionMappingWrapper countryRegionMapping = new CountryRegionMappingWrapper();
                // countryRegionMapping.label = cR.id;    
                // countryRegionMapping.value = cR.Name;
                countryRegionMappingList.add(countryRegionMapping);
            }
            
            return countryRegionMappingList;


        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static List <CountryRegionMappingWrapper> stateRegionMappingController(string countryId){
        List<CountryRegionMappingWrapper> stateRegionMappingList = new List<CountryRegionMappingWrapper>();
        system.debug(countryId);
        try {
            for( State__c cR: [select id, name from State__c where Country__r.Name =: countryId]){
                    system.System.debug(cR);
                    CountryRegionMappingWrapper stateRegionMapping = new CountryRegionMappingWrapper();
                    stateRegionMapping.label = cR.name;  //        
                    stateRegionMapping.value = cR.name;
                    stateRegionMappingList.add(stateRegionMapping);
            }
            System.debug(stateRegionMappingList);
            return stateRegionMappingList;


        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}