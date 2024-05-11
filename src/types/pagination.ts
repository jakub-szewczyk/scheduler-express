export interface PaginableResponse<Content> {
  content: Content[]
  page: number
  size: number
  total: number
}
