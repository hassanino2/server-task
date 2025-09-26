import { useState } from "react";
import { createTask } from "../api/api";
import { TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });

  const handleSubmit = async () => {
    await createTask(form);
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <TextField type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      <Button variant="contained" onClick={handleSubmit}>Create</Button>
    </Box>
  );
}
