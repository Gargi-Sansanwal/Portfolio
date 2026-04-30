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

        const viewport = page.getViewport({
            scale: displayScale
        });

        const renderViewport = page.getViewport({
            scale: displayScale * outputScale
        });

        const pageDiv = document.createElement("div");
        pageDiv.className = "pdf-page";
        pageDiv.style.width = `${viewport.width}px`;
        pageDiv.style.height = `${viewport.height}px`;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        pageDiv.appendChild(canvas);
        container.appendChild(pageDiv);

        await page.render({
            canvasContext: ctx,
            viewport: renderViewport
        }).promise;

        const annotations = await page.getAnnotations();

        annotations.forEach(annotation => {
            if (!annotation.url) return;

            const rect = pdfjsLib.Util.normalizeRect(
                viewport.convertToViewportRectangle(annotation.rect)
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
            link.style.background = "rgba(255, 0, 0, 0)";

            pageDiv.appendChild(link);
        });
    }
}

renderPDF().catch(error => {
    console.error("PDF rendering error:", error);
});