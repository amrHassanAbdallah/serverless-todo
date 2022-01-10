import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from "@middy/http-error-handler";

import {createAttachmentPresignedUrl, getImageURL, getTodoByID, updateTodo} from '../../businessLogic/todos'
import {getUserId} from '../utils'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        //todo refactor the below snippet to move the logic into the business layer
        const todoId = event.pathParameters.todoId
        const userId = getUserId(event)
        let oldTodo = await getTodoByID(userId, todoId)
        if (oldTodo) {
            const url = await createAttachmentPresignedUrl(todoId)
            //todo replace this logic by something event driven as the FE might fail to upload for any reason
            await updateTodo({userId, timestamp:oldTodo.timestamp, update: {imageURL: getImageURL(todoId)}})
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
