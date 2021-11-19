import { apiEndpoint } from '../config'
import { Recipe } from '../types/Recipe';
import { CreateRecipeRequest } from '../types/CreateRecipeRequest';
import Axios from 'axios'
import { UpdateRecipeRequest } from '../types/UpdateRecipeRequest';

export async function getRecipes(accessToken: string): Promise<Recipe[]> {
    console.log('Fetching recipes')

    const response = await Axios.get(`${apiEndpoint}/recipes`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    })
    return response.data.items
}

export async function createRecipe(
    accessToken: string,
    newRecipe: CreateRecipeRequest
): Promise<Recipe> {
    const response = await Axios.post(`${apiEndpoint}/recipes`, JSON.stringify(newRecipe), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data.item
}

export async function patchRecipe(
    accessToken: string,
    recipeId: string,
    updatedRecipe: UpdateRecipeRequest
): Promise<void> {
    await Axios.patch(`${apiEndpoint}/recipes/${recipeId}`, JSON.stringify(updatedRecipe), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
}

export async function deleteRecipe(
    accessToken: string,
    recipeId: string
): Promise<void> {
    await Axios.delete(`${apiEndpoint}/recipes/${recipeId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
}

export async function getUploadUrl(
    accessToken: string,
    recipeId: string
): Promise<string> {
    const response = await Axios.post(`${apiEndpoint}/recipes/${recipeId}/attachment`, '', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
    await Axios.put(uploadUrl, file)
}
