import { LightningElement, track,api } from 'lwc';
// import Id from '@salesforce/user/Id';
// import getUserProfile from '@salesforce/apex/UserController.getUserProfile'

export default class RoleContainer extends LightningElement {
    @api options = [{label:"12",value:"70"},{label:'14',value:"124"},{label:"21",value:"122"}];

    // showCreateTab=false;
    // connectedCallback(){
    //     getUserProfile({Userid:Id}).then((data,error)=>{
    //         console.log(data)
    //         if(data==="System Administrator"){
    //             this.showCreateTab=true
    //         }
    //         else{
    //             this.showCreateTab=false
    //         }
    //     })
    // }
    
}