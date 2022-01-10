import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from "@middy/http-error-handler";

import {createAttachmentPresignedUrl, getImageURL, getTodoByID, updateTodo} from '../../businessLogic/todos'
import {getUserId} from '../utils'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const todoId = event.pathParameters.todoId
        const userId = getUserId(event)
        if (getTodoByID(userId, todoId)) {
            const url = await createAttachmentPresignedUrl(todoId)
            await updateTodo({userId, todoId, update: {imageURL: getImageURL(todoId)}})
            return {
                statusCode: 200,
                body: JSON.stringify({
                    uploadUrl: url
                }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "todo not found"
                }),
            };
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
