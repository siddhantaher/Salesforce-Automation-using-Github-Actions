@RestResource(urlMapping='/receiveSMS/*')
global class receiveSMS {
    
    public string response{get;set;}
    public string InterviewerName{get;set;}
    public string selectedResponse{get;set;}
    public string responseOptions{get;set;}    

    @HttpGet
    global static void getSMS() {
		
       // Store the request received
       RestRequest req = RestContext.request;
       
       // Store the HTTP parameters received in a Map
       Map<String, String> smsParams = req.params ;

       System.Debug(RestContext.request); 
       //System.debug(req.requestbody.tostring());
 		
       String fromMobile ;
       String msgBody ;
       
       // Extract SMS Sender's phone number and store it in a variable
       if (smsParams.containsKey('From')){
           fromMobile = smsParams.get('From') ;
       }

       // Extract the body of SMS and store it in a variable
       if (smsParams.containsKey('Body')){
          msgBody = smsParams.get('Body') ;
       }
        
       //Account acc = new Account(Name = smsParams.get('From'));
       // insert acc;

        if(msgBody == 'Yes') {
            createEvent();
        }
        
       //Set the response values for Web Service
       RestContext.response.statusCode = 200;
       RestContext.response.addHeader('Content-Type', 'text/plain');
       RestContext.response.responseBody = Blob.valueOf('Thanks, We have received your response and will get back to you soon') ;
		
    }
    
    public void emailResponse(){
        System.Debug('This is the Name of the interviewer ' + InterviewerName);
        Account acc = new Account(Name = InterviewerName);
        insert acc;
        System.Debug('This is the email picklist resposne ' + selectedResponse);
        System.Debug('This is the email text resposne ' + response);
        if(selectedResponse == 'Yes') {
            createEvent();
        }
    }
    
    Public List<Selectoption> getresponseOptions(){
        List<Selectoption> listOfResponse = new List<selectoption>();
        listOfResponse.add(new selectOption('', '- None -'));
        listOfResponse.add(new selectOption('', 'YES'));
        listOfResponse.add(new selectOption('', 'NO'));
        return listOfResponse;
    }
    
    public static void createEvent() {
        DateTime dt = DateTime.newInstance(2020, 4, 10, 2, 00,00);
        Event eve = new Event(Subject='Meeting',Type='Meeting', Description='Interview Scheduling', OwnerId='0053h000001dTtBAAU', StartDateTime=dt, IsAllDayEvent=true);
        insert eve;

    }
         

}