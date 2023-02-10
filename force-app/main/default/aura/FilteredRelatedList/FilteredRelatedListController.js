({
	init : function(component, event, helper) {
		helper.buildColumns(component, event, helper);
		helper.buildFilters(component, event, helper);
		helper.buildOperators(component, event, helper);
		helper.buildFiltersDropdownList(component, event, helper);

		helper.initMetadata(component, event, helper);

		helper.getViewAllRelatedUrl(component, event, helper);

		helper.buildQueryString(component, event, helper, '');
		helper.loadData(component, event, helper);
	},

	viewAll : function(component, event, helper) {
		helper.navigateToViewAllList(component, event, helper);
	},

	createRecord : function(component, event, helper) {
		helper.createNewRecord(component, event, helper);
	},

	updateColumnSorting : function(component, event, helper) {
        var fieldName = event.getParam('fieldName');
        var sortDirection = event.getParam('sortDirection');
		component.set('v.sortedBy', fieldName);
		component.set('v.sortedDirection', sortDirection);
        helper.sortData(component, fieldName, sortDirection);
	},

	handleSelect : function(component, event, helper) {
		if (event.getSource().get('v.name') === 'filterDropdown') {
			helper.doSelect(component, event, helper);
		}
	},

	handleFiltering : function(component, event, helper) {
		if (!component.get('v.field') || !component.get('v.operator') || !component.get('v.filterValue')) {
			helper.showToast('Ensure all filter criteria are populated and retry.', 'Error', 'error');
		}
		else {
			helper.doFiltering(component, event, helper);
		}
	},

	handleRowAction : function(component, event, helper) {
		helper.goToRecord(component, event, helper);
	}
})