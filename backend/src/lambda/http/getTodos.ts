import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'

import {getTodosForUser as getTodosForUser} from '../../application/todos'
import {getUserId} from '../utils';
import httpErrorHandler from "@middy/http-error-handler";

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

        let result = await getTodosForUser(getUserId(event))

        return {
            statusCode: 200,
            body: JSON.stringify({
                items: result
            }),
        };
    })
handler
    .use(httpErrorHandler())
    .use(
    cors({
        credentials: true
    })
)


