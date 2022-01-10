import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {DynamoDBTodosRepository} from "../persistence/todos";
import {S3FileStorage} from "../persistence/file-storage";
import {createLogger} from "../utils/logger";

const logger = createLogger('business-logic-todos')

const todosRepo = new DynamoDBTodosRepository();
const fileStorage = new S3FileStorage();

export async function getTodosForUser(userID: string): Promise<TodoItem[]> {
    return todosRepo.getTodosForUser(userID)
}

export async function createAttachmentPresignedUrl(todoId: string, filetype: string): Promise<string> {
    return fileStorage.createAttachmentPresignedUrl(todoId, filetype)
}

export async function attachImageToTodo(todoId: string, userId: string, filetype: string): Promise<string> {
    logger.info('Getting the todo using the id', todoId)
    let oldTodo = await todosRepo.getTodoByID(userId, todoId);
    logger.info("Got the todo", !!oldTodo)
    if (oldTodo) {
        //todo replace this logic by something s3 driven as the FE might fail to upload for any reason
        //todo should also delete the old image
        logger.info('updating the todo url', todoId)

        await updateTodo({
            userId,
            timestamp: oldTodo.timestamp,
            update: {attachmentUrl: getImageURL(todoId, filetype)}
        })
        logger.info('updated the todo url')

        return fileStorage.createAttachmentPresignedUrl(todoId, filetype)
    } else {
        logger.error("todo not found", todoId)
        throw Error("todo not found")
    }

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
    logger.info('Getting the todo using the id', todoId)
    let todo = await todosRepo.getTodoByID(userId, todoId);
    logger.info("Got the todo")
    if (todo.attachmentUrl) {
        logger.info('Deleting the old attachment image for todo', todoId)
        await fileStorage.deleteFile(todo.attachmentUrl)
        logger.info('Deleted old attachment image', {"attachmentURL": todo.attachmentUrl, "todoId": todoId})
    }
    return todosRepo.deleteTodo(userId, todo.timestamp)
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
    return todosRepo.createTodo(userId, newTodo)
}

export function getImageURL(imageName: string, fileType: string): string {
    return fileStorage.getImageURL(imageName, fileType)
}