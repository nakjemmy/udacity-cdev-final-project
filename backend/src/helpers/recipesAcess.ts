import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Recipe } from '../models/Recipe'
import { RecipeUpdate } from '../models/RecipeUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('RecipesAccess')

export class RecipeAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly recipesTable = process.env.RECIPES_TABLE,
    ) {
    }

    async getRecipesForUser(userId: string): Promise<Recipe[]> {
        try {
            logger.info('Getting all recipes for user')

            const result = await this.docClient.query({
                TableName: this.recipesTable,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
            }).promise()

            const items = result.Items
            return items as Recipe[]
        } catch (error) {
            logger.error("Error getting recipes for user", { error, userId })
            throw new Error("Error getting recipes for user")
        }
    }

    async createRecipe(recipe: Recipe): Promise<Recipe> {
        try {
            logger.info("Creating recipe", { recipe })
            await this.docClient.put({
                TableName: this.recipesTable,
                Item: recipe
            }).promise()

            return recipe
        } catch (error) {
            logger.error("Error creating recipe", { error, recipe })
            throw new Error("Error creating recipe")
        }

    }

    async updateRecipe(userId: string, recipeId: string, recipeUpdate: RecipeUpdate) {

        try {
            logger.info("Updating recipe", recipeId)
            await this.docClient.update({
                TableName: this.recipesTable,
                Key: {
                    'userId': userId,
                    'recipeId': recipeId
                },
                UpdateExpression: "set #recipeName= :val1, #recipeDescription=:val2, isFavourite=:val3",
                ExpressionAttributeNames: {
                    "#recipeName": "name",
                    "#recipeDescription": "description",
                },
                ExpressionAttributeValues: {
                    ":val1": recipeUpdate.name,
                    ":val2": recipeUpdate.description,
                    ":val3": recipeUpdate.isFavourite
                },
                ReturnValues: "UPDATED_NEW"
            }).promise()
        } catch (error) {
            logger.error("Error updating recipe", { error, recipeId })
            throw new Error("Error updating recipe")
        }
    }

    async deleteRecipe(userId: string, recipeId: string) {
        try {
            logger.info("Deleting recipe", recipeId)

            await this.docClient.delete({
                TableName: this.recipesTable,
                Key: {
                    'userId': userId,
                    'recipeId': recipeId
                },
            }).promise()

        } catch (error) {
            logger.error("Error deleting recipe", { recipeId, error })
            throw new Error("Error deleting recipe")
        }

    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
