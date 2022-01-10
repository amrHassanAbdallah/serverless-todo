import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import * as uuid from "uuid";
import * as AWS from "aws-sdk";
import * as AWSXray from 'aws-xray-sdk'


export interface TodosPersistence {
    createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem>

    deleteTodo(userId: string, todoId: string): Promise<void>

    getTodosForUser(userID: string): Promise<TodoItem[]>

    getTodoByID(userId: string, todoId: string): Promise<TodoItem>

    updateTodo({userId, timestamp, update}: UpdateParams): Promise<TodoItem>
}

interface UpdateParams {
    userId: string;
    timestamp: string;
    update: UpdateTodoRequest;
}
function getDynamoClient(){
    let client = new AWS.DynamoDB.DocumentClient();
    AWSXray.captureAWSClient((client as any).service);
    return client
}

export class DynamoDBTodosRepository implements TodosPersistence {
    client: AWS.DynamoDB.DocumentClient;
    table: string;
    todoIdIndex: string;

    constructor() {
        this.client =getDynamoClient()
        this.table = process.env.TODOS_TABLE
        this.todoIdIndex = process.env.TODOs_ID_INDEX
    }

    async getTodosForUser(userID: string): Promise<TodoItem[]> {
        const result = await this.client.query({
            TableName: this.table,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userID
            },
            ScanIndexForward: false
        }).promise()
        return result.Items
    }

    async getTodoByID(userId: string, todoId: string): Promise<TodoItem> {
        const result = await this.client.query({
            TableName: this.table,
            IndexName: this.todoIdIndex,
            KeyConditionExpression: 'todoId = :todoId ',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId,
            },

        }).promise()
        return result.Items[0]
    }

    async updateTodo({userId, timestamp, update}: UpdateParams): Promise<TodoItem> {
        let updateExpression = 'set';
        let ExpressionAttributeNames = {};
        let ExpressionAttributeValues = {};
        for (const property in update) {
            updateExpression += ` #${property} = :${property} ,`;
            ExpressionAttributeNames['#' + property] = property;
            ExpressionAttributeValues[':' + property] = update[property];
        }
        updateExpression = updateExpression.slice(0, -1);

        return (await this.client.update({
            TableName: this.table,
            Key: {
                "userId": userId,
                "timestamp": timestamp
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: ExpressionAttributeNames,
            ExpressionAttributeValues: ExpressionAttributeValues
        }).promise()).Attributes
    }

    async deleteTodo(userId: string, timestamp: string): Promise<void> {
        var params = {
            TableName: this.table,
            Key: {
                "userId": userId,
                "timestamp": timestamp,
            },
        };
        await this.client.delete(params).promise()
        return
    }

    async createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
        const itemId = uuid.v4()
        const newItem = {
            todoId: itemId,
            ...newTodo,
            userId: userId,
            timestamp: (new Date()).toISOString()
        }
        await this.client.put({Item: newItem, TableName: this.table}).promise()

        return newItem
    }


}