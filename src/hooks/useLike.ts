import { useRef } from "react"
import type { SelectFelhasznalo } from "../../worker/schema"
import { useToast } from "../Toast"

export function useLike(user?: SelectFelhasznalo | null) {
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const { showToast } = useToast();

    const sendData = async (cId: string, liked: boolean) => {
        if (!liked) {
            try {
                const response = await fetch(`/api/kedvencek/${cId}`, { method: 'POST' })
                if (response.ok)
                    console.log(`Sikeresen likeolt! ${cId}`)
                else
                    console.error(response.statusText)
            }
            catch (e) {
                console.error(e)
            }
        }
        if (liked) {
            try {
                const response = await fetch(`/api/kedvencek/${cId}`, { method: 'DELETE' })
                if (response.ok)
                    console.log(`Sikeresen unlikeolt! ${cId}`)
                else
                    console.error(response.statusText)
            }
            catch (e) {
                console.error(e)
            }
        }
    };

    const handleAction = (itemId: string, liked: boolean) => {
        if (!user) {
            showToast("Nincsen bejelentkezve!", "warning");
            return false;
        }

        if (timers.current[itemId])
            clearTimeout(timers.current[itemId]);
        timers.current[itemId] = setTimeout(() => {
            sendData(itemId, liked);
            delete timers.current[itemId];
        }, 1000);

        return true;
    }

    return { handleAction };
}