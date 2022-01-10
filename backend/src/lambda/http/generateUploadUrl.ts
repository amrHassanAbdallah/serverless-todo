import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from "@middy/http-error-handler";

import {attachImageToTodo} from '../../application/todos'
import {getUserId} from '../utils'
import {GenerateUploadURLRequest} from "../../requests/GenerateUploadURLRequest";

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const todoId = event.pathParameters.todoId
        const userId = getUserId(event)
        const data: GenerateUploadURLRequest = JSON.parse(event.body)
        let url = await attachImageToTodo(todoId, userId, data.file_type)

        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadUrl: url
            }),
        };


    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
