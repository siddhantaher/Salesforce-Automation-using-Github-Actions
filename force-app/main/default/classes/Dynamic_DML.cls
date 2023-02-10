public class Dynamic_DML {
    
    public static void dynamicUpdate() {
        
        Account acc = [SELECT id, name FROM Account WHERE id = '0013h000007M5QmAAK'];
        
		modifyRec(acc,'Name', 'Dickenson plc');               
        
    }
    
    public static void modifyRec(sObject recToUpdate, String fieldToUpdate, String valueToPut) {
        recToUpdate.put(fieldToUpdate, valueToPut);
        update recToUpdate;
    }

    @AuraEnabled
    public static list<SObject> getRelatedListResult(string objectname, List<String>fieldNames){
    String query ='SELECT '+ fieldNames +' FROM ' + objectName;
        list<SObject> result=Database.query(query);
        return result;
    }
	

}