const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageNumDisplay = document.getElementById('page-num');

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      pdfDoc = pdf;
      totalPages = pdf.numPages;
      currentPage = 1;
      renderPage(currentPage);
    });
  };

  reader.readAsArrayBuffer(file);
});

function renderPage(pageNum) {
  pdfDoc.getPage(pageNum).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext);
    pageNumDisplay.textContent = `Página ${pageNum} de ${totalPages}`;
  });
}

prevBtn.addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage(currentPage);
});

nextBtn.addEventListener('click', () => {
  if (currentPage >= totalPages) return;
  currentPage++;
  renderPage(currentPage);
});
/*funcion dark*/

const toggleModeBtn = document.getElementById('toggle-mode');

toggleModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  toggleModeBtn.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
});


/*funcion editar pdf */

const textInput = document.getElementById('text-input');

canvas.addEventListener('dblclick', (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  const input = document.createElement('div');
  input.contentEditable = true;
  input.textContent = 'Texto';
  input.style.position = 'absolute';
  input.style.left = `${canvas.offsetLeft + x}px`;
  input.style.top = `${canvas.offsetTop + y}px`;
  input.style.font = '16px Arial';
  input.style.color = 'blue';
  input.style.padding = '2px 4px';
  input.style.borderRadius = '4px';
  input.style.background = 'transparent';
  input.style.outline = 'none';
  input.classList.add('editable-text');

  document.getElementById('text-layer').appendChild(input);
});

/*aplicar estilos al texto seleccionado */

const fontSelect = document.getElementById('font-select');
const colorPicker = document.getElementById('color-picker');
const fontSizeInput = document.getElementById('font-size');

function applyStyleToSelectedText() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const selectedNode = selection.anchorNode.parentElement;
  if (selectedNode.classList.contains('editable-text')) {
    selectedNode.style.fontFamily = fontSelect.value;
    selectedNode.style.color = colorPicker.value;
    selectedNode.style.fontSize = `${fontSizeInput.value}px`;
  }
}

fontSelect.addEventListener('change', applyStyleToSelectedText);
colorPicker.addEventListener('input', applyStyleToSelectedText);
fontSizeInput.addEventListener('input', applyStyleToSelectedText);
