"use client";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Home", path: "/dashboard" },
  { name: "Tasks", path: "/dashboard/tasks" },
  { name: "Add Task", path: "/dashboard/add" },
  { name: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getFirebaseAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <aside className="h-screen w-64 bg-white shadow flex flex-col justify-between fixed">
      <div>
        <div className="flex items-center justify-center h-20 border-b">
          <span className="text-2xl font-bold text-blue-600">Tasknest</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`text-left px-4 py-2 rounded transition ${
                pathname === item.path
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
