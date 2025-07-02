"use client";
import React, { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  progress?: number; // 0-100
}

export default function TasksPage() {
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? { email: user.email } : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.email) return;
      setLoading(true);
      const q = query(collection(db, "tasks"), where("user", "==", user.email));
      const querySnapshot = await getDocs(q);
      const allTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allTasks.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          completed: data.completed,
          progress: data.progress ?? (data.completed ? 100 : 0),
        });
      });
      setTasks(allTasks);
      setLoading(false);
    };
    fetchTasks();
  }, [user?.email]);

  useEffect(() => {
    let filtered = tasks;
    if (search) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === "completed") {
      filtered = filtered.filter((task) => task.completed);
    } else if (filter === "pending") {
      filtered = filtered.filter((task) => !task.completed);
    }
    setFilteredTasks(filtered);
  }, [search, filter, tasks]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const filterLabel = {
    all: "All",
    completed: "Completed",
    pending: "Pending",
  }[filter];

  return (
    <div className="p-8 ml-64 mt-16">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/3"
        />
        <div className="relative" ref={dropdownRef}>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2"
            onClick={() => setDropdownOpen((open) => !open)}
            type="button"
          >
            {filterLabel}
            <svg
              className={`w-4 h-4 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${
                  filter === "all" ? "font-semibold text-blue-600" : ""
                }`}
                onClick={() => {
                  setFilter("all");
                  setDropdownOpen(false);
                }}
              >
                All
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${
                  filter === "completed" ? "font-semibold text-blue-600" : ""
                }`}
                onClick={() => {
                  setFilter("completed");
                  setDropdownOpen(false);
                }}
              >
                Completed
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${
                  filter === "pending" ? "font-semibold text-blue-600" : ""
                }`}
                onClick={() => {
                  setFilter("pending");
                  setDropdownOpen(false);
                }}
              >
                Pending
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <li key={task.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <p className="text-xs text-gray-400">Due: {task.dueDate}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.completed
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </div>
              <ProgressBar
                progress={task.progress ?? (task.completed ? 100 : 0)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded h-3 mt-2">
      <div
        className="h-3 rounded bg-blue-500 transition-all"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
