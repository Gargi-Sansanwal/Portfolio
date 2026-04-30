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

        const pageDiv = document.createElement("div");
        pageDiv.className = "pdf-page";

        pageDiv.style.width = `${viewport.width}px`;
        pageDiv.style.height = `${viewport.height}px`;

        const innerDiv = document.createElement("div");
        innerDiv.className = "pdf-inner";
        innerDiv.style.width = `${viewport.width}px`;
        innerDiv.style.height = `${viewport.height}px`;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = Math.round(viewport.width * outputScale);
        canvas.height = Math.round(viewport.height * outputScale);

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const transform =
            outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

        innerDiv.appendChild(canvas);
        pageDiv.appendChild(innerDiv);
        container.appendChild(pageDiv);

        await page.render({
            canvasContext: ctx,
            viewport: viewport,
            transform: transform
        }).promise;

        const annotations = await page.getAnnotations();

        annotations.forEach(annotation => {
            const linkUrl = annotation.url || annotation.unsafeUrl;

            if (!linkUrl) return;
            if (!annotation.rect) return;

            const rect = pdfjsLib.Util.normalizeRect(
                viewport.convertToViewportRectangle(annotation.rect)
            );

            const link = document.createElement("a");

            link.className = "pdf-link";
            link.href = linkUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.style.left = `${rect[0]}px`;
            link.style.top = `${rect[1]}px`;
            link.style.width = `${rect[2] - rect[0]}px`;
            link.style.height = `${rect[3] - rect[1]}px`;

            innerDiv.appendChild(link);
        });
    }
}

renderPDF().catch(error => {
    console.error("PDF rendering error:", error);
});