import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {DynamoDBTodosRepository} from "../persistence/todos";
import {S3FileStorage} from "../persistence/file-storage";


const todosRepo = new DynamoDBTodosRepository();
const fileStorage = new S3FileStorage();

export async function getTodosForUser(userID: string): Promise<TodoItem[]> {
    return todosRepo.getTodosForUser(userID)
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return fileStorage.createAttachmentPresignedUrl(todoId)
}

export async function getTodoByID(userId: string, todoId: string): Promise<TodoItem> {

    return todosRepo.getTodoByID(userId, todoId)
}

interface UpdateParams {
    userId: string;
    timestamp: string;
    update: UpdateTodoRequest;
}

export async function updateTodo({userId, timestamp, update}: UpdateParams): Promise<TodoItem> {
    return todosRepo.updateTodo({userId, timestamp, update})
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    let todo = await todosRepo.getTodoByID(userId,todoId);
    return todosRepo.deleteTodo(userId, todo.timestamp)
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
    return todosRepo.createTodo(userId, newTodo)
}

export function getImageURL(imageName: string): string {
    return fileStorage.getImageURL(imageName)
}