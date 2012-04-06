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