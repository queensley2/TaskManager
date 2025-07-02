"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Make sure you export db from your firebase.ts
import Link from "next/link";
import { StreaksAndBadges } from "@/components/StreakComponent";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export default function Page() {
  const [user, setUser] = useState<{
    displayName: string | null;
    email: string | null;
  } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(
        user ? { displayName: user.displayName, email: user.email } : null
      );
    });
    return () => unsubscribe();
  }, []);

  // Fetch tasks for the user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.email) return;
      setLoading(true);
      // Removed unused todayStr and today variables

      // Query tasks for this user
      const q = query(collection(db, "tasks"), where("user", "==", user.email));
      const querySnapshot = await getDocs(q);
      const allTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allTasks.push({
          id: doc.id,
          title: data.title,
          dueDate: data.dueDate,
          completed: data.completed,
        });
      });
      setTasks(allTasks);
      setLoading(false);
    };
    fetchTasks();
  }, [user?.email]);

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((task) => task.dueDate === todayStr);
  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="p-8 ml-64 mt-16">
      <StreaksAndBadges />
      <h1 className="text-2xl font-bold mb-4">
        Hello {user?.displayName || user?.email || "User"}, you have{" "}
        <span className="text-blue-600">{todayTasks.length}</span> task
        {todayTasks.length === 1 ? "" : "s"} due today
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="All Tasks" value={tasks.length} color="bg-blue-100" />
        <StatCard
          label="Completed"
          value={completedTasks.length}
          color="bg-green-100"
        />
        <StatCard
          label="Pending"
          value={pendingTasks.length}
          color="bg-yellow-100"
        />
      </div>

      {/* Today&apos;s Tasks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Today&apos;s Tasks</h2>
        {loading ? (
          <p>Loading...</p>
        ) : todayTasks.length === 0 ? (
          <p>No tasks due today.</p>
        ) : (
          <ul className="space-y-2">
            {todayTasks.map((task) => (
              <li
                key={task.id}
                className={`p-4 rounded shadow flex items-center justify-between ${
                  task.completed ? "bg-green-50" : "bg-white"
                }`}
              >
                <span
                  className={task.completed ? "line-through text-gray-400" : ""}
                >
                  {task.title}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.completed
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Task Button */}
      <Link
        href="/tasks/add"
        className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        Add Task
      </Link>
    </div>
  );
}

// StatCard component
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`p-6 rounded shadow ${color}`}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-gray-700">{label}</div>
    </div>
  );
}
