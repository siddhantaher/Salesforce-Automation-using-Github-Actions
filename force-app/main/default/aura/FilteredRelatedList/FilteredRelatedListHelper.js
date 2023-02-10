({
    initMetadata : function(component, event, helper) {
        var getColumnLabelsPromise = helper.getColumnLabels(component, event, helper);
        getColumnLabelsPromise.then(
            $A.getCallback(function(result) {
                component.set('v.columnLabels', result);
                return helper.getColumnFieldTypes(component, event, helper);
            })
        )
        .then(
            function(ret) {
                helper.setRelatedListColumns(component, event, helper);
                helper.setFields(component, event, helper);
            }
        )
        .catch(
            function(error) {
                helper.showToast(error, 'Error', 'error');
            }
        )
    },

    getColumnLabels : function(component, event, helper) {
        var action = component.get('c.getLabelsForColumns');
        action.setParams({
            objectName: component.get('v.sObject'),
            columns: component.get('v.columns')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                var labelsForColumns = response.getReturnValue();
                if (state === "SUCCESS") {
                    resolve(labelsForColumns);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject("Error message: " + errors[0].message);
                        }
                    } else {
                        reject("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },

    getColumnFieldTypes : function(component, event, helper) {
        var action = component.get('c.getFieldTypesForColumns');
        action.setParams({
            objectName: component.get('v.sObject'),
            columns: component.get('v.columns')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                var fieldTypesForColumns = response.getReturnValue();
                if (state === "SUCCESS") {
                    component.set('v.columnFieldTypes', fieldTypesForColumns);
                    resolve(fieldTypesForColumns);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject("Error message: " + errors[0].message);
                        }
                    } else {
                        reject("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },

    setFields : function(component, event, helper) {
        var fields = component.get('v.columnLabels');
        var apis = component.get('v.columns');
        var options = [];
        for (var i = 0; i < fields.length; i++) {
            options.push({
                label: fields[i],
                value: apis[i+1].fieldName
            });
        }
        component.set('v.options', options);
    },

	setRelatedListColumns : function(component, event, helper) {
        var columns = component.get('v.columns');
        var columnLabels = component.get('v.columnLabels');
        var columnFieldTypes = component.get('v.columnFieldTypes');
        var typeMappings = component.get('v.fieldTypeToDatatableType');
        var cols = [];
        var typeAttr = '';
        var title = 'View ' + component.get('v.sObject');
        cols.push({
            type: 'button-icon',
            initialWidth: 50,
            typeAttributes: {
                title: title,
                label: title,
                iconName: 'utility:new_window',
                variant: 'container'
            }
        });
        for (var i = 0; i < columns.length; i++) {
            cols.push({
                label:   columnLabels[i],
                fieldName:   columns[i],
                type:   typeMappings[columnFieldTypes[i]],
                sortable:   true
            });
        }
        component.set('v.columns', cols);
	},

	loadData : function(component, event, helper) {
		var getRelatedDataPromise = helper.getRelatedData(component, event, helper);
        getRelatedDataPromise.then(
            $A.getCallback(function(result) {
                component.set('v.data', result);
                component.set('v.tableSize', result.length);
            })
        )
        .catch(
            function(error) {
                helper.showToast('An error occurred with the query.  Please try again.', 'Error', 'error');
            }
        );
	},

	getRelatedData : function(component, event, helper) {
        var action = component.get('c.getRelated');
        action.setParams({
        	queryString: component.get('v.queryString')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                var relatedData = response.getReturnValue();
                if (state === "SUCCESS") {
                    resolve(relatedData);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject("Error message: " + errors[0].message);
                        }
                    } else {
                        reject("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    
    doSelect : function(component, event, helper) {
        var type;
        var value = event.getSource().get('v.value');
        var field = value.split(' ')[0];
        var columns = component.get('v.columns');
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].fieldName === field) {
                type = columns[i].type;
            }
        }
        helper.buildQueryString(component, event, helper, value, type);  
    },

    doFiltering : function(component, event, helper) {
        var type;
        var field = component.get('v.field');
        var columns = component.get('v.columns');
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].fieldName === field) {
                type = columns[i].type;
            }
        }
        var value = component.get('v.field') + ' ' + component.get('v.operator') + ' ' + component.get('v.filterValue');
        helper.buildQueryString(component, event, helper, value, type);
    },
    
    buildQueryString : function(component, event, helper, value, type) {
        if (value) {
            if (component.get('v.queryString').length > component.get('v.originalQueryString').length) {
                component.set('v.queryString', component.get('v.originalQueryString'));
            }
            var queryString = component.get('v.queryString');
            queryString += ' AND ';

            var parsed = value;
            var frontSubstr, substr;
            if (value.includes(',')) {
                frontSubstr = value.substring(0, value.indexOf(','));
                substr = value.substring(value.indexOf(','), value.length);
                frontSubstr = frontSubstr.substring(frontSubstr.lastIndexOf(' '), frontSubstr.length).trim();
                frontSubstr += substr;
                var tokens = frontSubstr.split(',');
                parsed = '';
                var first = true;
                for (var i = 0; i < tokens.length; i++) {
                    if (first) {
                        parsed += '(';
                        first = false;
                    }
                    parsed += value.split(' ')[0] + ' ' + value.split(' ')[1] + ' ';
                    if (type === 'text') {
                        parsed += "'";
                        parsed += tokens[i].trim();
                        parsed += "'";
                    }
                    else {
                        parsed += tokens[i].trim();
                    }
                    if (i < tokens.length-1) {
                        parsed += ' OR '
                    }
                }
                parsed += ')';
            }
            else {
                var tokens = parsed.split(' ');
                parsed = tokens[0] + ' ' + tokens[1] + ' ';
                if (type === 'text') {
                    parsed += "'";
                    for (var i = 2; i < tokens.length; i++) {
                        parsed += tokens[i];
                        parsed += ' ';
                    }
                    parsed = parsed.trim();
                    parsed += "'";
                }
                else {
                    for (var i = 2; i < tokens.length; i++) {
                        parsed += tokens[i];
                        parsed += ' ';
                    }
                }
            }
            queryString += parsed;

            component.set('v.queryString', queryString);
            helper.loadData(component, event, helper);
        }
        else {
            var queryString = 'SELECT Id';
            queryString += ', ';
            queryString += component.get('v.childRelationshipName');
            var columns = component.get('v.columns');
            for (var i = 0; i < columns.length; i++) {
                queryString += ', ';
                queryString += columns[i].toString();
            }
            queryString += ' FROM ';
            queryString += component.get('v.sObject');
            queryString += ' WHERE ';
            queryString += component.get('v.childRelationshipName');
            queryString += " = '";
            queryString += component.get('v.recordId');
            queryString += "'";

            component.set('v.queryString', queryString);
            component.set('v.originalQueryString', queryString);
        }
    },
    
    buildOperators : function(component, event, helper) {
        var operators = [];
        operators.push({
            label: 'equals',
            value: '='
        });
        operators.push({
            label: 'not equal to',
            value: '!='
        });
        operators.push({
            label: 'less than',
            value: '<'
        });
        operators.push({
            label: 'greater than',
            value: '>'
        });
        operators.push({
            label: 'less or equal',
            value: '<='
        });
        operators.push({
            label: 'greater or equal',
            value: '>='
        });
        component.set('v.operators', operators);
    },

    buildColumns : function(component, event, helper) {
        var columns = component.get('v.columns');
        var currentColumn;
        for (var i = 1; i <= 6; i++) {
            currentColumn = 'v.column';
            currentColumn += i.toString();
            if (component.get(currentColumn)) {
                columns.push(component.get(currentColumn));
            }
        }
        component.set('v.columns', columns);
    },

    buildFilters : function(component, event, helper) {
        var currentFilter;
        var filters = component.get('v.filters');
        for (var i = 1; i <= 6; i++) {
            currentFilter = 'v.filter';
            currentFilter += i.toString();
            if (component.get(currentFilter)) {
                filters.push(component.get(currentFilter));
            }
        }
        component.set('v.filters', filters);
    },

    buildFiltersDropdownList : function(component, event, helper) {
        var filters = component.get('v.filters');
        var options = [];
        var operators = component.get('v.operators');
        var curr;
        for (var i = 0; i < filters.length; i++) {
            curr = filters[i];
            for (var j = 0; j < operators.length; j++) {
                if (curr.includes(operators[j].label)) {
                    curr = curr.replace(operators[j].label, operators[j].value);
                    options.push({
                        label: filters[i],
                        value: curr
                    });
                }
            }
        }
        component.set('v.filterOptions', options);
    },

    getViewAllRelatedUrl : function(component, event, helper) {
        var urlForViewAll;
        var getPluralLabelForObjectPromise = helper.getPluralLabelForObject(component, event, helper);
        getPluralLabelForObjectPromise.then(
            $A.getCallback(function(result) {
                component.set('v.sObjectPlural', result);
                urlForViewAll = 'https://'
                urlForViewAll += window.location.host.split('.')[0];
                urlForViewAll += '.lightning.force.com/lightning/r/';
                urlForViewAll += component.get('v.recordId');
                urlForViewAll += '/related/';
                urlForViewAll += result;
                urlForViewAll += '/view/';
                component.set('v.urlForViewAll', urlForViewAll);
            })
        );
    },

    getPluralLabelForObject: function(component, event, helper) {
        var action = component.get('c.getPluralLabelForObject');
        action.setParams({
            objectName : component.get('v.sObject')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                var plural = response.getReturnValue();
                if (state === "SUCCESS") {
                    resolve(plural);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject("Error message: " + errors[0].message);
                        }
                    } else {
                        reject("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },

    createNewRecord : function(component, event, helper) {
        var createRecordEvent = $A.get("e.force:createRecord");
        var childRelationshipName = component.get('v.childRelationshipName');
        var recordId = component.get('v.recordId');

        createRecordEvent.setParams({
            "entityApiName": component.get('v.sObject'),
            "defaultFieldValues": {
                [childRelationshipName] : recordId
            }
        });
        createRecordEvent.fire();
    },

    goToRecord : function(component, event, helper) {
        var row = event.getParam('row');

        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": row.Id,
            "slideDevName": "detail"
        });
        navEvt.fire();
    },

    navigateToViewAllList : function(component, event, helper) {
        var viewAllUrl= $A.get("e.force:navigateToURL");
        viewAllUrl.setParams({
            'url': component.get('v.urlForViewAll') 
        });
        viewAllUrl.fire();
    },

    sortData: function (cmp, fieldName, sortDirection) {
        var data = cmp.get("v.data");
        var reverse = sortDirection !== 'asc';
        data.sort(this.sortBy(fieldName, reverse))
        cmp.set("v.data", data);
    },

    sortBy: function (field, reverse, primer) {
        var key = primer ?
            function (x) {
                return primer(x[field])
            } :
            function (x) {
                return x[field]
            };
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    },

    showToast: function (message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
})