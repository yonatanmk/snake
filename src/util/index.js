export const indexOfAll = (arr, val) =>
  arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);

export const isMultipleOf = (target, of) => target % of === 0;
