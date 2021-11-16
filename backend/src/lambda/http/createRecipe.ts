import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateRecipeRequest } from '../../requests/CreateRecipeRequest'
import { getUserId } from '../utils';
import { createRecipe } from '../../helpers/recipes'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newRecipe: CreateRecipeRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const item = await createRecipe(newRecipe, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item
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

