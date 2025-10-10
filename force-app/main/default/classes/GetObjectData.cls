public class GetObjectData {
    private List<String> accessibleFields;

    @AuraEnabled
    public Static string GetObjectData() {
        // Map<<schema.sObjectType>, List<string>> finalresult=new Map<schema.sObjectType, List<string>>();
        List<schema.sObjectType> allObjects = Schema.getGlobalDescribe().Values();
        //List<Map<String,String>> objectname =new List<Map<String,String>>();
       //Map<String, String> response = new Map<String, String>();

        List<JSON2Apex> jsonResponseList = new List<JSON2Apex>();

        for(Schema.SObjectType objTyp : Schema.getGlobalDescribe().Values()){
            
            if(objTyp.getDescribe().isAccessible()){
                //objectname.add(objTyp.getDescribe().getLabel());
                JSON2Apex jsapx = new JSON2Apex();
                jsapx.label = objTyp.getDescribe().getLabel();                
                jsapx.value = objTyp.getDescribe().getName();
                //response.put(objTyp.getDescribe().getLabel(), objTyp.getDescribe().getName());
                jsonResponseList.add(jsapx);
                
            }
        }
        //objectname.add(response);  
        System.Debug('response object : ' + JSON.serialize(jsonResponseList)
        ); 
       
        // finalresult.put(allObjects,objectname);
        return JSON.serializePretty(jsonResponseList);
    }


    @AuraEnabled
    public Static string  GetFieldData(string newObj) {


        Map<String, Schema.SObjectType> m = Schema.getGlobalDescribe() ;
        List<JSON2Apex> fieldResponseList = new List<JSON2Apex>();
        Schema.SObjectType s = m.get(newObj) ;
        
        Schema.DescribeSObjectResult r = s.getDescribe() ;
        
        Map<String,Schema.SObjectField> fields = r.fields.getMap();
        for (String d : fields.keySet()) {
            JSON2Apex jsapx = new JSON2Apex();

                system.debug(d);
            jsapx.label = d;          
            jsapx.value = d;
            fieldResponseList.add(jsapx);
                                }

        //  List<String>   accessibleFields = new List<String>();

        // string objectType = newObj.getSObjectType().getDescribe().getName();

        // List<schema.sObjectType> allObjects = Schema.getGlobalDescribe().Values();
        // Map<String, Schema.SobjectField> fields =
        //     newObj.getSObjectType().getDescribe().fields.getMap();
        //     for (String s : fields.keySet()) {
                
        //                     if ((s != 'Name') && (fields.get(s).getDescribe().isAccessible())) {
                
        //                         accessibleFields.add(s);
                
        //                     }
            

        //                 }
                

        return JSON.serializePretty(fieldResponseList);
        
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        List<Account> listOfAccounts = [SELECT Name, Id, Type
                                        FROM Account];

        System.debug('List of accounts' + listOfAccounts);                                        
                                        
        return listOfAccounts;                                     
    }


    public class JSON2Apex {
		
        public String label;
        public String value;
                    
        
        public  List<JSON2Apex> parse(String json) {
            return (List<JSON2Apex>) System.JSON.deserialize(json, List<JSON2Apex>.class);
        }
    }
    public static void updateAccounts(List<Account> accList) {
        for (Account acc : accList) {
            List<Contact> conList = [SELECT Id, Email FROM Contact WHERE AccountId = :acc.Id];
            for (Contact c : conList) {
                c.Email = acc.Name + '@example.com';
                update c; // ❌ DML inside loop
            }
        }
    }

    
    
}
