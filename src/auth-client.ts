import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL, // e.g., http://localhost:8787
    user: {
        additionalFields: {
            irsz: {
                type: "number", // or "string" depending on your schema
                required: false,
            },
            utca: {
                type: "string",
                required: false,
            }
        }
    }
});