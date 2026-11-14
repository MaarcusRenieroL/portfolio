"use client";

import { useRouter } from "next/navigation";
import { post } from "./api";

export function Logout() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="admin-header-link"
      onClick={async () => {
        await post("logout");
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
