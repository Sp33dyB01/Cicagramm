const convertToWebP = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result !== "string") {
                return reject(new Error("Invalid file format"));
            }
            const img = new Image();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1920;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH){
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                } 
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error("Could not get canvas context"));
                }
                ctx?.drawImage(img, 0, 0, width, height)
                canvas.toBlob((blob: Blob | null) =>{
                    if (!blob) {
                        return reject(new Error("Canvas to Blob conversion failed"));
                    }
                    const webPFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                        type: "image/webp",
                    });
                    resolve(webPFile);
                }, 'image/webp', 0.8);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    });
};
export default convertToWebP;