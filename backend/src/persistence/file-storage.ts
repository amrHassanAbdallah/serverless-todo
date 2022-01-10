import {S3} from "aws-sdk";


export interface FileStorage {
    getImageURL(imageName:string) :string
    createAttachmentPresignedUrl(todoId:string):Promise<string>
}

export class S3FileStorage implements FileStorage{
    bucket:string;
    expire:string;
    client: S3;
    constructor() {
        this.bucket = process.env.ATTACHMENT_S3_BUCKET
        this.expire = process.env.SIGNED_URL_EXPIRATION
        this.client = new S3({
            signatureVersion:'v4'
        })
    }
    async createAttachmentPresignedUrl(todoId:string):Promise<string> {
        return this.client.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
            Bucket: this.bucket, // Name of an S3 bucket
            Key: todoId, // id of an object this URL allows access to
            Expires: this.expire  // A URL is only valid for 5 minutes
        })
    }
    getImageURL(imageName:string) :string{
        return `https://${this.bucket}.s3.amazonaws.com/${imageName}`
    }
}