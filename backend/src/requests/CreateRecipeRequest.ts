/**
 * Fields in a request to create a single recipe item.
 */
export interface CreateRecipeRequest {
  name: string
  description: string
  isFavourite: boolean
}
