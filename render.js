(async () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // const url = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
  const url = "/shm.pdf"

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const renderPDFPage = async (pageNumber) => {
    const page = await pdf.getPage(pageNumber);

    const scale = 4;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.className = 'company-profile';
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext);
  }

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    if (pageNumber === 4) {
      continue;
    }
    await renderPDFPage(pageNumber);
  }

  window.addEventListener('resize', async () => {
    location.href = '/';
  });
})();
