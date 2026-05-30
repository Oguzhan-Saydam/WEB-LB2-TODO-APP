import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function fetchTodos() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError("Could not load todos. Is the backend running?");
    }
  }

  async function addTodo(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      setTitle("");
      setError("");
      fetchTodos();
    } catch (err) {
      setError("Could not add todo.");
    }
  }

  async function toggleTodo(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
      });

      fetchTodos();
    } catch (err) {
      setError("Could not update todo.");
    }
  }

  async function deleteTodo(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      fetchTodos();
    } catch (err) {
      setError("Could not delete todo.");
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <main className="app">
      <section className="card">
        <h1>LB2 To-Do App</h1>
        <p className="subtitle">
          React frontend + Express backend. Built for deployment practice.
        </p>

        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {error && <p className="error">{error}</p>}

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "done" : ""}>
              <span onClick={() => toggleTodo(todo.id)}>{todo.title}</span>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && <p className="empty">No tasks yet.</p>}
      </section>
    </main>
  );
}

export default App;