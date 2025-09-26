# ServerTask – Serverless Task Management

ServerTask is a fully serverless task management system built with AWS CDK, Lambda, API Gateway, DynamoDB, S3, Rekognition, and a React + Material UI frontend.

The system allows users to:
- Create, view, edit, and delete tasks
- Upload images associated with tasks using secure pre-signed URLs
- Automatically process uploaded images with Amazon Rekognition
- View results in a user-friendly React interface

## Setup Instructions

### Prerequisites
- Node.js 18+
- AWS CLI configured with credentials
- AWS CDK installed globally: `npm install -g aws-cdk`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/server-task.git
cd server-task
```

### 2. Install dependencies
```bash
npm install
```

### 3. Deploy Infrastructure
```bash
cdk bootstrap    # Only once per AWS account/region
cdk synth
cdk deploy
```

### 4. Configure Frontend
Go to frontend/server-task-frontend/src/api/api.ts
Replace API_BASE with the output API Gateway endpoint from CDK deploy

### 5. Run Frontend Locally
```bash
cd frontend/server-task-frontend
npm install
npm start
```

## Features
- 🗂 **Task Management** – Full CRUD support with DynamoDB
- 🖼 **Image Uploads** – Pre-signed URLs for secure direct S3 uploads
- 🧠 **Image Processing** – Automated image label detection with Rekognition
- 🌐 **Responsive Frontend** – Built with React + Material UI
- ☁️ **Infrastructure as Code** – Reproducible deployments using AWS CDK

## Deployment Guide

### Redeploying Backend
```bash
cd server-task
cdk synth
cdk deploy
```

### Deploying Frontend (S3)
```bash
cd frontend/server-task-frontend
npm run build
aws s3 sync build/ s3://<your-frontend-bucket> --delete
```

---

## ✅ **Phase 6 Completion Criteria**

You can call Phase 6 (and the project!) **complete** when:

- [x] **README.md** is updated with overview, setup, features, architecture diagram, and deployment guide  
- [x] Codebase is clean (no unused files, properly commented, formatted)  
- [x] Project is easy to clone and deploy from scratch  
- [x] Repo is ready for GitHub (nice README + diagram)  

At this point, you have a **production-ready, portfolio-worthy project** that demonstrates:

- AWS CDK Infrastructure as Code  
- Serverless architecture  
- Secure pre-signed uploads  
- AWS Rekognition integration  
- A React frontend with Material UI  

---

