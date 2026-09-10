"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        padding: "8px 14px",
        backgroundColor: "#27272a",
        color: "#f4f4f5",
        border: "1px solid #3f3f46",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#27272a")}
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
