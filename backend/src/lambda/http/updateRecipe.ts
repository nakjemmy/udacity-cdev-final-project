import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateRecipeRequest } from '../../requests/UpdateRecipeRequest'
import { updateRecipe } from '../../helpers/recipes'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const recipeId = event.pathParameters.recipeId
    const updatedRecipe: UpdateRecipeRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    await updateRecipe(userId, recipeId, updatedRecipe)

    return {
      statusCode: 201,
      body: JSON.stringify({
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
