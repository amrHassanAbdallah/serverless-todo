import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import * as uuid from "uuid";

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE
const todosIdIndex = process.env.TODOs_ID_INDEX
const todosBucket = process.env.ATTACHMENT_S3_BUCKET
const signedURLExpiry = process.env.SIGNED_URL_EXPIRATION
const s3 = new AWS.S3({
    signatureVersion: 'v4' // Use Sigv4 algorithm
})

export async function getTodosForUser(userID: string): Promise<TodoItem[]> {
    const result = await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues:{
            ':userId':userID
        },
        ScanIndexForward:false
    }).promise()
    return result.Items || []
}

export async function createAttachmentPresignedUrl(todoId:string):Promise<string> {
    return s3.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
        Bucket: todosBucket, // Name of an S3 bucket
        Key: todoId, // id of an object this URL allows access to
        Expires: signedURLExpiry  // A URL is only valid for 5 minutes
    })
}
export async  function getTodoByID(userId:string, todoId:string):Promise<TodoItem> {
    const result = await docClient.get({
        TableName: todosTable,
        IndexName: todosIdIndex,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId ',
        ExpressionAttributeValues:{
            ':userId':userId,
            ':todoId':todoId,
        }
    }).promise()
    return result.Item[0]
}

interface UpdateParams {
    userId: string;
    todoId: string;
    update: UpdateTodoRequest;
}

export async function updateTodo({userId, todoId, update}: UpdateParams):Promise<TodoItem> {
    let updateExpression='set';
    let ExpressionAttributeNames={};
    let ExpressionAttributeValues = {};
    for (const property in update) {
        updateExpression += ` #${property} = :${property} ,`;
        ExpressionAttributeNames['#'+property] = property ;
        ExpressionAttributeValues[':'+property]=update[property];
    }
    updateExpression= updateExpression.slice(0, -1);

    return  docClient.update({
        TableName: todosTable,
        Key: {
            "todoId":todoId,
            "userId":userId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: ExpressionAttributeNames,
        ExpressionAttributeValues: ExpressionAttributeValues
    }).promise()
}

export async function deleteTodo(userId:string,todoId:string) :Promise<boolean>{
    var params = {
        TableName:todosTable,
        Key:{
            "todoId":todoId,
            "userId":userId,
        },
    };
    return docClient.delete(params).promise()
}
export async function createTodo(userId:string, newTodo:CreateTodoRequest):Promise<TodoItem>{
    const itemId = uuid.v4()
    const newItem = {
        todoId: itemId,
        ...newTodo,
        userId:userId,
        timestamp:(new Date()).toISOString()
    }
    await docClient.put({Item: newItem, TableName: todosTable}).promise()

   return newItem
}
export function getImageURL(imageName:string) :string{
    return `https://${todosBucket}.s3.amazonaws.com/${imageName}`
}