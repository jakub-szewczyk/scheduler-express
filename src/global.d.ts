import { LooseAuthProp } from '@clerk/clerk-sdk-node'

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {
      event?: EventStartsAtWithNotificationId
      prevStatusRank?: string | null
      nextStatusRank?: string | null
    }
  }
}
