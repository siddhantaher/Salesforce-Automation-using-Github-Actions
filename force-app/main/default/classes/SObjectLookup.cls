public with sharing class SObjectLookup {

    @AuraEnabled(cacheable=true)
    public static List<sObject> search(String searchTerm, string myObject, String filter) {
        String myQuery = null;
        // set<String> countryName = new Set<string>();
        list<string> countryName = new list<string>();
        system.debug(filter);
        countryName.add(filter);
        system.debug(countryName);
        string country = 'country__c';
        if(filter != null && filter != ''){
            myQuery = 'Select Id, Country_Name__c from '+myObject+' Where Country_Name__c Like  \'%' + searchTerm +' LIMIT  5';
        }
        else {
            if(searchTerm == null || searchTerm == ''){
                myQuery = 'Select Id, Country_Name__c from '+myObject;
            }
            else {
                myQuery = 'Select Id, Country_Name__c from '+myObject+' Where Country_Name__c Like  \'%' + searchTerm + '%\' LIMIT  5';
            }
        }
        system.debug(myQuery);
        List<sObject> lookUpList = database.query(myQuery);
        return lookUpList;
    }
}