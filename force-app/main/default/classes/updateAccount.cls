public  class updateAccount {
    @AuraEnabled
    public static string updateAccount(id recordId,string imagetext) {
        List<account> records = [
        SELECT Id FROM account WHERE id=:recordId];

        for (account record : records)
        {
            record.Src__c = imagetext;
        }
        update records;

        return recordId;
    }
}