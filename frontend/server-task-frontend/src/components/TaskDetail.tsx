import { useEffect, useState } from "react";
import { getTask, updateTask, getPresignedUrl, uploadImage, processImage } from "../api/api";
import { useParams } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function TaskDetail() {
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    getTask(taskId!).then(setTask);
  }, [taskId]);

  const handleSave = async () => {
    const updated = await updateTask(taskId!, task);
    setTask(updated);

    if (file) {
      const uploadUrl = await getPresignedUrl(file.name, file.type);
      await uploadImage(uploadUrl, file);
      try {
        await processImage(taskId!);
        alert("Image processed!");
      } catch (err) {
        console.error("Error processing image:", err);
      }
    }
  };

  if (!task) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <TextField label="Title" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
      <TextField label="Description" value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button variant="contained" onClick={handleSave}>Save</Button>
    </Box>
  );
}
