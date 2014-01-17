
var originalCanvas,
	originalCanvasCTX;

init();

function init() {
	originalCanvas = document.getElementById('original-canvas'),
	originalCanvasCTX = originalCanvas.getContext('2d');
	
	resetCanvas();
	
	originalCanvas.addEventListener('dragover', handle_DRAG_OVER);
	originalCanvas.addEventListener('dragenter', handle_DRAG_ENTER);
	originalCanvas.addEventListener('dragleave', handle_DRAG_LEAVE);
	originalCanvas.addEventListener('drop', handle_DROP);
}

function resetCanvas() {
	originalCanvasCTX.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
	originalCanvasCTX.font = '10pt Calibri';
	originalCanvasCTX.fillText('drag image here.', originalCanvas.width / 2 - 40, originalCanvas.height / 2);
}


function handle_DRAG_OVER(e) {
	e.preventDefault();
	console.log('drag over');
}

function handle_DRAG_ENTER(e) {
	console.log('drag enter');
}

function handle_DRAG_LEAVE(e) {
	console.log('drag leave');
}

function handle_DROP(e) {
	e.preventDefault();
	console.log('drop');

	var reader = new FileReader();
	reader.addEventListener('load', handle_MODEL_LOAD);
	reader.readAsDataURL(e.dataTransfer.files[0]);
}

function handle_MODEL_LOAD(e) {
	var img;
		
	img = new Image();
	img.src = e.target.result;

	originalCanvasCTX.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
	originalCanvasCTX.drawImage(img, 0, 0);
}