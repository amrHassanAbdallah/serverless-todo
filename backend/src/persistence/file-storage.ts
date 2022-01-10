import * as AWS from "aws-sdk";
import * as AWSXray from 'aws-xray-sdk'

const XAWS = AWSXray.captureAWS(AWS)

export interface FileStorage {
    getImageURL(imageName:string,filetype:string) :string
    createAttachmentPresignedUrl(todoId:string,filetype:string):Promise<string>
}
const mime: { [name: string]: string } = {
    gif: "image/gif",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
};
function getS3Client(){
    return new XAWS.S3({
        signatureVersion:'v4'
    })
}
export class S3FileStorage implements FileStorage{
    bucket:string;
    expire:number;
    client: AWS.S3;
    constructor() {
        this.bucket = process.env.ATTACHMENT_S3_BUCKET
        this.expire = parseInt(process.env.SIGNED_URL_EXPIRATION)
        this.client = getS3Client()
    }
    async createAttachmentPresignedUrl(todoId:string,filetype:string):Promise<string> {
        let contentType = mime[filetype] || ""
        return this.client.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
            Bucket: this.bucket, // Name of an S3 bucket
            Key: todoId+"."+filetype, // id of an object this URL allows access to
            Expires: this.expire,  // A URL is only valid for 5 minutes
            ContentType:contentType,
        })
    }
    async deleteFile(fileName:string):Promise<void>{
        await this.client.deleteObject({
            Bucket:this.bucket,
            Key:this.getFileName(fileName),
        }).promise()
        return
    }
    getBucketURL():string{
        return `https://${this.bucket}.s3.amazonaws.com/`;
    }
    getImageURL(imageName:string,filetype:string) :string{
        return `${this.getBucketURL()}${imageName}.${filetype}`
    }
    getFileName(url):string{
        return url.replace(this.getBucketURL(),"")
    }
}