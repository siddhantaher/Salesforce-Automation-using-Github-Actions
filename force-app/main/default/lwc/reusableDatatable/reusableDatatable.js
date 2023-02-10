import { LightningElement, track, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
//import getAccounts from "@salesforce/apex/GetObjectData.getAccounts";
// import ResuableDynamicQuery from "@salesforce/apex/ResuableDynamicQuery.ResuableDynamicQuery";
// import { registerListener, unregisterAllListeners } from "c/pubsub";
// import { CurrentPageReference } from "lightning/navigation";
// import {ShowToastEvent} from 'lightning/platformShowToastEvent';
// import updateAccount from "@salesforce/apex/updateAccount.updateAccount";
// import { deleteRecord } from 'lightning/uiRecordApi';
// const url = '/sfc/servlet.shepherd/document/download/';
// import Src__c from '@salesforce/schema/account.Src__c';

export default class ReusableDatatable extends NavigationMixin(
  LightningElement
) {
  @api opptyRecordId;
  timeoutId;
  messageToUser = '';

  @track isLoading = true;
  @track agreementBundleNote = '';
  @track agreementBundleMismatch = '';
  @track opptyErrorMessage = '';
  @track spinnerclass = 'spinner initialSpinnerBox';
  currentOrgBaseURL;
  @track opptyRecord;
  @track opptyURL;
  @track accountURL;
  @track oliData = [];
  @track draftValues = [];
  totalQuoteLinePrice = 0;
  totalOLIsAmount = 0;
  totalOmModifiedAmount = 0;
  oneTimeDiscount = 0;
  oneTimeDiscountAvailable = false;
  rejectedReason = []
  selectedRejectedReason;
  paymentTerms = [];
  hidePaymentTerm = true;
  paymentError;
  countriesList = [];
  hideOMCountry = false;
  paymentFlag = true;
  stateList = [];
  invalidStateError;

  oliColumns = [
      { label: 'SKU', fieldName: 'ProductCode', initialWidth:160, editable: false,
              cellAttributes: { alignment: 'left' },
              wrapText: true,
          },
      { label: 'Base Product Code', fieldName: 'Base_Product_Code__c', initialWidth:160, editable: false,
          cellAttributes: { alignment: 'left' },
          wrapText: true,
      },
      { label: 'Quantity', fieldName: 'Quantity', type: 'number', initialWidth:120, editable: false,
              cellAttributes: { alignment: 'center' },
              wrapText: true,
          },
      { label: 'Regular Unit Price', fieldName: 'Unit_List_Price__c', type: 'currency', initialWidth:160, editable: false,
              cellAttributes: { alignment: 'right' },
              typeAttributes: { currencyCode: { fieldName: 'CurrencyIsoCode' }},
              wrapText: true,
          },
      { label: 'Quote Line Price', fieldName: 'QL_Net_Total_in_Proposal', type: 'currency', initialWidth:160, editable: false,
              cellAttributes: { alignment: 'right' },
              typeAttributes: { currencyCode: { fieldName: 'CurrencyIsoCode' }},
              wrapText: true,
          },
      { label: 'Amount (TCV Allocated)', fieldName: 'TotalPrice', type: 'currency', initialWidth:160, editable: false,
              cellAttributes: { alignment: 'right' },
              typeAttributes: { currencyCode: { fieldName: 'CurrencyIsoCode' },
                              },
              wrapText: true,
          },
      { label: 'OM Modified Amount (TCV Allocated)', fieldName: 'OM_Modified_Amount_TCV_Allocated__c', type: 'currency',
          initialWidth:160, editable: true,
          cellAttributes: { alignment: 'right' },
          typeAttributes: { currencyCode: { fieldName: 'CurrencyIsoCode' },
                              maximumFractionDigits: '2'
                          },
          wrapText: true,
      },
      { label: 'Start Date', fieldName: 'LT_Start_Date__c', type: 'date', initialWidth:120, editable: false,
              type: "date-local", typeAttributes:{ month: "2-digit", day: "2-digit" },
              cellAttributes: { alignment: 'left' },
              wrapText: true,
          },
      { label: 'End Date', fieldName: 'LT_End_Date__c', type: 'date', initialWidth:140, editable: false,
              type: "date-local", typeAttributes:{ month: "2-digit", day: "2-digit" },
              cellAttributes: { alignment: 'left' },
              wrapText: true,
          },
      { label: 'Term (Months)', fieldName: 'Term_Months__c', type: 'text', initialWidth:140, editable: false,
              cellAttributes: { alignment: 'center' },
              wrapText: true,
          },
      { label: 'Start On Delivery', fieldName: 'LT_Start_on_Delivery__c', type: 'boolean', editable: false,
              initialWidth:140, 
              cellAttributes: { alignment: 'center' },
              wrapText: true,
          },
      { label: 'Prepaid', fieldName: 'Prepaid__c', type: 'boolean', initialWidth:100, editable: true,
              cellAttributes: { alignment: 'center' },
              wrapText: true,
          },
      { label: 'Conf Year', fieldName: 'Conf_Year__c', type: 'text', initialWidth:120, editable: false,
              cellAttributes: { alignment: 'center' },
              wrapText: true,
          },
  ];

  connectedCallback() {
      // this.start();
      this.startL();
  }

  // From Orgs
  start() {
      getRejectedPicklistValues({objectName:'opportunity',fieldName:'Opportunity_Rejection_Reason__c'})
      .then((data,error)=>{
          this.rejectedReason = data;
      })
      getPaymentTerms().then((data,error)=>{
          console.log(data);
          this.paymentTerms = data
      })


      this.currentOrgBaseURL = window.location.origin;
      this.isLoading = true;
      getOpportunityAndRelatedDetails({ opportunityId: this.opptyRecordId })
      .then((result) => {
          if (result) {
              console.log('Data Received before: ', result);
              var resultJson = JSON.parse(result);
              this.updateNodes(resultJson);
              this.validateApprovalStatus();
              if (!this.opptyErrorMessage) {
                  this.pushDefaultApContactsToOCRs(resultJson);
                  this.orderOCRs();
                  if (!this.opptyErrorMessage) {
                      this.calculateOpptyPaymentAmountTotal();
                      this.setAgreementBundleFlag();
                      this.updateOmContactDetailsIfAllEmpty();
                      this.setOneTimeDiscountValue();
                      this.oliDataUpdates();
                      this.opptyURL = this.currentOrgBaseURL + '/' + this.opptyRecord.Id;
                      this.accountURL = this.currentOrgBaseURL + '/' + this.opptyRecord.Account.Id;
                      this.oliData = this.opptyRecord.OpportunityLineItems;
                      console.log('Data Received: ', JSON.parse(JSON.stringify(this.opptyRecord)));
                      for(var i = 0;i<this.paymentTerms.length;i++){
                          if(this.paymentTerms[i].value === this.opptyRecord.Payment_Term__c || !this.opptyRecord.Payment_Term__c ) {
                              this.paymentError = ''
                          }
                          else{
                              this.paymentError = 'Invalid payment terms value'
                          }
                      }
                      for(var i = 0;i<this.opptyRecord.OpportunityContactRoles.length;i++){
                          if(this.stat[i].value === this.opptyRecord.OM_Contact_Country__c || !this.opptyRecord.Payment_Term__c ) {
                              this.paymentError = ''
                          }
                          else{
                              this.paymentError = 'Invalid payment terms value'
                          }
                      }
                     
                  }
              }
          } else {
              this.opptyErrorMessage = 'Opportunity Information not found.';
          }
          this.isLoading = false;
          this.spinnerclass = 'spinner';  // setting back spinner to normal height

      }).catch((error) => {
          this.isLoading = false;
          console.log(JSON.stringify(error));
      });
      
  }

  startL() {
      // getPicklistValuesByObject({ObjectApi_name:'oppurtunity',Field_name:'Opportunity_Rejection_Reason__c'}).then((data,error)=>{
      //     console.log(data);
          
      // })  
      this.rejectedValues = [{"value":"All Agreements","label":"All Agreements"},{"value":"Distributor/VAR/EU Discrepancy","label":"Distributor/VAR/EU Discrepancy"},{"value":"Credit Card","label":"Credit Card"},{"value":"Customer Relationship/Acquisition/Merge","label":"Customer Relationship/Acquisition/Merge"}];
      this.paymentTerms = [{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"},{"value":"Net 30","label":"Net 30"}];
      this.currentOrgBaseURL = window.location.origin;
      var result = '{"opportunityRecord":{"attributes":{"type":"Opportunity","url":"/services/data/v50.0/sobjects/Opportunity/0066s000002YyiJAAS"},"Id":"0066s000002YyiJAAS","AccountId":"00140000018Tfg3AAC","Amount":75999.999993999998,"Approval_Status__c":"Approved","Block_Auto_Invoicing_in_SAP__c":true,"Block_for_Processing__c":true,"CurrencyIsoCode":"USD","Name":"Test Oppty for OM DryRun-1","Non_Standard__c":true,"OM_all_line_items_bundled__c":true,"OM_Notes__c":"test value om notes Om11061","Operating_Entity__c":"Splunk Inc.","PO_Amount__c":76000.00,"PO_Number__c":"12345","Payment_Term__c":"Net om11061","Payment_Type__c":"Credit Card","Sales_Type__c":"Expansion","StageName":"Business Qualification","ST_Payment1_Amount__c":1225.00,"ST_Payment2_Amount__c":1225.00,"ST_Payment3_Amount__c":1225.00,"Payment_4_Amount__c":1000.00,"Apttus__R00N50000001Xl0FEAS__r":{"totalSize":1,"done":true,"records":[{"attributes":{"type":"Apttus__APTS_Agreement__c","url":"/services/data/v50.0/sobjects/Apttus__APTS_Agreement__c/a260b000000QnQtAAK"},"Apttus__Related_Opportunity__c":"0066s000002YyiJAAS","Id":"a260b000000QnQtAAK","All_line_items_bundled__c":false,"RecordTypeId":"012400000005ZyOAAU"}]},"OpportunityContactRoles":{"totalSize":8,"done":true,"records":[{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w5jxEAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w5jxEAA","Role":"OM Bill To","ContactId":"0030b00001yQEe0AAG","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0030b00001yQEe0AAG"},"Id":"0030b00001yQEe0AAG","AccountId":"00140000018Tfg3AAC","FirstName":"Nitin","LastName":"Bhatia","Name":"Nitin Bhatia","Email":"nitin.bhatia@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"San Francisco","country":"United Stats","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"94105","state":"CA","street":"560 Mission Street"},"MailingStreet":"560 Mission Street","MailingCity":"San Francisco","MailingState":"CA","MailingPostalCode":"94105","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"Nitin","OM_Contact_Last_Name__c":"Bhatia","OM_Contact_Street__c":"560 Mission Street Om11061","OM_Contact_City__c":"San Francisco","OM_Contact_State__c":"CA","OM_Contact_Zip__c":"94105","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w6EUEAY"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w6EUEAY","Role":"Additional AP Contact","ContactId":"0030b000022KSrIAAW","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0030b000022KSrIAAW"},"Id":"0030b000022KSrIAAW","AccountId":"00140000018Tfg3AAC","FirstName":"Emma","LastName":"Draper","Name":"Emma Draper","Email":"emma.draper@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"San Francisco","country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"75201","state":"TX","street":"560 Mission St"},"MailingStreet":"560 Mission St","MailingCity":"San Francisco","MailingState":"TX","MailingPostalCode":"75201","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"Emma","OM_Contact_Last_Name__c":"Draper","OM_Contact_Street__c":"560 Mission St Om11061","OM_Contact_City__c":"San Francisco","OM_Contact_State__c":"TX","OM_Contact_Zip__c":"75201","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w5jyEAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w5jyEAA","Role":"OM Ship To","ContactId":"0030b000026KZe0AAG","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0030b000026KZe0AAG"},"Id":"0030b000026KZe0AAG","AccountId":"00140000018Tfg3AAC","FirstName":"Jonathan","LastName":"Blackman","Name":"Jonathan Blackman","Email":"jon.blackman@zimperium.com.sfdev.sfdev","MailingAddress":{"city":null,"country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"07869","state":"NJ","street":null},"MailingState":"NJ","MailingPostalCode":"07869","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"Jonathan","OM_Contact_Last_Name__c":"Blackman","OM_Contact_Street__c":"4055 Valley View Lane Om11061","OM_Contact_City__c":"Newark","OM_Contact_State__c":"NJ","OM_Contact_Zip__c":"07869","OM_Contact_Country__c":"United State","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w5kkEAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w5kkEAA","Role":"Additional AP Contact","ContactId":"0030b00002Jk3poAAB","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0030b00002Jk3poAAB"},"Id":"0030b00002Jk3poAAB","AccountId":"00140000018Tfg3AAC","FirstName":"James","LastName":"Lucas","Name":"James Lucas","Email":"james.lucas@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"San Francisco","country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"94105","state":"CA","street":"560 Mission Street"},"MailingStreet":"560 Mission Street","MailingCity":"San Francisco","MailingState":"CA","MailingPostalCode":"94105","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"James","OM_Contact_Last_Name__c":"Lucas","OM_Contact_Street__c":"560 Mission Street Om11061","OM_Contact_City__c":"San Francisco","OM_Contact_State__c":"CA","OM_Contact_Zip__c":"94105","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w5jzEAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w5jzEAA","Role":"Sold To","ContactId":"0030b00002M5azEAAR","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0030b00002M5azEAAR"},"Id":"0030b00002M5azEAAR","AccountId":"00140000018Tfg3AAC","FirstName":"Jerome","LastName":"Brock","Name":"Jerome Brock","Email":"jerome.brock@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"Dallas","country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"75244","state":"TX","street":"4055 Valley View Lane"},"MailingStreet":"4055 Valley View Lane","MailingCity":"Dallas","MailingState":"TX","MailingPostalCode":"75244","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"Jerome","OM_Contact_Last_Name__c":"Brock","OM_Contact_Street__c":"4055 Valley View Lane Om1219","OM_Contact_City__c":"Dallas","OM_Contact_State__c":"TX","OM_Contact_Zip__c":"75244","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w5jwEAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w5jwEAA","Role":"Bill To","ContactId":"0030b00002TTlR1AAL","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0030b00002TTlR1AAL"},"Id":"0030b00002TTlR1AAL","AccountId":"00140000018Tfg3AAC","FirstName":"Sumit","LastName":"Arora","Name":"Sumit Arora","Email":"sumit@zimperium.com.sfdev.sfdev","MailingAddress":null,"OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"Sumit","OM_Contact_Last_Name__c":"Arora","OM_Contact_Street__c":"560 Mission Street Om1","OM_Contact_City__c":"sfo OM1","OM_Contact_State__c":"CA","OM_Contact_Zip__c":"94105","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000w6EeEAI"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000w6EeEAI","Role":"OM Sold To","ContactId":"0033300001tNs2iAAC","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0033300001tNs2iAAC"},"Id":"0033300001tNs2iAAC","AccountId":"00140000018Tfg3AAC","FirstName":"Garret","LastName":"Felker","Name":"Garret Felker","Email":"garret.felker@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"San Francisco","country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"75201","state":"TX","street":"101 Mission St"},"MailingStreet":"101 Mission St","MailingCity":"San Francisco","MailingState":"TX","MailingPostalCode":"75201","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US","OM_Contact_First_Name__c":"Garret","OM_Contact_Last_Name__c":"Felker","OM_Contact_Street__c":"101 Mission St Om11061","OM_Contact_City__c":"San Francisco","OM_Contact_State__c":"TX","OM_Contact_Zip__c":"75201","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}},{"attributes":{"type":"OpportunityContactRole","url":"/services/data/v50.0/sobjects/OpportunityContactRole/00K6s000000vxkjEAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00K6s000000vxkjEAA","Role":"Ship To","ContactId":"0034000000zdNplAAE","Contact":{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0034000000zdNplAAE"},"Id":"0034000000zdNplAAE","AccountId":"0014000000KBzLZAA1","FirstName":"Brandon","LastName":"Newton","Name":"Brandon Newton","Email":"brandon.newton@mandiant.com.sfdev","MailingAddress":{"city":null,"country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"22314","state":"VA","street":null},"MailingState":"VA","MailingPostalCode":"22314","MailingCountry":"United States","OM_Contact_Account_Name__c":"testAcc1234 addap15","OM_Contact_First_Name__c":"testfname OM151","OM_Contact_Last_Name__c":"testlname OM151","OM_Contact_Street__c":"teststreet OM1154","OM_Contact_City__c":"testCity","OM_Contact_State__c":"VA","OM_Contact_Zip__c":"22314","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/0014000000KBzLZAA1"},"Id":"0014000000KBzLZAA1","Name":"Mandiant Corporation"}}}]},"OpportunityLineItems":{"totalSize":4,"done":true,"records":[{"attributes":{"type":"OpportunityLineItem","url":"/services/data/v50.0/sobjects/OpportunityLineItem/00k6s000002xyo1AAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00k6s000002xyo1AAA","CurrencyIsoCode":"USD","LT_Start_Date__c":"2020-10-11","LT_End_Date__c":"2021-10-10","LT_Start_on_Delivery__c":true,"Name":"Test Oppty for OM DryRun-1 Splunk Enterprise Security - Term License with Standard Success Plan - GB/day","OM_Modified_Amount_TCV_Allocated__c":13333.44,"Prepaid__c":true,"ProductCode":"ES-T-LIC-ST","Quantity":50.00,"SBQQ__QuoteLine__c":"aPG6s00000000lfGAA","Term_Months__c":"12","TotalPrice":13333.333333333335,"Unit_List_Price__c":320.00,"SBQQ__QuoteLine__r":{"attributes":{"type":"SBQQ__QuoteLine__c","url":"/services/data/v50.0/sobjects/SBQQ__QuoteLine__c/aPG6s00000000lfGAA"},"Net_Total_in_Proposal__c":16000.00,"Id":"aPG6s00000000lfGAA"}},{"attributes":{"type":"OpportunityLineItem","url":"/services/data/v50.0/sobjects/OpportunityLineItem/00k6s000002xyo2AAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00k6s000002xyo2AAA","Base_Product_Code__c":"ES-T-LIC-ST","CurrencyIsoCode":"USD","LT_Start_Date__c":"2020-10-11","LT_End_Date__c":"2021-10-10","LT_Start_on_Delivery__c":true,"Name":"Test Oppty for OM DryRun-1 Splunk Enterprise Security - Standard Support","OM_Modified_Amount_TCV_Allocated__c":2660.44,"Prepaid__c":true,"ProductCode":"ES-T-ST","Quantity":1.00,"SBQQ__QuoteLine__c":"aPG6s00000000lgGAA","TotalPrice":2666.666666666667,"Unit_List_Price__c":0.00,"SBQQ__QuoteLine__r":{"attributes":{"type":"SBQQ__QuoteLine__c","url":"/services/data/v50.0/sobjects/SBQQ__QuoteLine__c/aPG6s00000000lgGAA"},"Net_Total_in_Proposal__c":0.00,"Id":"aPG6s00000000lgGAA"}},{"attributes":{"type":"OpportunityLineItem","url":"/services/data/v50.0/sobjects/OpportunityLineItem/00k6s000002xynzAAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00k6s000002xynzAAA","CurrencyIsoCode":"USD","LT_Start_Date__c":"2020-10-11","LT_End_Date__c":"2021-10-10","LT_Start_on_Delivery__c":true,"Name":"Test Oppty for OM DryRun-1 Splunk Enterprise - Term License with Standard Success Plan - GB/day","OM_Modified_Amount_TCV_Allocated__c":50044.00,"Prepaid__c":true,"ProductCode":"SE-T-LIC-ST","Quantity":100.00,"SBQQ__QuoteLine__c":"aPG6s00000000ldGAA","Term_Months__c":"12","TotalPrice":49999.999994999996,"Unit_List_Price__c":600.00,"SBQQ__QuoteLine__r":{"attributes":{"type":"SBQQ__QuoteLine__c","url":"/services/data/v50.0/sobjects/SBQQ__QuoteLine__c/aPG6s00000000ldGAA"},"Net_Total_in_Proposal__c":60000.00,"Id":"aPG6s00000000ldGAA"}},{"attributes":{"type":"OpportunityLineItem","url":"/services/data/v50.0/sobjects/OpportunityLineItem/00k6s000002xyo0AAA"},"OpportunityId":"0066s000002YyiJAAS","Id":"00k6s000002xyo0AAA","Base_Product_Code__c":"SE-T-LIC-ST","CurrencyIsoCode":"USD","LT_Start_Date__c":"2020-10-11","LT_End_Date__c":"2021-10-10","LT_Start_on_Delivery__c":true,"Name":"Test Oppty for OM DryRun-1 Splunk Enterprise - Standard Support","OM_Modified_Amount_TCV_Allocated__c":10000.44,"Prepaid__c":true,"ProductCode":"SE-T-ST","Quantity":1.00,"SBQQ__QuoteLine__c":"aPG6s00000000leGAA","TotalPrice":9999.999999,"Unit_List_Price__c":0.00,"SBQQ__QuoteLine__r":{"attributes":{"type":"SBQQ__QuoteLine__c","url":"/services/data/v50.0/sobjects/SBQQ__QuoteLine__c/aPG6s00000000leGAA"},"Net_Total_in_Proposal__c":0.00,"Id":"aPG6s00000000leGAA"}}]},"Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}},"defaultApContacts":[{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0034000001S8SchAAF"},"Id":"0034000001S8SchAAF","AccountId":"00140000018Tfg3AAC","FirstName":"Lee","LastName":"Martinez","Name":"Lee Martinez","Email":"lee@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"San Francisco","country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"94105","state":"CA","street":"560 Mission Street"},"MailingStreet":"560 Mission Street","MailingCity":"San Francisco","MailingState":"CA","MailingPostalCode":"94105","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US OM15","OM_Contact_First_Name__c":"Lee OM151","OM_Contact_Last_Name__c":"Martinez OM151","OM_Contact_Street__c":"560 Mission Street Om11061","OM_Contact_City__c":"San Francisco","OM_Contact_State__c":"CA","OM_Contact_Zip__c":"94105","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}},{"attributes":{"type":"Contact","url":"/services/data/v50.0/sobjects/Contact/0034000001KvYrIAAV"},"Id":"0034000001KvYrIAAV","AccountId":"00140000018Tfg3AAC","FirstName":"Oren","LastName":"Noy","Name":"Oren Noy","Email":"o@zimperium.com.sfdev.sfdev","MailingAddress":{"city":"San Francisco","country":"United States","geocodeAccuracy":null,"latitude":null,"longitude":null,"postalCode":"94105","state":"CA","street":"560 Mission Street"},"MailingStreet":"560 Mission Street","MailingCity":"San Francisco","MailingState":"CA","MailingPostalCode":"94105","MailingCountry":"United States","OM_Contact_Account_Name__c":"Zimperium - US OM15","OM_Contact_First_Name__c":"Oren OM15","OM_Contact_Last_Name__c":"Noy OM15","OM_Contact_Street__c":"560 Mission Street Om11061","OM_Contact_City__c":"San Francisco","OM_Contact_State__c":"CA","OM_Contact_Zip__c":"94105","OM_Contact_Country__c":"United States","Account":{"attributes":{"type":"Account","url":"/services/data/v50.0/sobjects/Account/00140000018Tfg3AAC"},"Id":"00140000018Tfg3AAC","Name":"Zimperium - US"}}]}';
      this.countriesList = [{"value":"United States","label":"United States"},{"value":"France","label":"France"}];
      this.stateList = [{"value":"CA","label":"California"},{"value":"TX","label":"Texas"}];

      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
          if (result) {

              var resultJson = JSON.parse(result);
              this.updateNodes(resultJson);
              this.pushDefaultApContactsToOCRs(resultJson);

              this.validateApprovalStatus();
              if (!this.opptyErrorMessage) {
                  this.orderOCRs();
                  if (!this.opptyErrorMessage) {
                      this.calculateOpptyPaymentAmountTotal();
                      this.setAgreementBundleFlag();
                      this.updateOmContactDetailsIfAllEmpty();
                      this.oliDataUpdates();
                      this.opptyURL = this.currentOrgBaseURL + '/' + this.opptyRecord.Id;
                      this.accountURL = this.currentOrgBaseURL + '/' + this.opptyRecord.Account.Id;
                      this.oliData = this.opptyRecord.OpportunityLineItems;
                      console.log(this.opptyRecord.Payment_Term__c);
                      for(var i = 0;i<this.paymentTerms.length;i++){
                          if(this.paymentTerms[i].value === this.opptyRecord.Payment_Term__c){
                              this.paymentError = ''
                          }
                          else{
                              this.paymentError = 'Invalid payment terms value'
                          }
                      }
                      console.log(this.opptyRecord.OpportunityContactRoles);
                      for(let i =0;i<this.opptyRecord.OpportunityContactRoles.length;i++){
                          this.opptyRecord.OpportunityContactRoles[i].IsCountryChanged = true;
                          this.opptyRecord.OpportunityContactRoles[i].IsStateChanged = true;
                          let contactlist = this.opptyRecord.OpportunityContactRoles
                              let a = this.opptyRecord.OpportunityContactRoles[i].Contact.OM_Contact_State__c;

                          for(let j=0;j<this.stateList.length;j++){
                              if(this.stateList[j].value === this.opptyRecord.OpportunityContactRoles[i].Contact.OM_Contact_State__c){
                                  this.opptyRecord.OpportunityContactRoles[i].Contact.invalidStateError = ''
                                  break
                              }
                              else{
                                  this.opptyRecord.OpportunityContactRoles[i].Contact.invalidStateError = 'Invalid State';     
                              }
                          }        
                          for(let j=0;j<this.countriesList.length;j++){
                              if(this.countriesList[j].value === this.opptyRecord.OpportunityContactRoles[i].Contact.OM_Contact_Country__c){
                                  this.opptyRecord.OpportunityContactRoles[i].Contact.invalidCountryError = ''
                                  break
                              }
                              else{
                                  this.opptyRecord.OpportunityContactRoles[i].Contact.invalidCountryError = 'Invalid Country';     
                              }
                          }  
                      }
                  }
                  console.log(this.opptyRecord);

              }
          } else {
              this.opptyErrorMessage = 'Opportunity Information not found.';
          }
          this.isLoading = false;
          this.spinnerclass = 'spinner';
      }, 100);
      console.log(this.opptyRecord);
  }
  updateNodes(receivedData) {
      console.log(receivedData.opportunityRecord);
      this.opptyRecord = receivedData.opportunityRecord;
      if (receivedData.opportunityRecord.OpportunityContactRoles) {
          this.opptyRecord.OpportunityContactRoles = receivedData.opportunityRecord.OpportunityContactRoles.records;
      }
      if (receivedData.opportunityRecord.OpportunityLineItems) {
          this.opptyRecord.OpportunityLineItems = receivedData.opportunityRecord.OpportunityLineItems.records;
      }
  }

  validateApprovalStatus() {
      if (this.opptyRecord.Approval_Status__c != 'Submitted') {
          // this.opptyErrorMessage = 'Opportunity is not in Approval Process';
      }
  }

  pushDefaultApContactsToOCRs(receivedData) {
      receivedData.defaultApContacts.forEach((eachContact, ind)=> {
          var eachOCR = {};
          eachOCR.Role = 'Default AP Contact';
          eachOCR.Id = 'tempOCRId-' + ind;                                // Required this for unique key attribute for html iteration
          eachOCR.OpportunityId = receivedData.opportunityRecord.Id;      // Used when saving this to ACRD
          eachOCR.Contact = eachContact;
          this.opptyRecord.OpportunityContactRoles.push(eachOCR);
      });
  }

  orderOCRs() {
      if (this.opptyRecord.OpportunityContactRoles) {
          let billToOCRs = [];
          let omBillToOCRs = [];
          let shipToOCRs = [];
          let omShipToOCRs = [];
          let soldToOCRs = [];
          let omSoldToOCRs = [];
          let additionalApContactsOCRs = [];
          let dafaultAPContactOCRs = [];
          let finalOCROrder = [];

          this.opptyRecord.OpportunityContactRoles.forEach(eachOCR => {
              eachOCR.AccountURL = this.currentOrgBaseURL + '/' + eachOCR.Contact.Account.Id;
              if (eachOCR.Role === 'Bill To') {
                  billToOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'OM Bill To') {
                  omBillToOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'Ship To') {
                  shipToOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'OM Ship To') {
                  omShipToOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'Sold To') {
                  soldToOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'OM Sold To') {
                  omSoldToOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'Additional AP Contact') {
                  additionalApContactsOCRs.push(eachOCR);
              } else if (eachOCR.Role === 'Default AP Contact') {
                  dafaultAPContactOCRs.push(eachOCR);
              }
          });

          // AUR-1685 // Be More specific with which BillTo/ShipTo/SoldTo [Good to have]
          if (billToOCRs.length > 1 || shipToOCRs.length > 1 || soldToOCRs.length > 1 ||
                  omBillToOCRs.length > 1 || omShipToOCRs.length > 1 || omSoldToOCRs.length > 1) {
              this.opptyErrorMessage = 'More than One BillTo/OMBillTo/ShipTo/OMShipTo/SoldTo/OMSoldTo Contact Roles found.';
          } else {
              // Push one of OmBillTo/BillTo
              if (omBillToOCRs.length > 0) {
                  finalOCROrder = finalOCROrder.concat(omBillToOCRs);
              } else if (billToOCRs.length > 0) {
                  finalOCROrder = finalOCROrder.concat(billToOCRs);
              }

              // Push one of OmShipTo/ShipTo
              if (omShipToOCRs.length > 0) {
                  finalOCROrder = finalOCROrder.concat(omShipToOCRs);
              } else if (shipToOCRs.length > 0) {
                  finalOCROrder = finalOCROrder.concat(shipToOCRs);
              }

              // Push one of OmSoldTo/SoldTo
              if (omSoldToOCRs.length > 0) {
                  finalOCROrder = finalOCROrder.concat(omSoldToOCRs);
              } else if (soldToOCRs.length > 0) {
                  finalOCROrder = finalOCROrder.concat(soldToOCRs);
              }

              // let ocrsInDesiredOrder = billToOCRs.concat(shipToOCRs).concat(soldToOCRs).concat(additionalApContactsOCRs).concat(dafaultAPContactOCRs);
              let ocrsInDesiredOrder = finalOCROrder.concat(additionalApContactsOCRs).concat(dafaultAPContactOCRs);
              this.opptyRecord.OpportunityContactRoles = ocrsInDesiredOrder;
          }
      } else {
          this.opptyErrorMessage = 'No Opportunity Contact Roles found';
      }
  }

  calculateOpptyPaymentAmountTotal() {
      this.opptyRecord.TotalPaymentAmount = (this.getAmountValue(this.opptyRecord.ST_Payment1_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.ST_Payment2_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.ST_Payment3_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_4_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_5_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_6_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_7_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_8_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_9_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_10_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_11_Amount__c) +
                                              this.getAmountValue(this.opptyRecord.Payment_12_Amount__c)).toFixed(2);
  }

  getAmountValue(receviedValue) {
      if (!receviedValue || isNaN(receviedValue) || this.isEmptyOrSpaces(String(receviedValue))) {    // null check, number check, space check
          return 0;
      }
      return parseFloat(receviedValue);
  }

  setAgreementBundleFlag() {
      if (this.opptyRecord.Apttus__R00N50000001Xl0FEAS__r && this.opptyRecord.Apttus__R00N50000001Xl0FEAS__r.records
          && this.opptyRecord.Apttus__R00N50000001Xl0FEAS__r.records.length > 0) {
          this.opptyRecord.agreementBundleFlag = this.opptyRecord.Apttus__R00N50000001Xl0FEAS__r.records[0].All_line_items_bundled__c;
          this.validateBundleFlags(this.opptyRecord.agreementBundleFlag, this.opptyRecord.OM_all_line_items_bundled__c);
      } else {
          this.opptyRecord.agreementBundleFlag = null;
          this.agreementBundleNote = 'No Active \'Order Doc\' Agreement found.';
      }
  }

  validateBundleFlags(agreementBundleVal, omBundleVal) {
      if (agreementBundleVal !== omBundleVal) {
          this.agreementBundleMismatch = 'Agreement Bundle and OM bundle values are not same.';
      } else {
          this.agreementBundleMismatch = '';
      }
  }

  // AUR-1671
  updateOmContactDetailsIfAllEmpty () {
      if (this.opptyRecord.OpportunityContactRoles) {
          this.opptyRecord.OpportunityContactRoles.forEach(eachOCR => {
              // If all the OM Fields are empty for this Contact. Copy the data from existing contact fields to new OM fields.
              if ( 
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_Account_Name__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_Account_Name__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_First_Name__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_First_Name__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_Last_Name__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_Last_Name__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_Street__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_Street__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_City__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_City__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_State__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_State__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_Zip__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_Zip__c)) &&
                  !(eachOCR.Contact.hasOwnProperty('OM_Contact_Country__c') && !this.isEmptyOrSpaces(eachOCR.Contact.OM_Contact_Country__c))
              ) {
                  eachOCR.Contact.OM_Contact_Account_Name__c = eachOCR.Contact.Account.Name;
                  eachOCR.Contact.OM_Contact_First_Name__c = eachOCR.Contact.FirstName;
                  eachOCR.Contact.OM_Contact_Last_Name__c = eachOCR.Contact.LastName;
                  eachOCR.Contact.OM_Contact_Street__c = eachOCR.Contact.MailingStreet;
                  eachOCR.Contact.OM_Contact_City__c = eachOCR.Contact.MailingCity;
                  eachOCR.Contact.OM_Contact_State__c = eachOCR.Contact.MailingState;
                  eachOCR.Contact.OM_Contact_Zip__c = eachOCR.Contact.MailingPostalCode;
                  eachOCR.Contact.OM_Contact_Country__c = eachOCR.Contact.MailingCountry;
                  eachOCR.isUpdated = true;
              }
          });
      }
  }

  isEmptyOrSpaces(str){
      return !str || str.trim() === '';
  }

  setOneTimeDiscountValue(){
      if (this.opptyRecord.SBQQ__Quotes2__r && this.opptyRecord.SBQQ__Quotes2__r.records
              && this.opptyRecord.SBQQ__Quotes2__r.records.length > 0) {
          this.oneTimeDiscount = this.getAmountValue(this.opptyRecord.SBQQ__Quotes2__r.records[0].OTD__c);
          if (this.oneTimeDiscount > 0) {
              this.oneTimeDiscountAvailable = true;
          }
      }
  }

  oliDataUpdates () {
      if (this.opptyRecord.OpportunityLineItems) {
          
          this.opptyRecord.OpportunityLineItems.forEach(eachOLI => {

              // Copy Total Price To OmModifiedAmount If Empty
              if ( (!eachOLI.hasOwnProperty('OM_Modified_Amount_TCV_Allocated__c') ||             // If property doesn't exist
                  this.isEmptyOrSpaces(String(eachOLI.OM_Modified_Amount_TCV_Allocated__c)) )     // OR if property exists with null or blank or spaces
                  && !this.isEmptyOrSpaces(String(eachOLI.TotalPrice))                            // And TotalPrice is notnull, not empty or not blank spaces
              ) {
                  eachOLI.OM_Modified_Amount_TCV_Allocated__c = this.getAmountValue(eachOLI.TotalPrice).toFixed(2);
                  eachOLI.isUpdated = true;
              }

              // flattening required to access related record data
              if (eachOLI.SBQQ__QuoteLine__r) {
                  eachOLI.QL_Net_Total_in_Proposal = eachOLI.SBQQ__QuoteLine__r.Net_Total_in_Proposal__c;
              }

              this.totalQuoteLinePrice = this.totalQuoteLinePrice + this.getAmountValue(eachOLI.QL_Net_Total_in_Proposal);
              this.totalOLIsAmount = this.totalOLIsAmount + this.getAmountValue(eachOLI.TotalPrice);
              this.totalOmModifiedAmount = this.totalOmModifiedAmount + this.getAmountValue(eachOLI.OM_Modified_Amount_TCV_Allocated__c);
          });

          // Setting to two decimal places
          this.totalQuoteLinePrice = (this.totalQuoteLinePrice - this.oneTimeDiscount).toFixed(2);
          this.totalOLIsAmount = (this.totalOLIsAmount - this.oneTimeDiscount).toFixed(2);
          this.totalOmModifiedAmount = (this.totalOmModifiedAmount - this.oneTimeDiscount).toFixed(2);
      }
  }

  handleFieldValueChange(event) {
      var value;
      if(event.target.type === 'checkbox' || event.target.type === 'checkbox-button' || event.target.type === 'toggle'){
          value = event.target.checked;
      }else{
          value = event.target.value;
          console.log(value);
          console.log(event.target.dataset.object);
      }
      
      if (event.target.dataset.object === 'OPPTY') {
          var changedFieldApiName = event.target.dataset.fieldname;
          if(changedFieldApiName ==="RejectionComment"){
              this.opptyRecord[changedFieldApiName] = this.selectedRejectedReason +' - '+value;
          }
          else{
          this.opptyRecord[changedFieldApiName] = value;
          }
          if (event.target.dataset.fieldname !== 'RejectionComment') {
              this.opptyRecord.isUpdated = true;
          }
          // Validate Bundle Flag
          if (changedFieldApiName === 'OM_all_line_items_bundled__c' && this.opptyRecord.agreementBundleFlag != null) {
              this.validateBundleFlags(this.opptyRecord.agreementBundleFlag, value);
          }
          // Calculate Total Oppty TotalPaymentAmount
          if (changedFieldApiName === 'ST_Payment1_Amount__c' || changedFieldApiName === 'ST_Payment2_Amount__c' ||
              changedFieldApiName === 'ST_Payment3_Amount__c' || changedFieldApiName === 'Payment_4_Amount__c' ||
              changedFieldApiName === 'Payment_5_Amount__c'   || changedFieldApiName === 'Payment_6_Amount__c' ||
              changedFieldApiName === 'Payment_7_Amount__c'   || changedFieldApiName === 'Payment_8_Amount__c' ||
              changedFieldApiName === 'Payment_9_Amount__c'   || changedFieldApiName === 'Payment_10_Amount__c' ||
              changedFieldApiName === 'Payment_11_Amount__c'  || changedFieldApiName === 'Payment_12_Amount__c' ) {
              this.calculateOpptyPaymentAmountTotal();
          }
      } else if (event.target.dataset.object === 'OCR') {
          var ocrIndex = event.target.dataset.ocrindex;
          console.log(ocrIndex);
          var changedFieldApiName = event.target.dataset.fieldname;
          this.opptyRecord.OpportunityContactRoles[ocrIndex].Contact[changedFieldApiName] = value;
          this.opptyRecord.OpportunityContactRoles[ocrIndex].isUpdated = true;
      }
  }
  
  handleOliCellChange(event) {
      var updatedValuesJson = event.detail.draftValues[0];
      var changedFieldApiName = Object.keys(updatedValuesJson)[0];
      var oliRowIndex = updatedValuesJson.index;
      oliRowIndex = oliRowIndex.replace('row-', '');
      // Dynamically accessing property and setting it to opptyRecord.
      this.opptyRecord.OpportunityLineItems[oliRowIndex][changedFieldApiName] = updatedValuesJson[changedFieldApiName];
      this.opptyRecord.OpportunityLineItems[oliRowIndex].isUpdated = true;
      if (changedFieldApiName === 'OM_Modified_Amount_TCV_Allocated__c') {
          this.calculateOliModifiedAmountTotal();
      }
  }

  calculateOliModifiedAmountTotal() {
      if (this.opptyRecord.OpportunityLineItems) {
          this.totalOmModifiedAmount = 0;
          this.opptyRecord.OpportunityLineItems.forEach(eachOLI => {
              this.totalOmModifiedAmount = this.totalOmModifiedAmount + this.getAmountValue(eachOLI.OM_Modified_Amount_TCV_Allocated__c);
          });
          this.totalOmModifiedAmount = (this.totalOmModifiedAmount - this.oneTimeDiscount).toFixed(2);
      }
  }
  
  handleSave(event) {

      this.isLoading = true;
      if (event.target.dataset.buttonname === 'btnExit') {
          window.open(this.opptyURL, "_self");
      } else {

          if (event.target.dataset.buttonname === 'btnSaveAndApprove') {
              this.opptyRecord.ApprovalAction = 'Approve';
          } else if (event.target.dataset.buttonname === 'btnSave') {
              this.opptyRecord.ApprovalAction = 'None';
          } else if (event.target.dataset.buttonname === 'btnSaveAndReject') {
              this.opptyRecord.ApprovalAction = 'Reject';
          }
          clearTimeout(this.timeoutId);
          this.timeoutId = setTimeout(() => {
              console.log('SaveClickData: ', JSON.parse(JSON.stringify(this.opptyRecord)));
              saveOpportunityAndRelatedDetails({ opportunityDetails: JSON.stringify(this.opptyRecord) })
              .then((result) => {

                  var saveOperationResult = JSON.parse(result);
                  console.log('SaveOperationResult: ', saveOperationResult);
                  if (saveOperationResult.updateOperationResult === 'Success' || saveOperationResult.updateOperationResult === 'NoRecordsToUpdate') {
                      this.messageToUser = 'Record Updates : Saved Successfully.';
                      if (saveOperationResult.approvalResult) {
                          // Don't show any message. Just redirect the user to Opportunity record.
                          this.messageToUser = null;
                          window.open(this.opptyURL, "_self");
                      } else if (saveOperationResult.approvalResult != null && !saveOperationResult.approvalResult) {
                          this.messageToUser = this.messageToUser + '\n ApprovalProcess: ' + this.opptyRecord.ApprovalAction + ' action failed.';
                      }
                  } else if (saveOperationResult.updateOperationResult === 'PartialSuccess' || saveOperationResult.updateOperationResult === 'Failed') {
                      this.messageToUser = 'Record Updates : ' + saveOperationResult.updateOperationResult;
                      if (saveOperationResult.updateErrors) {
                          this.setMessage(saveOperationResult.updateErrors.opptyErrors);
                          this.setMessage(saveOperationResult.updateErrors.oliErrors);
                          this.setMessage(saveOperationResult.updateErrors.contactErrors);
                      }
                  }
                  this.isLoading = false;

              }).catch((error) => {
                  this.isLoading = false;
                  console.log(JSON.stringify(error));
              });
          }, 1000);
      }
      
  }
  handleReasonChange(event){
      this.selectedRejectedReason = event.detail.value
      var changedFieldApiName = event.target.dataset.fieldname;
      this.opptyRecord[changedFieldApiName] = this.selectedRejectedReason;
  }
  showPaymentTerms(event){
      console.log(event.currentTarget.dataset.value);
      this.hidePaymentTerm = false;
      // console.log( event.target.value);
      // console.log( event.target.key);
      for(let i =0;i<this.opptyRecord.OpportunityContactRoles.length;i++){
          console.log(this.opptyRecord.OpportunityContactRoles[i]);
          console.log(this.opptyRecord.OpportunityContactRoles[i].ContactId);

          
       

          if(event.currentTarget.dataset.value === this.opptyRecord.OpportunityContactRoles[i].ContactId || this.opptyRecord.OpportunityContactRoles[i].IsCountryChanged=== false){
              this.opptyRecord.OpportunityContactRoles[i].IsCountryChanged = false
              console.log('in flase');
          }
          else{
              this.opptyRecord.OpportunityContactRoles[i].IsCountryChanged = true
              console.log('in true');

          }
      }

      console.log(JSON.stringify(this.opptyRecord.OpportunityContactRoles));
     let contactRoles =  [...this.template.querySelectorAll('.uiInputSelectOption')]
     let contactRoles2 =  [...this.template.querySelectorAll('.checkContacts')]
     let contactRoles3 =  [...this.template.querySelectorAll('.abc')]

     console.log(contactRoles);
     console.log(contactRoles2);
     console.log(contactRoles3);
     console.log(this.opptyRecord);


      // for(let i = 0;i < radioList.length; i++) {
      // if(this.disabledRowList.includes(radioList[i].value)) {
      // // console.log('This is rowlist.value', radioList[i].value)
      // ; radioList[i].disabled = true; 
      // }
      // }

      // var changedFieldApiName = event.target.dataset.fieldname;
      //     console.log(changedFieldApiName);

  }
  selectionPaymentTermChangeHandler(event){
      var changedFieldApiName = event.target.dataset.fieldname;
      this.opptyRecord[changedFieldApiName] = event.target.value;
  }

  setMessage (receivedData) {
      if (receivedData) {
          receivedData.forEach(eachError => {
              this.messageToUser = this.messageToUser + '\n Message: ' + eachError.message;
              this.messageToUser = this.messageToUser + '\n StatusCode: ' + eachError.statusCode;
          });
      }
  }

  closeMessage() {
      this.messageToUser = '';
  }

  selectionPaymentTermChangeHandler(event){
      
      console.log(event.currentTarget.dataset.value);
      console.log( event.target.label);
  }
  renderedCallback() {
      // console.log(this.opptyRecord.OpportunityContactRoles);
  }
  showStateOptions(event){
      

      console.log(event.currentTarget.dataset.value);
      this.hidePaymentTerm = false;
      // console.log( event.target.value);
      // console.log( event.target.key);
      for(let i =0;i<this.opptyRecord.OpportunityContactRoles.length;i++){
          console.log(this.opptyRecord.OpportunityContactRoles[i]);
          console.log(this.opptyRecord.OpportunityContactRoles[i].ContactId);

          
       

          if(event.currentTarget.dataset.value === this.opptyRecord.OpportunityContactRoles[i].ContactId || this.opptyRecord.OpportunityContactRoles[i].IsStateChanged=== false){
              this.opptyRecord.OpportunityContactRoles[i].IsStateChanged = false
              console.log('in flase');
          }
          else{
              this.opptyRecord.OpportunityContactRoles[i].IsStateChanged = true
              console.log('in true');

          }
      }

      console.log(JSON.stringify(this.opptyRecord.OpportunityContactRoles));
     let contactRoles =  [...this.template.querySelectorAll('.uiInputSelectOption')]
     let contactRoles2 =  [...this.template.querySelectorAll('.checkContacts')]
     let contactRoles3 =  [...this.template.querySelectorAll('.abc')]

     console.log(contactRoles);
     console.log(contactRoles2);
     console.log(contactRoles3);
     console.log(this.opptyRecord);



  }
}