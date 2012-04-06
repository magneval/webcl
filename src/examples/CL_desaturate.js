CL_desaturate = function( domElement )
{
	CL_app.call( this );
	this.domElement = domElement;
	this.canvas = null;
}

CL_desaturate.prototype = new CL_app();
CL_desaturate.prototype.constructor = CL_desaturate;

CL_desaturate.prototype.init = function () 
{
	//setupCanvas();
	this.canvas = new CanvasItem( document.getElementById("canvasImg"),  document.getElementById("srcimg") );
	this.canvas.setupCanvas();
	
	try 
	{
		// Get pixel data from canvas
		var width = this.canvas.image.width;
		var height = this.canvas.image.height;
		var pixels = this.canvas.pixels;

		// Setup buffers
		var bufSize = width * height * 4; // size in bytes
		
		// Reserve buffers
		this.bufsIn = [ new Buffer( bufSize ) ];
		for( var i = 0; i < this.bufsIn.length; i=i+1)
		{
			this.bufsIn[i].create();
		}
		
		this.bufOut = new Buffer( bufSize );
		this.bufOut.create();
		this.bufOut.data = pixels.data;

		// Init ND-range 
		var localWS = [16,4];  
		var globalWS = [Math.ceil (width / localWS[0]) * localWS[0], 
						Math.ceil (height / localWS[1]) * localWS[1]];
						
		// Create and build kernal and program for the first device
		this.kernels = [ new Kernel("clProgramDesaturate", "clDesaturate", globalWS, localWS) ];
		for( var i = 0; i < this.kernels.length; i=i+1)
		{
			this.kernels[i].load();
			this.kernels[i].build();
		}

		// Set arguments
		this.kernels[0].blob.setKernelArg (0, this.bufsIn[0].blob);
		this.kernels[0].blob.setKernelArg (1, this.bufOut.blob);
		this.kernels[0].blob.setKernelArg (2, width, WebCL.types.UINT);
		this.kernels[0].blob.setKernelArg (3, height, WebCL.types.UINT);

		// Write the buffer to OpenCL device memory
		this.bufsIn[0].writeToDevice( this.bufOut.data );
	} 
	catch(e) 
	{
		this.domElement.innerHTML += 
		  "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;
	}
}

CL_desaturate.prototype.runAll = function()
{
	// Execute (enqueue) kernel
	for( var i = 0; i < this.kernels.length; i=i+1)
	{
		this.kernels[i].run();
	}
}

CL_desaturate.prototype.printDebug = function()
{
	this.domElement.innerHTML += this.canvas.image.toString();
	
	for( var i = 0; i < this.bufsIn.length; i=i+1)
	{
		this.domElement.innerHTML += this.bufsIn[i].toString();
	}
	for( var i = 0; i < this.kernels.length; i=i+1)
	{
		this.domElement.innerHTML += this.kernels[i].toString();
	}
	this.domElement.innerHTML += "<br>Done.";
}

CL_desaturate.prototype.printResult = function()
{
	// Read the result buffer from OpenCL device
	this.bufOut.writeFromDevice();
		
	this.canvas.pixels.data = this.bufOut.data;
	this.canvas.imgContext.putImageData( this.canvas.pixels, 0, 0 );
}