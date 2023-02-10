public with sharing class ReusableResourceController {
    // public ReusableResourceController() {

    // }
    
    @AuraEnabled
    public static Map<String, List<String>> getSObject(String searchKey) {

        system.Debug('XXXXXXXXXXX - In the apex method');
        string key = '%' + searchKey + '%';
        system.Debug(searchKey);

        List<String> objectNames = new List<String>();
        List<String> responseObjectList = new List<String>();
        List<EntityDefinition> sObjects =  [SELECT  QualifiedApiName 
                                            FROM EntityDefinition 
                                            WHERE EntityDefinition.QualifiedApiName 
                                            LIKE :key];
        For(EntityDefinition ed : sObjects){
            objectNames.add(ed.QualifiedApiName);
        }
        System.debug('List of sObjectNames' + objectNames);
        
        List<ObjectPermissions> objPerm = [ SELECT Id, SObjectType, PermissionsRead,PermissionsViewAllRecords, Parent.Id, Parent.Name, Parent.PermissionsModifyAllData
                                            FROM ObjectPermissions
                                            WHERE SObjectType in :objectNames AND PermissionsRead = True];
        
        System.debug('List of objPerm' + objPerm);
        /*
        for(ObjectPermissions ops : objPerm) {
            if(ops.PermissionsViewAllRecords  == true) {
                responseObjectList.add(ops.SobjectType);
            }
        }
		*/
        System.debug('List of sObjectList' + responseObjectList);
        
		//create the JSON response for the front end
        Map<String, List<String>> objMap = new Map<String, List<String>>();
        objMap.put('response', objectNames);
        system.Debug('Here is the sObjMap : ' + objMap);

        return objMap;

    }


}
        // Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        // system.Debug('Here is the gd : ' + gd);
        // Schema.SObjectType sObj = gd.get('account');
        // String objName = sObj.getDescribe().getLabel();
        // system.Debug('Here is the sObj : ' + objName);