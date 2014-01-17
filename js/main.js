
var generateBtn,
	originalCanvas,
	originalCanvasCTX,
	swatches = [],
	svg_count = 0,
	svg_loaded = [];

init();

function init() {
	generateBtn = document.getElementById('generate-btn');
	originalCanvas = document.getElementById('original-canvas');
	originalCanvasCTX = originalCanvas.getContext('2d');
	
	resetCanvas();
	
	generateBtn.addEventListener('click', handle_generate_CLICK);
	
	originalCanvas.addEventListener('dragover', handle_DRAG_OVER);
	originalCanvas.addEventListener('dragenter', handle_DRAG_ENTER);
	originalCanvas.addEventListener('dragleave', handle_DRAG_LEAVE);
	originalCanvas.addEventListener('drop', handle_DROP);

	function resetCanvas() {
		originalCanvasCTX.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
		originalCanvasCTX.fillStyle = 'black';
		originalCanvasCTX.font = '10pt Calibri';
		originalCanvasCTX.fillText('drag image here.', originalCanvas.width / 2 - 40, originalCanvas.height / 2);
	}

	function collectPixels() {	
		var i, j, k,
			_r, _g, _b, _a,
			imgData,
			px,
			pixel,
			pixelCollection = [];

		imgData = originalCanvasCTX.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
		px = imgData.data;

		for (i = 0; i < px.length; i += 4) {
			_r = px[i];
			_g = px[i + 1];
			_b = px[i + 2];
			_a = px[i + 3];
			pixel = {r: _r, g: _g, b: _b, a: _a};
			
			k = 0;

			for (j = 0; j < pixelCollection.length; j += 1) {
				if (JSON.stringify(pixelCollection[j]) !== JSON.stringify(pixel)) {				
					k += 1;
				}
			}

			if (k == pixelCollection.length) {
				pixelCollection.push(pixel);
			}

			if (pixelCollection.length === 0) {
				pixelCollection.push(pixel);
			}
		}

		drawSwatches(pixelCollection);	
	}

	function drawSwatches(collection) {
		
		var i,
			swatch;

		for (i = 0; i < collection.length; i += 1) {
			swatch = new Swatch(collection[i]);
			swatches.push(swatch);
		}
		
	}

	//TODO:: move this into a worker
	function generate() {
		var imgData,
			px,
			i, j,
			s,
			_x = 0, _y = 0,
			_r, _g, _b, _a,
			colorString,
			svgElement,
			_w = 50,
			group,
			content,
			matrix;

		imgData = originalCanvasCTX.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
		px = imgData.data;

		s = new Snap(10000, 10000);

		for (i = 0; i < px.length; i += 4) {
			_r = px[i];
			_g = px[i + 1];
			_b = px[i + 2];
			_a = px[i + 3];
			colorString = 'rgba(' + _r + ', ' + _g + ', ' + _b + ', ' + _a + ')';
			
			for (j = 0; j < swatches.length; j += 1) {
								
				if (colorString == swatches[j].colorString) {
					
					matrix = new Snap.Matrix();
					matrix.translate(_x * _w, _y * _w);
					
					svgElement = swatches[j].svgList[0];
					content = svgElement.select('g').clone();
					content.transform(matrix.toTransformString());
					s.append(content);
					
					_x += 1;
					if (_x == originalCanvas.width) {
						_x = 0;
						_y += 1;
					}
					
				}
			}			
		}
	}

	function handle_generate_CLICK(e) {
		var i,
			j;
		
		svg_loaded = [];
		svg_count = 0;
		
		for (i = 0; i < swatches.length; i += 1) {
			swatches[i].load(handle_svg_LOAD);		
		}
	}
	
	function handle_svg_LOAD(e) {
		svg_count += 1;
		
		if (swatches.length == svg_count) {
			generate()
		}
	}
	
	function handle_DRAG_OVER(e) {
		e.preventDefault();
		console.log('drag over');
	}

	function handle_DRAG_ENTER(e) {
		console.log('drag enter');
		originalCanvasCTX.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
		originalCanvasCTX.fillStyle = 'green';
		originalCanvasCTX.beginPath();
		originalCanvasCTX.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
		originalCanvasCTX.closePath();
	}

	function handle_DRAG_LEAVE(e) {
		console.log('drag leave');
		resetCanvas();
	}

	function handle_DROP(e) {
		e.preventDefault();
		console.log('drop');

		var reader = new FileReader();
		reader.addEventListener('load', handle_IMG_LOAD);
		reader.readAsDataURL(e.dataTransfer.files[0]);
	}

	function handle_IMG_LOAD(e) {
		var img;

		img = new Image();
		img.src = e.target.result;

		originalCanvasCTX.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
		originalCanvasCTX.drawImage(img, 0, 0);

		collectPixels();
	}
}