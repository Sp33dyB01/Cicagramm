import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL, // e.g., http://localhost:8787
    user: {
        additionalFields: {
            irsz: {
                type: "number",
                required: false,
            },
            utca: {
                type: "string",
                required: false,
            },
            hazszam: {
                type: "number",
                required: false,
            },
            pKep: {
                type: "string",
                required: false,
            },
            admin: {
                type: "number",
                required: true,
                default: 0
            },
            lat: {
                type: "number",
                required: false,
            },
            lon: {
                type: "number",
                required: false,
            },
            varos: {
                type: "string",
                required: false,
            },
            rBemutat: {
                type: "string",
                required: false,
            }
        }
    }
});