const convertToWebP = (file: File): Promise<File | 0> => {
    return new Promise((resolve, reject) => {
        if (file.size === 0) {
            return resolve(0);
        }
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
            mimeType = ''; // Let browser sniff the real type
        }
        const blobWithGoodType = new Blob([file], { type: mimeType });
        const url = URL.createObjectURL(blobWithGoodType);

        const img = new Image();
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image (${file.name || 'unknown'}, type: ${file.type}, size: ${file.size} bytes)`));
        };
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1920;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context"));
            }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    return reject(new Error("Canvas to Blob conversion failed"));
                }
                const filename = file.name || "image.webp";
                const webPFile = new File([blob], filename.replace(/\.[^/.]+$/, ".webp"), {
                    type: "image/webp",
                });
                resolve(webPFile);
            }, 'image/webp', 0.8);
        };
        img.src = url;
    });
};
export default convertToWebP;