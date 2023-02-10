public class CountryRegionMappingWrapper {
    
        @AuraEnabled public String label;
        @AuraEnabled public String value;
                    
        
        public  List<CountryRegionMappingWrapper> parse(String json) {
            return (List<CountryRegionMappingWrapper>) System.JSON.deserialize(json, List<CountryRegionMappingWrapper>.class);
        }
    
}