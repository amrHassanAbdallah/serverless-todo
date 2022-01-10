import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from "@middy/http-error-handler";

import {getTodoByID, updateTodo} from '../../application/todos'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {getUserId} from '../utils'


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        //todo refactor the below to move the logic into the bus
        const todoId = event.pathParameters.todoId
        const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
        const userId = getUserId(event)
        let oldTodo = await getTodoByID(userId, todoId)

        try {
            const result = await updateTodo({userId: getUserId(event), timestamp:oldTodo.timestamp, update: updatedTodo})
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            }
        } catch (err) {
            return {
                statusCode: 404,
                body: JSON.stringify({message: "todo not found!"})
            }
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
