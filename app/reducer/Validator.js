import {assign, isArray, toPlainObject} from 'lodash';

import {isUsableObject} from 'app/util';

export default class Validator {
  constructor(validations=[]) {
    this.validations = new Map();
    this.addValidations(validations);
  }

  addValidations(validations=[]) {
    if (isUsableObject(validations)) {
      validations = toPlainObject(validations);
      validations = Object.keys(validations).map((k) => ({key: k, validation: validations[k]}));
    }

    validations.forEach(({key, validation}) => {
      this.validations.set(key, validation);
    });

    return this;
  }

  addValidation({key, validation}) {
    this.validations.set(key, validation);
    return this;
  }

  merge(validator) {
    Array.from(validator.validation.keys()).forEach((k) => {
      this.validations.set(k, validator.validations.get(k));
    });

    return this;
  }

  errors(input={}) {
    const keys = Array.from(this.validations.keys());

    return Promise.all(
      keys.map((k) => {
        const validated = this.validations.get(k).bind(this)(input[k], input, k);
        if (validated instanceof Promise) {
          return validated.then((errors) => {
            return {key: k, errors};
          });
        } else if (validated instanceof Validator) {
          return validated.errors(input[k]).then((errors) => {
            return {key: k, errors};
          });
        } else {
          return {key: k, errors: validated};
        }
      })
    )
    .then((errorMessages) => errorMessages.filter((msg) => {
      return isArray(msg.errors) ? msg.errors.length > 0 : !!msg.errors;
    }))
    .then((errorMessages) => {
      if (errorMessages.length === 0) {
        return null;
      } else {
        return errorMessages.reduce((allErrors, {key, errors}) => {
          return assign(allErrors, {
            [key]: isArray(errors) ? errors : (
              isUsableObject(errors) ? toPlainObject(errors) : [errors]
            )
          });
        }, {});
      }
    });
  }

  run(input={}) {
    return this.errors(input).then((errors) => {
      if (errors) {
        throw errors;
      } else {
        return input;
      }
    });
  }
}

