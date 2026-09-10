import { auth } from "@/lib/auth"; // Adjust this path if your auth configuration is in another folder
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
