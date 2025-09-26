import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container } from "@mui/material";
import AppHeader from "./components/AppHeader";
import TaskList from "./components/TaskList";
import CreateTask from "./components/CreateTask";
import TaskDetail from "./components/TaskDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AppHeader />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/create" element={<CreateTask />} />
          <Route path="/tasks/:taskId" element={<TaskDetail />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

