import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ServerTaskStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const tasksTable = new dynamodb.Table(this, 'TasksTable', {
            partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        tasksTable.addGlobalSecondaryIndex({
            indexName: 'UserIdIndex',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
        });

        const taskAttachmentsBucket = new s3.Bucket(this, 'TaskAttachmentsBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        taskAttachmentsBucket.addCorsRule({
            allowedOrigins: ["*"],
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
            allowedHeaders: ["*"],
            exposedHeaders: ["ETag"],
        });

        // IAM Role for Lambda
        const taskLambdaRole = new iam.Role(this, 'TaskLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        // Add Rekognition permission
        taskLambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ["rekognition:DetectLabels"],
                resources: ["*"],
            })
        );
        
        // Grant permissions to DynamoDB + S3
        tasksTable.grantReadWriteData(taskLambdaRole);
        taskAttachmentsBucket.grantReadWrite(taskLambdaRole);

        // Lambda Function
        const taskFunction = new lambda.Function(this, 'TaskFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            role: taskLambdaRole,
            environment: {
                TASKS_TABLE: tasksTable.tableName,
                BUCKET_NAME: taskAttachmentsBucket.bucketName,
            },
        });

        // API Gateway setup
        const api = new apigateway.RestApi(this, 'ServerTaskApi', {
            restApiName: 'ServerTask Service',
            deployOptions: { stageName: 'dev' },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization'],
            },
        });

        const tasks = api.root.addResource('tasks');
        tasks.addMethod('GET', new apigateway.LambdaIntegration(taskFunction));
        tasks.addMethod('POST', new apigateway.LambdaIntegration(taskFunction));

        const task = tasks.addResource('{taskId}');
        task.addMethod('GET', new apigateway.LambdaIntegration(taskFunction));
        task.addMethod('PUT', new apigateway.LambdaIntegration(taskFunction));
        task.addMethod('DELETE', new apigateway.LambdaIntegration(taskFunction));

        const processImage = task.addResource('process-image');
        processImage.addMethod('POST', new apigateway.LambdaIntegration(taskFunction));
    }
}