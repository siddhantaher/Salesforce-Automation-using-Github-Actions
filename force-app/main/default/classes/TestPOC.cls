public with sharing class TestPOC {

    public static void matchCandidatesWithInterviers(List<Candidate__c> newInsertedCandidateList) {
        Candidate__c candy = newInsertedCandidateList[0];

        //Candidate__c candy = [SELECT Name, Interview_Time__c, Applied_Position__c, Practice__c FROM Candidate__c WHERE Name = 'GoGo' LIMIT 1];

        List<Event> userEvents = [Select Description, StartDateTime, EndDateTime, ActivityDateTime, Location, IsAllDayEvent, OwnerId FROM Event WHERE OwnerId ='0053h000001dTtBAAU' ];

        User interviewer = [SELECT Name, Id FROM USER WHERE ID = '0053h000001dTtBAAU'];

        For(Event eve : userEvents){
            if(eve.StartDateTime == candy.Interview_Time__c){
                System.debug('XXXXXCandidate interview time' + candy.Interview_Time__c);
                System.debug('XXXXXevent time' + eve.StartDateTime);
                System.debug('There is a match with the interviewer');
                //sendEmail(eve, candy, interviewer);
                //SendSMS.sendSms();
                
            }
            else{
                System.debug('YYYYYevent time' + eve.StartDateTime);
                System.debug('YYYYYCandidate interview time' + candy.Interview_Time__c);
                System.debug('No match');
            }
        }
        
    }

    public static void sendEmail(Event eve, Candidate__c candidate, User interviewerUser) {

        //Creating an email for the Interviwer 
        Messaging.SingleEmailMessage[] mails = new Messaging.SingleEmailMessage[0];
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setSenderDisplayName('Slalom Recruiting');
        mail.setTargetObjectId(eve.OwnerId);            
        mail.setSubject('Interview Schedule Confirmation');
        mail.setSaveAsActivity(false);
        mail.setPlainTextBody('Dear ' + interviewerUser.Name + ',' + '\n' + 'You have been asked to interview ' + candidate.Name + ' for the position of ' + 
        candidate.Applied_Position__c + ' in the ' + candidate.Practice__c + ' practice.' + '\n' + 'Please respond to the email if you are available for the same.' + '\n' + 'https://svdashers-developer-edition.na111.force.com/');
        mails.add(mail);
        Messaging.sendEmail(mails);
        
    }
    
}