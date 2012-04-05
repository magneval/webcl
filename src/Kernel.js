Kernel = function( id, name, globalWS, localWS )
{
	this.id = id;
	this.name = name;
	this.src = "";
	this.globalWS = globalWS;
	this.localWS = localWS;
	this.blob = null;
}

Kernel.prototype.load = function()
{
	var kernelElement = document.getElementById( this.id );
	this.src = kernelElement.text;
	if (kernelElement.src != "") 
	{
      var mHttpReq = new XMLHttpRequest();
      mHttpReq.open("GET", kernelElement.src, false);
      mHttpReq.send(null);
      this.src = mHttpReq.responseText;
	} 
}

Kernel.prototype.build = function()
{
	var program = context.createProgramWithSource( this.src );

	try 
	{
		program.buildProgram ([devices[0]], "");
	} 
	catch(e) 
	{
		alert ("Failed to build WebCL program. Error "
			 + program.getProgramBuildInfo (devices[0], 
											WebCL.CL_PROGRAM_BUILD_STATUS)
			 + ":  " 
			 + program.getProgramBuildInfo (devices[0], 
											WebCL.CL_PROGRAM_BUILD_LOG));
		throw e;
	}
	this.blob = program.createKernel (this.name);
}

Kernel.prototype.run = function()
{
	cmdQueue.enqueueNDRangeKernel( this.blob, this.globalWS.length, [], 
                                  this.globalWS, this.localWS, []);
}

Kernel.prototype.toString = function()
{
	var str = "";
	str += "<br/>Kernel " + this.name + "<br/>";
	str += "Global work item size: " + this.globalWS + "<br/>";
	str += "Local work item size: " + this.localWS + "<br/>";
	return str;
}