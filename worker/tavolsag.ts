interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

export interface Coordinates {
    lat: number;  // Better to convert to number for DB
    lon: number;
    displayName: string;
}


const getCoordinates = async (adress: string): Promise<Coordinates | null> => {
    if (!adress || adress.trim() === "") {
        return null;
    }
    const query = encodeURIComponent(adress);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Cicagramm-Projekt/1.0'
            }
        });
        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as NominatimResult[];
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
        else {
            return null;
        }

    } catch (e) {
        console.log("Geocoding failed: ", e);
        return null;
    }
}
const getDistance = (coord1: Coordinates, coord2: Coordinates) => {
    if (!coord1 || !coord2) {
        return null;
    }
    const R = 6371;
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);
    const radLat1 = toRad(coord1.lat);
    const radLat2 = toRad(coord2.lat);
    const a = (1 - Math.cos(dLat) + Math.cos(radLat1) * Math.cos(radLat2) * (1 - Math.cos(dLon))) / 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(value: number) {
    return value * Math.PI / 180;
}
export { getCoordinates, getDistance };
