const getAuraExceptionMessage = (error) => {
    let errorMessage = "";
    if(error) {
        if(error.body) {
            if(Array.isArray(error.body)) {
                errorMessage = error.body.map(x => x.message).join(', ');
            }
            else if(typeof error.body === "object") {
                if(typeof error.body.message === "string") {
                    errorMessage = error.body.message;
                }
            }
        }
    }
    return errorMessage;
};

const sortData = (sortingOrder, headerColumn, dataSet) => {
    try {
        let property = headerColumn;
        let sortOrder = sortingOrder;
        if( sortOrder === "none") {
            sortOrder = 'descending';
        } else if (sortOrder === "descending") {
            sortOrder = 'ascending';
        } else if (sortOrder === "ascending") {
            sortOrder = 'descending';
        }
        let _data = dataSet;

        _data.sort(function(a,b) {
            let x, y;
            if (typeof a[property] === 'string') {
                x = a[property].toLowerCase().trim();
                y = b[property].toLowerCase().trim();
                if(!isNaN(x)) {
                    x = parseFloat(x);
                }
                if(!isNaN(y)) {
                    y = parseFloat(y);
                }
            } else {
                x = a[property];
                y = b[property];
            }
            if (x > y || y === undefined) {

                if (sortOrder === "ascending") {
                    return 1;
                } else {
                    return -1;
                }
            } else if (x < y || x === undefined) {

                if (sortOrder === "descending") {
                    return -1;
                } else {
                    return 1;
                }
            }
            return 0;
        });
        return _data;
    }
    catch(err) {
        console.log(err);
    }
};

const sortHeader = (sortingOrder, headerColumn, headersArray ) => {
    try {
        let property = headerColumn;
        let sortOrder = sortingOrder;
        if (sortOrder === "none") {
            sortOrder = 'descending';
        } else if (sortOrder === "descending") {
            sortOrder = 'ascending';
        } else if (sortOrder === "ascending") {
            sortOrder = 'descending';
        }
        let headers = headersArray;

        headers.forEach(function(h) {
            if (h.property === property) {
                h.iconName = (sortOrder === "ascending") ? "utility:arrowup" : "utility:arrowdown";
                h.sortOrder = sortOrder;
            } else {
                h.sortOrder = "none";
                h.iconName = "utility:arrowdown";
            }
        });

        return headers;
    }
    catch(err) {
        console.log(err);
    }
};

function fetchSelectedRows(inputList) {
    return inputList.filter(x => x.isSelected === true);
}

function validateSFDCId(input) {
    const regex = RegExp(/^[a-z0-9]{15}(?:[a-z0-9]{3})?$/, 'i');
    return regex.test(input);
}

function isObjectEmpty(value) {
    if (!value) {
        return true;
    }
    return Object.keys(value).length === 0;
}

function toPlainObject(value) {
    value = Object(value)
    const result = {}
    for (const key in value) {
        result[key] = value[key]
    }
    return result
}

class ExtendedSelectOptions {

    constructor( label,  value,  isSelected,  isDisabled,  moreInfo) {
            this.label = label;
            this.value = value;
            this.isSelected = isSelected;
            this.isDisabled = isDisabled;
            this.moreInfo = moreInfo;
    }
}

export {getAuraExceptionMessage, sortData, sortHeader, fetchSelectedRows, validateSFDCId, isObjectEmpty, toPlainObject, ExtendedSelectOptions}