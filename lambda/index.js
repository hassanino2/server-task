const AWS = require("aws-sdk");
const { use } = require("react");

const db = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

const TABLE_NAME = process.env.TASKS_TABLE;
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.handler = async (event) => {
    console.log("Incoming event:", JSON.stringify(event, null, 2));

    try{
        const httpMethod = event.httpMethod;
        const resource = event.resource;
        const taskId = event.pathParameters?.taskId || null;
        const body = event.body ? JSON.parse(event.body) : null;
        const userId = "demo-user";

        if (resource === "/tasks" && httpMethod === "GET") {
            return await listTasks(userId);
        }

        if (resource === "/tasks" && httpMethod === "POST") {
            return await createTask(body, userId);
        }

        if (resource === "/tasks/{taskId}" && httpMethod === "GET") {
            return await getTask(taskId, userId);
        }

        if (resource === "/tasks/{taskId}" && httpMethod === "PUT") {
            return await updateTask(taskId, body, userId);
        }

        if (resource === "/tasks/{taskId}" && httpMethod === "DELETE") {
            return await deleteTask(taskId, userId);
        }

        if (resource === "/tasks/{taskId}/process-image" && httpMethod === "POST") {
            return await processImage(taskId, body, userId);
        }

        if (resource === "/tasks/presign" && httpMethod === "POST") {
            return await generatePresignedUrl(body);
        }

        return send(404, { message: "Route not found" });
    }   catch (err) {
        console.error("Error:", err);
        return send(500, { message: "Internal server error", error: err.message });
    }
};

/** ========== TASK CRUD ========== **/

async function listTasks(userId) {
    const result = await db
        .query({
            TableName: TABLE_NAME,
            IndexName: "UserIdIndex",
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": userId },
        })
        .promise();
    return send(200, result.Items);
}

async function getTask(taskId, userId) {
    const result = await db
        .get({
            TableName: TABLE_NAME,
            Key: { taskId, userId },
        })
        .promise();
    return send(200, result.Item || {});
}

async function createTask(taskData, userId) {
    const item = {
        taskId: Date.now().toString(),
        userId,
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.put({ TableName: TABLE_NAME, Item: item }).promise();
    return send(201, item);
}

async function updateTask(taskId, taskData, userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: { taskId, userId },
        UpdateExpression:
            "set title = :title, description = :description, dueDate = :dueDate, #taskStatus = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
            "#taskStatus": "status", 
        },
        ExpressionAttributeValues: {
            ":title": taskData.title,
            ":description": taskData.description,
            ":dueDate": taskData.dueDate,
            ":status": taskData.status,
            ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
    };

    const result = await db.update(params).promise();
    return send(200, result.Attributes);
}

async function deleteTask(taskId, userId) {
    await db
        .delete({
            TableName: TABLE_NAME,
            Key: { taskId, userId },
        })
        .promise();
    return send(204, {});
}

/** ========== S3 PRE-SIGNED URL ========== **/

async function generatePresignedUrl(body) {
  const { fileName, fileType } = body;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    Expires: 60, // URL valid for 1 min
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return send(200, { uploadURL });
}

/** ========== REKOGNITION PROCESSING ========== **/

async function processImage(taskId, body, userId) {
  const { imageKey } = body;

  const result = await rekognition
    .detectLabels({
      Image: { S3Object: { Bucket: BUCKET_NAME, Name: imageKey } },
      MaxLabels: 5,
      MinConfidence: 70,
    })
    .promise();
  
  await db
    .update({
        TableName: TABLE_NAME,
        Key: { taskId, userId },
        UpdateExpression: "set imageLabels = :labels",
        ExpressionAttributeValues: {
            ":labels": result.Labels,
        },
        ReturnValues: "UPDATED_NEW",
    })
    .promise();

return send(200, { labels: result.Labels });
}

/** ========== UTIL ========== **/

function send(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  };
}

   



