
var s,
    saveBtn,
	generateBtn,
	originalCanvas,
	originalCanvasCTX,
	PIXEL_SIZE = 50,
	swatches = [],
	svg_count = 0,
	svg_loaded = [],
    latest_image = null,
    zoom = 0.1,
    CMD = false,
    ui = document.getElementById('ui'),
    msg = document.getElementById('message');

//prevent load on missed drag and drop
window.addEventListener("dragover",function(e){
  e = e || event;
  e.preventDefault();
},false);
window.addEventListener("drop",function(e){
  e = e || event;
  e.preventDefault();
},false);


document.body.addEventListener('keydown', function (e) {
    console.log(e.keyCode);

    switch (e.keyCode) {
        case 72: //H
            if (ui.style.display !== 'none') {
                ui.style.display = 'none';
            } else {
                ui.style.display = 'block';
            }

            e.preventDefault();
        break;
        case 93: //CMD
            CMD = true;
            e.preventDefault();
        break;
        case 187: //+
            if (CMD === true) {
                zoom += 0.05; 
                updateZoom();
            }
            e.preventDefault();
        break;
        case 189: //-
            if (CMD === true) {
                zoom -= 0.05;
                updateZoom();
            }
            e.preventDefault();
        break;
        case 48:
            if (CMD === true) {
                zoom = 0.1;
                updateZoom();
            }
            e.preventDefault();
        break;
        default:
        break;
    }
});

document.body.addEventListener('keyup', function (e) {

    switch (e.keyCode) {
        case 93:
            CMD = false;
        break;
    }
});

function updateZoom() {
    console.log('s', s);

    if (s) {
        s.node.style.transform = "scale(" + zoom + ")";
    }
}

init();

function init() {
	saveBtn = document.getElementById('save-btn');
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
		originalCanvasCTX.fillText('drag image here.', originalCanvas.width / 2 - 45, originalCanvas.height / 2);
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

        for (i = 0; i < swatches.length; i += 1) {
            swatches[i].destroy();
        }
        swatches = [];

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
			_x = 0, _y = 0,
			_r, _g, _b, _a,
			colorString,
			svgElement,
			_w = PIXEL_SIZE,
			random,
			group,
			content,
			matrix;

        msg.innerText = 'generating...';

		imgData = originalCanvasCTX.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
		px = imgData.data;

		s = new Snap(originalCanvas.width * _w, originalCanvas.height * _w);

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
					
					random = Math.floor(Math.random() * swatches[j].svgList.length);
										
					svgElement = swatches[j].svgList[random];
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
        
        msg.className = '';
	}

	function handle_generate_CLICK(e) {
		var i,
			j;
		
		svg_loaded = [];
		svg_count = 0;
		
        if (swatches.length === 0) {
            alert('NO COLORS SELECTED');
            return;
        }

        msg.className = 'show';
        msg.innerText = 'loading swatches';

		for (i = 0; i < swatches.length; i += 1) {
			swatches[i].load(handle_svg_LOAD);		
		}
	}
	
	function handle_svg_LOAD(e) {
		svg_count += 1;

		if (swatches.length == svg_count) {
            msg.innerText = 'generating';

            setTimeout(generate, 100);
		} else {
            msg.innerText = 'loading swatches ' + svg_count;
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
        if (!latest_image) {
		    resetCanvas();
        } else {
            drawImage(latest_image);
        }
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
		img.onload = function () {

            latest_image = img;

            drawImage(img);
			
			collectPixels();
		};

	}

    function drawImage(img) {
        originalCanvasCTX.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCanvasCTX.drawImage(img, 0, 0);
    }
}
