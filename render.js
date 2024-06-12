(async () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // const url = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
  const url = "/shm.pdf"

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const renderPDFPage = async (pageNumber, containerWidth) => {
    const page = await pdf.getPage(pageNumber);

    const scale = containerWidth / page.view[2];
    const viewport = page.getViewport({ scale });

    const container = document.createElement('div');
    container.id = `page-${pageNumber}`
    container.className = 'page-container';
    document.body.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.className = 'page-canvas';
    container.appendChild(canvas);

    const context = canvas.getContext('2d');
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext);

    const annotations = await page.getAnnotations({ intent: 'display' });
    annotations.forEach(annotation => {
      if (annotation.subtype === 'Link') {
        const link = document.createElement('a');
        if (annotation.url) {
          link.href = annotation.url;
          link.target = '_blank';
        } else if (annotation.dest) {
          link.href = `#page-${annotation.dest[0].num}`;
        }
        link.style.position = 'absolute';
        link.style.left = `${annotation.rect[0] * scale}px`;
        link.style.top = `${(viewport.height - annotation.rect[3] * scale)}px`;
        link.style.width = `${(annotation.rect[2] - annotation.rect[0]) * scale}px`;
        link.style.height = `${(annotation.rect[3] - annotation.rect[1]) * scale}px`;
        container.appendChild(link);
      }
    });
  }

  const renderAllPages = async (containerWidth) => {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      if (pageNumber === 4) {
        continue;
      }
      await renderPDFPage(pageNumber, containerWidth);
    }
  }

  let bodyWidth = document.body.clientWidth;
  await renderAllPages(bodyWidth)

  window.addEventListener('resize', async () => {
    document.querySelectorAll('.page-container').forEach(container => container.remove());
    bodyWidth = document.body.clientWidth;
    await renderAllPages(bodyWidth);
  });
})();