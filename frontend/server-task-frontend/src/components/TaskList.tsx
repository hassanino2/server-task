import { useEffect, useState } from "react";
import { getTasks } from "../api/api";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <>
      {tasks.map((task) => (
        <Card key={task.taskId} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6">{task.title}</Typography>
            <Typography>{task.description}</Typography>
            <Typography variant="caption">
              Due: {task.dueDate || "No due date"}
            </Typography>
            <br />
            <Link to={`/tasks/${task.taskId}`}>View Details</Link>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
