CL_desaturate = function( domElement )
{
	CL_app.call( this );
	this.domElement = domElement;
	//this.numElements = numElements;
}

CL_desaturate.prototype = new CL_app();
CL_desaturate.prototype.constructor = CL_desaturate;

ImageItem = function( domElement )
{
	this.domElement = domElement;
	this.width = domElement.width;
	this.height = domElement.height;
}

CanvasItem = function( domElement, srcDom )
{
	this.domElement = domElement;
	this.srcDom = srcDom;
	this.image = new ImageItem( srcDom );
	this.imgContext = this.domElement.getContext("2d");
	this.pixels = null;
}

CanvasItem.prototype.setupCanvas = function()
{
	try 
	{	
		this.imgContext.drawImage (this.image.domElement, 0, 0, this.image.width, this.image.height);
		// Get pixel data from canvas
		this.pixels = this.imgContext.getImageData(0, 0, this.image.width, this.image.height);
		
		// Dimm the existing canvas to highlight any errors we might get.
		// This does not affect the already retrieved pixel data.
		this.imgContext.fillStyle = "rgba(0,0,0,0.7)";
		this.imgContext.fillRect(0, 0, width, height);
	} 
	catch(e) 
	{
		/*document.getElementById("output").innerHTML += 
		  "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;*/
	}
}

CL_desaturate.prototype.init = function () 
{
	//setupCanvas();
	var canvas = new CanvasItem( document.getElementById("canvasImg"),  document.getElementById("srcimg") );
	canvas.setupCanvas();
	
	try 
	{
		// Get pixel data from canvas
		var width = canvas.image.width;
		var height = canvas.image.height;
		var pixels = canvas.pixels;

		// Setup buffers
		var imgSize = width * height;
		var bufSize = imgSize * 4; // size in bytes
		
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
		cmdQueue.enqueueWriteBuffer (this.bufsIn[0].blob, false, 0, bufSize, this.bufOut.data, []);
		
		// Execute (enqueue) kernel			  
		this.kernels[0].run();

		// Read the result buffer from OpenCL device
		this.bufOut.writeFromDevice();
		
		pixels.data = this.bufOut.data;
		canvas.imgContext.putImageData (pixels, 0, 0);

		// print results
		this.domElement.innerHTML += "<br>Image size: " + imgSize + " pixels ("
						 + width + " x " + height + ")";
		
		this.domElement.innerHTML += "<br>Buffer size: " + bufSize + " bytes";

		this.domElement.innerHTML += "<br>work group dimensions: " + globalWS.length;
		for (var i = 0; i < globalWS.length; ++i)
		{
			this.domElement.innerHTML += "<br>global work item size[" + i + "]: " + globalWS[i];
		}
		for (var i = 0; i < localWS.length; ++i)
		{
			this.domElement.innerHTML += "<br>local work item size[" + i + "]: " + localWS[i];
		}
		  
		this.domElement.innerHTML += "<br>Done.";
	} 
	catch(e) 
	{
		this.domElement.innerHTML += 
		  "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;
	}
}