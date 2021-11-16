import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)


export class AttachmentUtils {
    constructor(
        private readonly s3: AWS.S3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
    }

    createAttachmentPresignedUrl(recipeId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: recipeId,
            Expires: parseInt(this.urlExpiration)
        })
    }
}