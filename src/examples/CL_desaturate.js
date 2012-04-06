CL_desaturate = function( domElement )
{
	CL_app.call( this );
	this.domElement = domElement;
	//this.numElements = numElements;
}

CL_desaturate.prototype = new CL_app();
CL_desaturate.prototype.constructor = CL_desaturate;

function setupCanvas () 
{
	try 
	{
		var canvasImg = document.getElementById("canvasImg");
		var canvasImgcontext = canvasImg.getContext("2d");
		var srcImg = document.getElementById("srcimg");
		canvasImg.width = srcImg.width;
		canvasImg.height = srcImg.height;
		canvasImgcontext.drawImage (srcImg, 0, 0, srcImg.width, srcImg.height);
	} 
	catch(e) 
	{
		document.getElementById("output").innerHTML += 
		  "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;
	}
}

function loadKernel(id){
  var kernelElement = document.getElementById(id);
  var kernelSource = kernelElement.text;
  if (kernelElement.src != "") {
      var mHttpReq = new XMLHttpRequest();
      mHttpReq.open("GET", kernelElement.src, false);
      mHttpReq.send(null);
      kernelSource = mHttpReq.responseText;
  } 
  return kernelSource;
}

CL_desaturate.prototype.init = function () 
{
	setupCanvas();
	
	try 
	{

		// Get pixel data from canvas
		var canvasImg = document.getElementById("canvasImg");
		var canvasImgcontext = canvasImg.getContext("2d");
		var width = canvasImg.width;
		var height = canvasImg.height;
		var pixels = canvasImgcontext.getImageData(0, 0, width, height);

		// Dimm the existing canvas to highlight any errors we might get.
		// This does not affect the already retrieved pixel data.
		canvasImgcontext.fillStyle = "rgba(0,0,0,0.7)";
		canvasImgcontext.fillRect(0, 0, width, height);
		
		// Setup buffers
		var imgSize = width * height;
		this.domElement.innerHTML += "<br>Image size: " + imgSize + " pixels ("
						 + width + " x " + height + ")";
		var bufSize = imgSize * 4; // size in bytes
		this.domElement.innerHTML += "<br>Buffer size: " + bufSize + " bytes";
		
		// Reserve buffers
		this.bufsIn = [ new Buffer( bufSize ) ];
		for( var i = 0; i < this.bufsIn.length; i=i+1)
		{
			this.bufsIn[i].create();
		}
		
		this.bufOut = new Buffer( bufSize );
		this.bufOut.create();
		
		// Reserve buffers
		for( var i = 0; i < this.bufsIn.length; i=i+1)
		{
			this.bufsIn[i].create();
		}

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

		// Create command queue using the first available device
		var cmdQueue = context.createCommandQueue (devices[0], 0);

		// Write the buffer to OpenCL device memory
		cmdQueue.enqueueWriteBuffer (this.bufsIn[0].blob, false, 0, bufSize, pixels.data, []);
		
		this.domElement.innerHTML += "<br>work group dimensions: " + globalWS.length;
		for (var i = 0; i < globalWS.length; ++i)
		  this.domElement.innerHTML += "<br>global work item size[" + i + "]: " + globalWS[i];
		for (var i = 0; i < localWS.length; ++i)
		  this.domElement.innerHTML += "<br>local work item size[" + i + "]: " + localWS[i];
		
		// Execute (enqueue) kernel
		cmdQueue.enqueueNDRangeKernel(this.kernels[0].blob, globalWS.length, [], 
									  globalWS, localWS, []);

		// Read the result buffer from OpenCL device
		cmdQueue.enqueueReadBuffer (this.bufOut.blob, false, 0, bufSize, pixels.data, []);
		cmdQueue.finish (); //Finish all the operations
		
		canvasImgcontext.putImageData (pixels, 0, 0);

		this.domElement.innerHTML += "<br>Done.";
	} 
	catch(e) 
	{
		this.domElement.innerHTML += 
		  "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;
	}
}