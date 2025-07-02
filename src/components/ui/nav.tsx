"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Home",
  "/dashboard/tasks": "Tasks",
  "/dashboard/add": "Add Task",
  "/dashboard/settings": "Settings",
};

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user); // Add this line

      setUser(user ? { email: user.email } : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("my-dark");
    } else {
      document.documentElement.classList.remove("my-dark");
    }
  }, [darkMode]);

  const pageTitle = pageTitles[pathname] || "Tasknest";

  return (
    <nav className="w-[1109] h-16 flex items-center justify-between px-8 bg-white border-b fixed top-0 right-0 left-64  z-10">
      <span className="text-xl font-semibold text-gray-800">{pageTitle}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
        {user ? (
          <span className="text-black text-sm">{user.email}</span>
        ) : (
          <span className="text-gray-400 text-sm">Not signed in</span>
        )}
        {/* Optionally, add a user avatar or dropdown here */}
      </div>
    </nav>
  );
}
