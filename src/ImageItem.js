ImageItem = function( domElement )
{
	this.domElement = domElement;
	this.width = domElement.width;
	this.height = domElement.height;
	this.size = this.width * this.height;
}

ImageItem.prototype.toString = function()
{
	var str = "";
	str += "<br/>Image size: " + this.size + " pixels ("+ this.width + " x " + this.height + ")<br/>";
	return str;
}