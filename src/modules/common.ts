export const ordinals = (number: number) =>
  `${number}${new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th'],
  ]).get(new Intl.PluralRules('en-US', { type: 'ordinal' }).select(number))}`
