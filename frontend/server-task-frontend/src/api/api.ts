import axios from "axios";

const API_BASE = "https://<your-api-id>.execute-api.us-east-1.amazonaws.com/dev"; // Replace with your real API Gateway URL

export const api = axios.create({ baseURL: API_BASE });

export const getTasks = () => api.get("/tasks").then((res) => res.data);
export const getTask = (taskId: string) => api.get(`/tasks/${taskId}`).then((res) => res.data);
export const createTask = (task: any) => api.post("/tasks", task).then((res) => res.data);
export const updateTask = (taskId: string, task: any) => api.put(`/tasks/${taskId}`, task).then((res) => res.data);
export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`).then((res) => res.data);

export const getPresignedUrl = async (fileName: string, fileType: string) => {
  const response = await api.post("/tasks/presign", { fileName, fileType });
  return response.data.uploadURL;
};

export const uploadImage = async (uploadUrl: string, file: File) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!response.ok) throw new Error(`Upload failed with status: ${response.status}`);
};

export const processImage = async (taskId: string) => {
  const response = await api.post(`/tasks/${taskId}/process-image`);
  return response.data;
};
