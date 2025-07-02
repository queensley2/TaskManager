"use client";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [auth, setAuth] = useState<ReturnType<
    typeof import("firebase/auth").getAuth
  > | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initFirebase = async () => {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      setAuth(getFirebaseAuth());
      setFirebaseReady(true);
    };
    if (typeof window !== "undefined") {
      initFirebase();
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseReady || !auth) return;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: unknown) {
      let message = "Unknown error";
      if (error instanceof Error) {
        message = error.message;
      }
      alert(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSignUp}
        className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl text-black font-bold">Create an Account</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
        <p className="text-sm text-black text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log In
          </a>
        </p>
      </form>
    </div>
  );
}
