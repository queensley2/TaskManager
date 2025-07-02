"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("personal");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to add a task.");
      setLoading(false);
      return;
    }
    // console.log({
    //   user: user.email,
    //   title,
    //   description,
    //   dueDate,
    //   category,
    //   completed: false,
    //   createdAt: new Date().toISOString(),
    // });
    try {
      const data = {
        user: user.email,
        title,
        description,
        dueDate,
        category,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      console.log("Adding task:", data);
      await addDoc(collection(db, "tasks"), data);
      alert("Task added successfully!");
      router.push("/dashboard/tasks");
    } catch (error: unknown) {
      let message = "Unknown error";
      if (error instanceof Error) {
        message = error.message;
      }
      alert("Error adding task: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ml-64 mt-16">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-black mb-4">
          Add New Task
        </h2>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded p-2"
          required
        >
          {/* <option value="" disabled>
            Select category
          </option> */}

          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="others">Others</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}
