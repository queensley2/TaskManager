// Example: Add to your dashboard/page.tsx or a new Streaks component

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export function StreaksAndBadges() {
  const [user, setUser] = useState<{
    email: string | null;
    uid?: string;
  } | null>(null);
  const [streak, setStreak] = useState(0);
  const [hasBadge, setHasBadge] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { email: u.email, uid: u.uid } : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchStreak = async () => {
      // Get all completed tasks for the user
      const q = query(
        collection(db, "tasks"),
        where("user", "==", user.email),
        where("completed", "==", true)
      );
      const snapshot = await getDocs(q);
      const dates = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.dueDate) dates.add(data.dueDate);
      });

      // Calculate streak
      let streakCount = 0;
      let day = new Date();
      for (;;) {
        const dayStr = day.toISOString().split("T")[0];
        if (dates.has(dayStr)) {
          streakCount++;
          day.setDate(day.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(streakCount);

      // Award badge if streak >= 7
      if (streakCount >= 7) {
        const userRef = doc(db, "users", user.uid!);
        const userSnap = await getDoc(userRef);
        if (
          !userSnap.exists() ||
          !userSnap.data().badges?.includes("7-day-streak")
        ) {
          await updateDoc(userRef, {
            badges: arrayUnion("7-day-streak"),
          });
        }
        setHasBadge(true);
      } else {
        setHasBadge(false);
      }
    };
    fetchStreak();
  }, [user]);

  return (
    <div className="mb-6">
      <div className="text-lg font-semibold">
        🔥 Daily Streak: <span className="text-blue-600">{streak}</span> day
        {streak === 1 ? "" : "s"}
      </div>
      {hasBadge && (
        <div className="mt-2 inline-block px-3 py-1 bg-yellow-300 text-yellow-900 rounded-full font-bold">
          🏅 7-Day Streak Badge!
        </div>
      )}
    </div>
  );
}
