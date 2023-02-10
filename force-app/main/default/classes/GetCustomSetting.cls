public with sharing class GetCustomSetting {

  @AuraEnabled
    public static List <extendedSelectionWrapper> getPaymentTerm() {
        List<Test2__c> allPaymentTermValue = Test2__c.getall().values();
        List<extendedSelectionWrapper> paymentList = new List<extendedSelectionWrapper>();

        for(Test2__c c :  allPaymentTermValue ){
            extendedSelectionWrapper jsapx = new extendedSelectionWrapper();

        jsapx.label = c.Integration_Value__c;          
        jsapx.value = c.Integration_Value__c;
        paymentList.add(jsapx);
        }
        System.debug(paymentList);
        return paymentList;
    }
}