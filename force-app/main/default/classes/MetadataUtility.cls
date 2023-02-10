public class MetadataUtility{
    public static string createField(string objectAPIName, string fieldAPIName, string fieldLabel, string fieldDescription) {
            HttpRequest request = new HttpRequest();
            request.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionID());
            request.setHeader('Content-Type', 'application/json');
            request.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm()+'/services/data/v41.0/tooling/sobjects/CustomField/');
            request.setMethod('POST');
            
            request.setBody('{"Metadata" : {"type" : "Formula","description" : "'+fieldDescription+'", "inlineHelpText" : "", "FullName" : "'+objectAPIName+'.'+fieldAPIName+'","Formula" : "IMAGE(test2__c, "Image", 100, 100)","label" : "'+'Test Formula'+'","Formula Return Type" : "Text"}');
            
            Http http = new Http();
            HTTPResponse res = http.send(request);
            return res.getBody();
    }
}