CL_vectorAdd = function( domElement, numElements )
{
	CL_app.call( this );
	this.domElement = domElement;
	this.numElements = numElements;
}

CL_vectorAdd.prototype = new CL_app();
CL_vectorAdd.prototype.constructor = CL_vectorAdd;

CL_vectorAdd.prototype.init = function () 
{
	try 
	{
		// Generate input vectors
		var bufSize = this.numElements * 4; // size in bytes
		this.bufsIn = [ new Buffer( bufSize ), new Buffer( bufSize ) ];
		
		for ( var i=0; i < this.bufsIn.length;  i=i+1) 
		{
			this.bufsIn[i].data = new Uint32Array(this.numElements);    
		}
		
		for ( var i=0; i < this.bufsIn.length;  i=i+1) 
		{
			for ( var j=0; j < this.numElements;  j=j+1) 
			{
				this.bufsIn[i].data[j] = Math.floor(Math.random() * 100); //Random number 0..99
			}
		}
						 
		// Reserve buffers
		for( var i = 0; i < this.bufsIn.length; i=i+1)
		{
			this.bufsIn[i].create();
		}
		this.bufOut = new Buffer( bufSize );
		this.bufOut.data = new Uint32Array(this.numElements);
		this.bufOut.create();
		
		// Init ND-range
		var localWS = [8];
		var globalWS = [Math.ceil (this.numElements / localWS) * localWS];
		
		// Create and build program for the first device
		this.kernels = [ new Kernel("clProgramVectorAdd", "ckVectorAdd", globalWS, localWS) ];
		for( var i = 0; i < this.kernels.length; i=i+1)
		{
			this.kernels[i].load();
			this.kernels[i].build();
		}

		// Create kernel and set arguments
		this.kernels[0].blob.setKernelArg (0, this.bufsIn[0].blob);
		this.kernels[0].blob.setKernelArg (1, this.bufsIn[1].blob);    
		this.kernels[0].blob.setKernelArg (2, this.bufOut.blob);
		this.kernels[0].blob.setKernelArg (3, this.numElements, WebCL.types.UINT);
		
		// Write the buffer to OpenCL device memory
		for( var i = 0; i < this.bufsIn.length; i=i+1)
		{
			this.bufsIn[i].writeToDevice();
		}	
	} 
	catch(e) 
	{
		this.domElement	+= "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;
	}
}

CL_vectorAdd.prototype.runAll = function()
{
	// Execute (enqueue) kernel
	for( var i = 0; i < this.kernels.length; i=i+1)
	{
		this.kernels[i].run();
	}
}

CL_vectorAdd.prototype.printDebug = function()
{
	for( var i = 0; i < this.bufsIn.length; i=i+1)
	{
		this.domElement.innerHTML += this.bufsIn[i].toString();
	}
	for( var i = 0; i < this.kernels.length; i=i+1)
	{
		this.domElement.innerHTML += this.kernels[i].toString();
	}
}

CL_vectorAdd.prototype.printResult = function()
{
	// Read the result buffer from OpenCL device
	this.bufOut.writeFromDevice();

	//Print input vectors and result vector
	for( var i = 0; i < this.bufsIn.length; i=i+1)
	{
		this.domElement.innerHTML += "<br>Buffer[" + i + "] = "; 
		for (var j = 0; j < this.bufsIn[i].data.length; j = j+1) 
		{
			this.domElement.innerHTML += this.bufsIn[i].data[j] + ", ";
		}
	}
	
	this.domElement.innerHTML += "<br>Result = ";
	for (var i = 0; i < this.bufOut.data.length; i=i+1) 
	{
		this.domElement.innerHTML += this.bufOut.data[i] + ", ";
	}
}