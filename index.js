console.log("Programmed by Harshit 🐼");

const url = "Landing-LTR.pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const container = document.getElementById("pdf-container");

async function renderPDF() {
    const pdf = await pdfjsLib.getDocument(url).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const baseViewport = page.getViewport({ scale: 1 });

        const screenWidth = window.innerWidth;
        const pdfWidth = baseViewport.width;

        const displayScale = Math.min(screenWidth / pdfWidth, 1);
        const outputScale = window.devicePixelRatio || 1;

        const visibleViewport = page.getViewport({
            scale: displayScale
        });

        const BLEED_FIX = 1.01;

        const renderViewport = page.getViewport({
            scale: displayScale * BLEED_FIX
        });

        const pageDiv = document.createElement("div");
        pageDiv.className = "pdf-page";

        pageDiv.style.width = `${Math.ceil(visibleViewport.width)}px`;
        pageDiv.style.height = `${Math.ceil(visibleViewport.height)}px`;
        pageDiv.style.overflow = "hidden";

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = Math.ceil(renderViewport.width * outputScale);
        canvas.height = Math.ceil(renderViewport.height * outputScale);

        canvas.style.width = `${Math.ceil(renderViewport.width)}px`;
        canvas.style.height = `${Math.ceil(renderViewport.height)}px`;

        pageDiv.appendChild(canvas);
        container.appendChild(pageDiv);

        const transform =
            outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

        await page.render({
            canvasContext: ctx,
            viewport: renderViewport,
            transform: transform
        }).promise;

        const annotations = await page.getAnnotations();

        annotations.forEach(annotation => {
            if (!annotation.url) return;

            const rect = pdfjsLib.Util.normalizeRect(
                visibleViewport.convertToViewportRectangle(annotation.rect)
            );

            const link = document.createElement("a");

            link.href = annotation.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.style.position = "absolute";
            link.style.left = `${rect[0]}px`;
            link.style.top = `${rect[1]}px`;
            link.style.width = `${rect[2] - rect[0]}px`;
            link.style.height = `${rect[3] - rect[1]}px`;
            link.style.zIndex = "10";
            link.style.cursor = "pointer";
            link.style.background = "transparent";

            pageDiv.appendChild(link);
        });
    }
}

renderPDF().catch(error => {
    console.error("PDF rendering error:", error);
});