public class ResuableDynamicQuery {
    @AuraEnabled
    public static list<SObject> ResuableDynamicQuery(String inputQuery) {

        List<sobject> records;
        String message;
        System.debug('This is the input query : ' + inputQuery);
        String fieldName;

        //deserilizing the string into the res class
        ResuableDynamicQuery.res s =(ResuableDynamicQuery.res)JSON.deserialize(inputQuery,ResuableDynamicQuery.res.class);
        system.debug('These are the field names after deserialiazation : ' +  s.fieldNames);

        //creating a string to get the field names
        String aggFieldName = '';
        for(String fn : s.fieldNames) {
            aggFieldName = aggFieldName + fn + ',';
        }

        //removing the last ',' from the aggFieldName
        aggFieldName = aggFieldName.removeEnd(',');
        system.debug('Total field name string : ' + aggFieldName);

        //assigning the input object for the query
        String objectName=s.objectName;

        String query = 'SELECT' + ' ' + aggFieldName + ' ' + 'FROM ' + objectName;
        System.debug(query);
        records = Database.query(query);
        System.debug(records);
    return records;

    }

    public class res {
        public String objectName;
        public List<string> fieldNames;
        
    }

}