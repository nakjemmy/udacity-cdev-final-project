export interface Recipe {
  userId: string
  recipeId: string
  createdAt: string
  name: string
  description: string
  isFavourite: boolean
  attachmentUrl?: string
}
