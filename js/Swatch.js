var Swatch = function (color) {
	//create swatch objects w/ canvas and drag/drop functionality
	
	var instance = this,
		canvas,
		ctx,
		WIDTH = PIXEL_SIZE;
	
	instance.loaded = false;
	instance.color = color;
	instance.colorString = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
	instance.svgList = [];
	instance.list = [];
	
	canvas = document.createElement('canvas');
	canvas.height = WIDTH;
	canvas.width = WIDTH * 2;
	ctx = canvas.getContext('2d');
	document.getElementById('ui').appendChild(canvas);
	
	canvas.addEventListener('dragover', handle_DRAG_OVER);
	canvas.addEventListener('dragenter', handle_DRAG_ENTER);
	canvas.addEventListener('dragleave', handle_DRAG_LEAVE);
	canvas.addEventListener('drop', handle_DROP);
	
	instance.load = function (callback) {
		
		var svg_loaded = 0,
			i;
		
		svgList = [];
		
		function handle_svg_LOAD(e) {
			svg_loaded += 1;
			instance.svgList.push(e);
			
			if (svg_loaded == instance.list.length) {
				callback();
			}
		}
		
		for (i = 0; i < instance.list.length; i += 1) {
			Snap.load(instance.list[i].src, handle_svg_LOAD);
		}
		
	};
	
	instance.draw = function () {
		var i;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		canvas.width = (instance.list.length + 1) * WIDTH;
		console.log(canvas.width, 'ok');
		
		ctx.beginPath();
		ctx.fillStyle = instance.colorString;
		ctx.fillRect(0, 0, WIDTH, WIDTH);
		ctx.closePath();
		
		for (i = 0; i < instance.list.length; i += 1) {
			ctx.drawImage(instance.list[i], (i + 1) * WIDTH, 0);
		}
	};

    instance.destroy = function () {
        document.getElementById('ui').removeChild(canvas);
    };
	
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

		var reader = new FileReader();
		reader.addEventListener('load', handle_IMG_LOAD.bind(this));
		reader.readAsDataURL(e.dataTransfer.files[0]);
	}

	function handle_IMG_LOAD(e) {
		var img;

		img = new Image();
		img.src = e.target.result;

		instance.list.push(img);
		
		instance.draw();
	}
	
	instance.draw();
}
