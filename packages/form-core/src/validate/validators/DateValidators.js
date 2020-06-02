/* eslint-disable max-classes-per-file */
// TODO: move to input-datepicker?
import { normalizeDateTime } from '@lion/localize';
import { Validator } from '../Validator.js';

function isDate(value) {
  return (
    Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value.getTime())
  );
}

export class IsDate extends Validator {
  static get validatorName() {
    return 'IsDate';
  }

  // eslint-disable-next-line class-methods-use-this
  execute(value) {
    let hasError = false;
    if (!isDate(value)) {
      hasError = true;
    }
    return hasError;
  }
}

export class MinDate extends Validator {
  static get validatorName() {
    return 'MinDate';
  }

  execute(value, min = this.param) {
    let hasError = false;
    if (!isDate(value) || value < normalizeDateTime(min)) {
      hasError = true;
    }
    return hasError;
  }
}

export class MaxDate extends Validator {
  static get validatorName() {
    return 'MaxDate';
  }

  execute(value, max = this.param) {
    let hasError = false;
    if (!isDate(value) || value > normalizeDateTime(max)) {
      hasError = true;
    }
    return hasError;
  }
}

export class MinMaxDate extends Validator {
  static get validatorName() {
    return 'MinMaxDate';
  }

  execute(value, { min = 0, max = 0 } = this.param) {
    let hasError = false;
    if (!isDate(value) || value < normalizeDateTime(min) || value > normalizeDateTime(max)) {
      hasError = true;
    }
    return hasError;
  }
}

export class IsDateDisabled extends Validator {
  static get validatorName() {
    return 'IsDateDisabled';
  }

  execute(value, isDisabledFn = this.param) {
    let hasError = false;
    if (!isDate(value) || isDisabledFn(value)) {
      hasError = true;
    }
    return hasError;
  }
}