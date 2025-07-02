"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Firestore,
} from "firebase/firestore";
import { onAuthStateChanged, Auth, User } from "firebase/auth";

export function StreaksAndBadges() {
  const [user, setUser] = useState<{
    email: string | null;
    uid?: string;
  } | null>(null);
  const [streak, setStreak] = useState(0);
  const [hasBadge, setHasBadge] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);

  // Lazy-load Firebase
  useEffect(() => {
    const init = async () => {
      const { getFirebaseAuth, getFirestoreDB } = await import(
        "@/lib/firebase"
      );
      const authInstance = getFirebaseAuth();
      const dbInstance = getFirestoreDB();
      setAuth(authInstance);
      setDb(dbInstance);

      onAuthStateChanged(authInstance, (u: User | null) => {
        setUser(u ? { email: u.email, uid: u.uid } : null);
      });
    };
    if (typeof window !== "undefined") {
      init();
    }
  }, []);

  useEffect(() => {
    if (!user?.uid || !db) return;

    const fetchStreak = async () => {
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
      const day = new Date();
      while (true) {
        const dayStr = day.toISOString().split("T")[0];
        if (dates.has(dayStr)) {
          streakCount++;
          day.setDate(day.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(streakCount);

      // Award badge
      if (streakCount >= 7 && user.uid) {
        const userRef = doc(db, "users", user.uid);
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
  }, [user, db]);

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
