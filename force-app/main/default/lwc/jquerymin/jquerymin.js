import { LightningElement, track, api } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import jquerymin from '@salesforce/resourceUrl/jquerymin';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class Jquerymin extends LightningElement {
    renderedCallback() {
        Promise.all([
            loadScript(this, jquerymin),
            // loadStyle(this, demoCSS)                         
        ]).then(() => { 
            $(this.template.querySelector('div')).text("JQuery Loaded");     
            
            // $(this.template.querySelector('.tags')).autocomplete({
            //     source: availableTags
            //   });

            // $( function() {
            //     var availableTags = [
            //       "ActionScript",
            //       "AppleScript",
            //       "Asp",
            //       "BASIC",
            //       "C",
            //       "C++",
            //       "Clojure",
            //       "COBOL",
            //       "ColdFusion",
            //       "Erlang",
            //       "Fortran",
            //       "Groovy",
            //       "Haskell",
            //       "Java",
            //       "JavaScript",
            //       "Lisp",
            //       "Perl",
            //       "PHP",
            //       "Python",
            //       "Ruby",
            //       "Scala",
            //       "Scheme"
            //     ];
            //     $("#tags").autocomplete({
            //       source: availableTags
            //     });
            //   } );      
         }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Jquery',
                    message: error,
                    variant: 'error'
                })
            );
        });
    }

    @api values=[{label:'in',value:'India'},{label:'US',value:'USA'},{label:'NG',value:'Nigeria'},{label:'in',value:'India'},{label:'US',value:'USA'},{label:'NG',value:'Nigeria'},{label:'in',value:'India'},{label:'US',value:'USA'},{label:'NG',value:'Nigeria'},{label:'in',value:'India'},{label:'US',value:'USA'},{label:'NG',value:'Nigeria'}];
    @api label = 'Select country';
    @api name = '';
    @api value = '';
    @api required;
    @api placeholder = '';
    initialized = false;

    renderedCallback() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        let listId = this.template.querySelector('datalist').id;
        this.template.querySelector("input").setAttribute("list", listId);
    }

    handleChange(evt) {
        console.log(evt.target.value);
        this.value = evt.target.value;
        this.dispatchEvent(new CustomEvent('change', { bubbles: false, detail: { value: evt.target.value, target: this.name } }));
    }
    
}