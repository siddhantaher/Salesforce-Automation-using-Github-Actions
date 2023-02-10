public with sharing class getAccount {
    
    @AuraEnabled(Cacheable=true)
    public static oppWrapper getOpportunityRecords(){
        oppWrapper ow = new oppWrapper();
        ow.oppList = [SELECT Id, Name From Account LIMIT 100];
        Set<Id> selectedOppIdSet = new Set<Id>();
        for(Account opp: ow.oppList){
            selectedOppIdSet.add(opp.Id);
        }
        ow.selectedIdSet = selectedOppIdSet;
        return ow;
    }
    public class oppWrapper{
        @AuraEnabled public List<Account> oppList {get; set;}
        @AuraEnabled public set<Id> selectedIdSet {get; set;}
    }
}