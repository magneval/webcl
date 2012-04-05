Buffer = function( size )
{
	this.name = "";
	this.size = size;
	this.data = null;
	this.blob = null;
}

Buffer.prototype.create = function()
{
	this.blob = context.createBuffer (WebCL.CL_MEM_READ_ONLY, this.size);
}

Buffer.prototype.writeToDevice = function()
{
	//hardcode
	cmdQueue.enqueueWriteBuffer( this.blob, false, 0, this.size, this.data, [] );
}

Buffer.prototype.toString = function()
{
	var str = "";
	str += "<br/>Buffer " + this.name + "<br/>";
	str += "Num elements = " + this.data.length + "<br/>";
	str += "size: " + this.size + " bytes<br/>";
	return str;
}

Buffer.prototype.writeFromDevice = function()
{
	// Read the result buffer from OpenCL device
	cmdQueue.enqueueReadBuffer (this.blob, false, 0, this.size, this.data, []);    
	cmdQueue.finish (); //Finish all the operations
}


