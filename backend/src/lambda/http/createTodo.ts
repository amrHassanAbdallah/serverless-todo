import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {getUserId} from "../utils";
import httpErrorHandler from "@middy/http-error-handler";
import {createTodo} from "../../application/todos";

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const newTodo: CreateTodoRequest = JSON.parse(event.body)
        const newItem = await createTodo(getUserId(event), newTodo)
        return {
            statusCode: 201,
            body: JSON.stringify({item:newItem}),
        };
    });

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )

