public with sharing class extendedSelectionWrapper {

        @AuraEnabled public String label;
        @AuraEnabled public String value;
                    
        
        public  List<extendedSelectionWrapper> parse(String json) {
            return (List<extendedSelectionWrapper>) System.JSON.deserialize(json, List<extendedSelectionWrapper>.class);
        }
        
    
}