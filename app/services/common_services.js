module.exports = {
  setHeaders: (headersData, headerKeys = []) => {
    if (headersData) {
      let returnHeaders = {};
      if (headerKeys.length) {
        headerKeys.forEach((headerKeyName) => {
          returnHeaders = { ...returnHeaders, [headerKeyName]: headersData[headerKeyName] };
        });
        headersData = returnHeaders;
      }
      return {
        headers: headersData,
      };
    }
    return undefined;
  },
  getValidationMessage: (joiErrors = []) => {
    joiErrors.forEach((err) => {
      switch (err.code) {
        case 'date.greater':
          err.message = `${err.local.label} must be greater than ${err.local.limit.key}!`;
          break;
        case 'object.xor':
          err.message = `Any one of ${err.local.peers.join(', ')} is allowed!`;
          break;
        case 'object.unknown':
          err.message = `${err.local.label} should not allowed!`;
          break;
        case 'any.empty':
          err.message = `${err.local.value} should not be empty!`;
          break;
        case 'any.required':
          err.message = `${err.local.label} must be required!`;
          break;
        case 'object.base':
          err.message = `Valid ${err.local.label} json is required!`;
          break;
        case 'json.invalid':
          err.message = `Valid ${err.local.label} json is required!`;
          break;
        case 'string.invalid':
          err.message = `Valid ${err.local.label} is required!`;
          break;
        case 'string.empty':
          err.message = `${err.local.label} should not be empty!`;
          break;
        case 'string.min':
          err.message = `${err.local.label} should have at least ${err.local.limit} characters!`;
          break;
        case 'string.max':
          err.message = `${err.local.label} should have at most ${err.local.limit} characters!`;
          break;
        case 'string.pattern.base':
          err.message = `${err.local.label} with value ${err.local.value} fails to match the ${err.local.label} pattern`;
          break;
        case 'date.base':
          err.message = `${err.local.label} must be a valid date`;
          break;
        case 'boolean.base':
          err.message = `${err.local.label} must be boolean`;
          break;
        case 'number.min':
          err.message = `${err.local.label} must be larger than or equal to ${err.local.limit}`;
          break;
        case 'number.max':
          err.message = `${err.local.label} must be lesser than or equal to ${err.local.limit}`;
          break;
        case 'alternatives.match':
          err.message = `${err.local.label} must have correct value`;
          break;
        case 'object.missing':
          err.message = `At least one of ${err.local.peers.join(', ')} is required`;
          break;
        case 'object.with':
          err.message = `${err.local.peerWithLabel} is required`;
          break;
        default:
          break;
      }
    });
    return joiErrors;
  },
  convertJoiErrors: (joiErrors = []) => {
    joiErrors = joiErrors.map((error) => ({
      message: error.message,
      field: error.context.key,
    }));
    if (joiErrors.length === 1) {
      return joiErrors[0];
    }
    return joiErrors;
  },
  updateQueryStringParameter: (uri, key, value) => {
    const returnArr = key.map((innerKeyData, idx) => {
      const re = new RegExp(`([?&])${innerKeyData}=.*?(&|$)`, 'i');
      const separator = uri.indexOf('?') !== -1 ? '&' : '?';
      if (uri.match(re)) {
        uri = uri.replace(re, `$1${innerKeyData}=${value[idx]}$2`);
        return uri;
      }

      uri = `${uri + separator + innerKeyData}=${value[idx]}`;
      return uri;
    });
    return returnArr[returnArr.length - 1] || uri;
  },
  generateCombinations: (fieldTypeArray) => {
    const result = [];

    const generateCombination = (currentCombination, index) => {
      if (index === fieldTypeArray.length) {
        result.push([...currentCombination]);
        return;
      }

      const currentField = fieldTypeArray[index];
      for (const option of currentField.options) {
        currentCombination.push({ fieldType: currentField.name, option });
        generateCombination(currentCombination, index + 1);
        currentCombination.pop();
      }
    };

    generateCombination([], 0);
    return result;
  },
  arraysEqual: (arr1, arr2) => {
    let answer = false
    // Check if the lengths are different
    if (arr1.length !== arr2.length) {
      return false;
    }
    let value = false
    // Check each element in the arrays
    for (let i = 0; i < arr1.length; i++) {
      // console.log(i, 'arr------', arr1);
      const obj1 = arr1[i];
      const obj2 = arr2[i];

      // Check if fieldType and option are the same
      if (obj1.fieldType.toString() != obj2.fieldType.toString() || obj1.option.toString() != obj2.option.toString()) {
        // console.log('obj1--------', obj1);
        value = true
        // console.log('obj2--------', obj2);
        return false;
      }
    }
    console.log('value----------', value);

    // If all elements are equal, return true
    return true;
  },
  areArraysEqual: (arr1, arr2) => {
    return (
      arr1.length === arr2.length &&
      arr1.every((obj1) =>
        arr2.find(
          (obj2) =>
            obj1.fieldType.toString() === obj2.fieldType.toString() &&
            obj1.option.toString() === obj2.option.toString()
        )
      )
    );
  }
};
