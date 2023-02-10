trigger CandidateInterviewTrigger on Candidate__c (after insert) {

    TestPOC.matchCandidatesWithInterviers(Trigger.New);

}