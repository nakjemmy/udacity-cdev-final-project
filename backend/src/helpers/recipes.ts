import { RecipeAccess } from './recipesAcess'
import { AttachmentUtils } from './attachmentUtils';
import { Recipe } from '../models/Recipe'
import { CreateRecipeRequest } from '../requests/CreateRecipeRequest'
import { UpdateRecipeRequest } from '../requests/UpdateRecipeRequest'
import * as uuid from 'uuid'

// Recipe: Implement businessLogic
const recipeAccess = new RecipeAccess()
const attachmentUtils = new AttachmentUtils()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getRecipesForUser(userId: string): Promise<Recipe[]> {
    return await recipeAccess.getRecipesForUser(userId)
}

export async function createRecipe(
    createRecipeRequest: CreateRecipeRequest,
    userId: string
): Promise<Recipe> {

    const recipeId = uuid.v4()

    return await recipeAccess.createRecipe({
        recipeId,
        userId,
        ...createRecipeRequest,
        createdAt: new Date().toISOString(),
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${recipeId}`
    })
}

export async function updateRecipe(
    userId: string,
    recipeId: string,
    updateRecipeRequest: UpdateRecipeRequest,
) {

    await recipeAccess.updateRecipe(userId, recipeId, {
        ...updateRecipeRequest
    })
}

export async function deleteRecipe(userId: string, recipeId: string) {

    await recipeAccess.deleteRecipe(userId, recipeId)
}

export function createAttachmentPresignedUrl(
    recipeId): string {

    return attachmentUtils.createAttachmentPresignedUrl(recipeId)
}