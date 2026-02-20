import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "../worker/auth"; // import type

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL, // e.g., http://localhost:8787
    plugins: [inferAdditionalFields<Auth>()]
});