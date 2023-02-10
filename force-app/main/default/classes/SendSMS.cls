/*
    Name  : SendSMS
    Developer Name : Parantap Srivastav
    Description : This is a POC class to send the sms to the interviewer using the Twilio number. 
*/

public class SendSMS {
    
    @future (callout=true)
    public static void sendSms(){
        
        //phone number you are sending your text to.
        String phNumber ='+13528718572';
        
        //this is the trial twilio account ID
        String accountSid = 'AC2f9f98939b25cdd4bc6d68fbf76a6f84';
        
        //this is the token for the twilio account
        String token = '1537346761021ed523be1dbb7b05282d';

        //phone number used to send the text from. This is the twilio number.
        String fromPhNumber = '+18307305848';
        
        //this is body of the sms. Will be changed to display the info of the candidate along with other info of the interview.
        String smsBody = 'Please respond to the text if you are available for your confirmation to the interview'; 
    
        HttpRequest req = new HttpRequest();   
        req.setEndpoint('https://api.twilio.com/2010-04-01/Accounts/'+accountSid+'/SMS/Messages.json');    
        req.setMethod('POST');    
        String VERSION  = '3.2.0';    
        req.setHeader('X-Twilio-Client', 'salesforce-' + VERSION);   
        req.setHeader('User-Agent', 'twilio-salesforce/' + VERSION);    
        req.setHeader('Accept', 'application/json');    
        req.setHeader('Accept-Charset', 'utf-8');    
        req.setHeader('Authorization','Basic '+EncodingUtil.base64Encode(Blob.valueOf(accountSid+':' +token)));   
        req.setBody('To='+EncodingUtil.urlEncode(phNumber,'UTF-8')+'&From='+EncodingUtil.urlEncode(fromPhNumber,'UTF-8')+'&Body='+smsBody);
    
        Http http = new Http();    
        HTTPResponse res = http.send(req);    
        System.debug(res.getBody());   
        if(res.getStatusCode()==201)
            System.Debug('Message sending Successful');
        else{        
           System.Debug('Message sending Unsuccessful');
    }
    
}

}