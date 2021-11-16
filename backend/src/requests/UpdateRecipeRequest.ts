/**
 * Fields in a request to update a single Recipe item.
 */
export interface UpdateRecipeRequest {
  name: string
  description: string
  isFavourite: boolean
}