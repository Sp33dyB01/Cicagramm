import { useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SelectFelhasznalo } from "../../worker/schema"
import { useToast } from "../Toast"

export function useLike(user?: SelectFelhasznalo | null) {
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ cId, liked }: { cId: string, liked: boolean }) => {
            const method = liked ? 'DELETE' : 'POST';
            const response = await fetch(`/api/kedvencek/${cId}`, { method });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return { cId, liked };
        },
        onSuccess: ({ cId, liked }) => {
            console.log(`Sikeresen ${liked ? 'unlikeolt' : 'likeolt'}! ${cId}`);
            queryClient.invalidateQueries({ queryKey: ['cats'] });
            queryClient.invalidateQueries({ queryKey: ['cat', cId] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            console.error(error);
        }
    });

    const handleAction = (itemId: string, liked: boolean) => {
        if (!user) {
            showToast("Nincsen bejelentkezve!", "warning");
            return false;
        }

        if (timers.current[itemId])
            clearTimeout(timers.current[itemId]);
        
        timers.current[itemId] = setTimeout(() => {
            mutation.mutate({ cId: itemId, liked });
            delete timers.current[itemId];
        }, 1000);

        return true;
    }

    return { handleAction };
}