public with sharing class FilteredRelatedListCtrl {
    @AuraEnabled
    public static List<SObject> getRelated(String queryString) {
        return Database.query(queryString);
    }

    @AuraEnabled
    public static String getPluralLabelForObject(String objectName) {
        DescribeSObjectResult result = Schema.describeSObjects(new List<String>{objectName})[0];
        return result.getLabelPlural();
    }

    @AuraEnabled
    public static List<String> getLabelsForColumns(String objectName, List<String> columns) {
        List<String> labelsForColumns = new List<String>();
        String label;
        for (String column : columns) {
            label = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(column).getDescribe().getLabel();
            labelsForColumns.add(label);
        }
        return labelsForColumns;
    }

    @AuraEnabled
    public static List<String> getFieldTypesForColumns(String objectName, List<String> columns) {
        List<String> fieldTypesForColumns = new List<String>();
        String type;
        for (String column : columns) {
            type = String.valueOf(Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(column).getDescribe().getType());
            fieldTypesForColumns.add(type);
        }
        return fieldTypesForColumns;
    }
}