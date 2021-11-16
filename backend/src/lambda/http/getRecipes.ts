import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils';
import { getRecipesForUser } from '../../helpers/recipes';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const recipes = await getRecipesForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: recipes
      })
    }

  })


handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

