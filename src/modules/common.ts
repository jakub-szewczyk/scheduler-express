import { LexoRank } from 'lexorank'

export const ordinals = (number: number) =>
  `${number}${new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th'],
  ]).get(new Intl.PluralRules('en-US', { type: 'ordinal' }).select(number))}`

export const RANKS = Array(99)
  .fill(null)
  .reduce(
    (ranks: LexoRank[]) => ranks.concat(ranks.at(-1)!.genNext()),
    [LexoRank.middle()]
  )
  .map((rank) => rank.format())

export const generateRank = ({
  prevRank,
  nextRank,
}: {
  prevRank: string | null | undefined
  nextRank: string | null | undefined
}) => {
  if (!prevRank && nextRank) return LexoRank.parse(nextRank).genPrev()
  if (prevRank && !nextRank) return LexoRank.parse(prevRank).genNext()
  if (prevRank && nextRank)
    return LexoRank.parse(prevRank).between(LexoRank.parse(nextRank))
  return LexoRank.middle()
}
