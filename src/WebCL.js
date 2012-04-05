var context = null;
var cmdQueue = null;
var devices = [];
var programs = [];
var platforms = [];

WebCLEasing = function( domElement )
{
	this.domElement = domElement;
}

WebCLEasing.prototype.detectCL = function()
{
	// First check if the WebCL extension is installed at all
	if ( undefined == window.WebCL ) 
	{
		this.domElement.innerHTML += ("Unfortunately your system does not support WebCL. " +
          "Make sure that you have both the OpenCL driver " +
          "and the WebCL browser extension installed.<br/>");
		return false;
	}

	// Get a list of available CL platforms, and another list of the
	// available devices on each platform. If there are no platforms,
	// or no available devices on any platform, then we can conclude
	// that WebCL is not available.
	try 
	{
		platforms = WebCL.getPlatformIDs();
		for (var i in platforms) 
		{
			var platform = platforms[i];
			devices[i] = platform.getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL);
		}
		// Setup WebCL context using the default device of the first platform 
		context = WebCL.createContextFromType ([WebCL.CL_CONTEXT_PLATFORM, 
												platforms[0]],
											   WebCL.CL_DEVICE_TYPE_DEFAULT);
		devices = context.getContextInfo(WebCL.CL_CONTEXT_DEVICES);
		
		// Create command queue using the first available device
		cmdQueue = context.createCommandQueue (devices[0], 0);
		
		this.domElement.innerHTML += ("Excellent! Your system does support WebCL.<br/>");
		return true;
	} 
	catch (e) 
	{
		this.domElement.innerHTML += ("Unfortunately platform or device inquiry failed.<br/>");
		return false;
	}
}

WebCLEasing.prototype.dumpCLData = function() 
{
  var s = "";
  try {
    // List of OpenCL information parameter names.

    var infos = [ [ "CL_DEVICE_ADDRESS_BITS", WebCL.CL_DEVICE_ADDRESS_BITS ],
      [ "CL_DEVICE_AVAILABLE", WebCL.CL_DEVICE_AVAILABLE ],
      [ "CL_DEVICE_COMPILER_AVAILABLE", WebCL.CL_DEVICE_COMPILER_AVAILABLE ],
      [ "CL_DEVICE_DOUBLE_FP_CONFIG", WebCL.CL_DEVICE_DOUBLE_FP_CONFIG ],
      [ "CL_DEVICE_ENDIAN_LITTLE", WebCL.CL_DEVICE_ENDIAN_LITTLE ],
      [ "CL_DEVICE_ERROR_CORRECTION_SUPPORT", WebCL.CL_DEVICE_ERROR_CORRECTION_SUPPORT ],
      [ "CL_DEVICE_EXECUTION_CAPABILITIES", WebCL.CL_DEVICE_EXECUTION_CAPABILITIES ],
      [ "CL_DEVICE_EXTENSIONS", WebCL.CL_DEVICE_EXTENSIONS ],
      [ "CL_DEVICE_GLOBAL_MEM_CACHE_SIZE", WebCL.CL_DEVICE_GLOBAL_MEM_CACHE_SIZE ],
      [ "CL_DEVICE_GLOBAL_MEM_CACHE_TYPE", WebCL.CL_DEVICE_GLOBAL_MEM_CACHE_TYPE ],
      [ "CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE", WebCL.CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE ],
      [ "CL_DEVICE_GLOBAL_MEM_SIZE", WebCL.CL_DEVICE_GLOBAL_MEM_SIZE ],
      [ "CL_DEVICE_HALF_FP_CONFIG", WebCL.CL_DEVICE_HALF_FP_CONFIG ],
      [ "CL_DEVICE_IMAGE_SUPPORT", WebCL.CL_DEVICE_IMAGE_SUPPORT ],
      [ "CL_DEVICE_IMAGE2D_MAX_HEIGHT", WebCL.CL_DEVICE_IMAGE2D_MAX_HEIGHT ],
      [ "CL_DEVICE_IMAGE2D_MAX_WIDTH", WebCL.CL_DEVICE_IMAGE2D_MAX_WIDTH ],
      [ "CL_DEVICE_IMAGE3D_MAX_DEPTH", WebCL.CL_DEVICE_IMAGE3D_MAX_DEPTH ],
      [ "CL_DEVICE_IMAGE3D_MAX_HEIGHT", WebCL.CL_DEVICE_IMAGE3D_MAX_HEIGHT ],
      [ "CL_DEVICE_IMAGE3D_MAX_WIDTH", WebCL.CL_DEVICE_IMAGE3D_MAX_WIDTH ],
      [ "CL_DEVICE_LOCAL_MEM_SIZE", WebCL.CL_DEVICE_LOCAL_MEM_SIZE ],
      [ "CL_DEVICE_LOCAL_MEM_TYPE", WebCL.CL_DEVICE_LOCAL_MEM_TYPE ],
      [ "CL_DEVICE_MAX_CLOCK_FREQUENCY", WebCL.CL_DEVICE_MAX_CLOCK_FREQUENCY ],
      [ "CL_DEVICE_MAX_COMPUTE_UNITS", WebCL.CL_DEVICE_MAX_COMPUTE_UNITS ],
      [ "CL_DEVICE_MAX_CONSTANT_ARGS", WebCL.CL_DEVICE_MAX_CONSTANT_ARGS ],
      [ "CL_DEVICE_MAX_CONSTANT_BUFFER_SIZE", WebCL.CL_DEVICE_MAX_CONSTANT_BUFFER_SIZE ],
      [ "CL_DEVICE_MAX_MEM_ALLOC_SIZE", WebCL.CL_DEVICE_MAX_MEM_ALLOC_SIZE ],
      [ "CL_DEVICE_MAX_PARAMETER_SIZE", WebCL.CL_DEVICE_MAX_PARAMETER_SIZE ],
      [ "CL_DEVICE_MAX_READ_IMAGE_ARGS", WebCL.CL_DEVICE_MAX_READ_IMAGE_ARGS ],
      [ "CL_DEVICE_MAX_SAMPLERS", WebCL.CL_DEVICE_MAX_SAMPLERS ],
      [ "CL_DEVICE_MAX_WORK_GROUP_SIZE", WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE ],
      [ "CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS", WebCL.CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS ],
      [ "CL_DEVICE_MAX_WORK_ITEM_SIZES", WebCL.CL_DEVICE_MAX_WORK_ITEM_SIZES ],
      [ "CL_DEVICE_MAX_WRITE_IMAGE_ARGS", WebCL.CL_DEVICE_MAX_WRITE_IMAGE_ARGS ],
      [ "CL_DEVICE_MEM_BASE_ADDR_ALIGN", WebCL.CL_DEVICE_MEM_BASE_ADDR_ALIGN ],
      [ "CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE", WebCL.CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE ],
      [ "CL_DEVICE_NAME", WebCL.CL_DEVICE_NAME ],
      [ "CL_DEVICE_PLATFORM", WebCL.CL_DEVICE_PLATFORM ],
      [ "CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR", WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR ],
      [ "CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT", WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT ],
      [ "CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT", WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT ],
      [ "CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG", WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG ],
      [ "CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT", WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT ],
      [ "CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE", WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE ],
      [ "CL_DEVICE_PROFILE", WebCL.CL_DEVICE_PROFILE ],
      [ "CL_DEVICE_PROFILING_TIMER_RESOLUTION", WebCL.CL_DEVICE_PROFILING_TIMER_RESOLUTION ],
      [ "CL_DEVICE_QUEUE_PROPERTIES", WebCL.CL_DEVICE_QUEUE_PROPERTIES ],
      [ "CL_DEVICE_SINGLE_FP_CONFIG", WebCL.CL_DEVICE_SINGLE_FP_CONFIG ],
      [ "CL_DEVICE_TYPE", WebCL.CL_DEVICE_TYPE ],
      [ "CL_DEVICE_VENDOR", WebCL.CL_DEVICE_VENDOR ],
      [ "CL_DEVICE_VENDOR_ID", WebCL.CL_DEVICE_VENDOR_ID ],
      [ "CL_DEVICE_VERSION", WebCL.CL_DEVICE_VERSION ],
      [ "CL_DRIVER_VERSION", WebCL.CL_DRIVER_VERSION ] ];
    
    
    // Get a list of available CL platforms, and another list of the
    // available devices on each platform. Platform and device information 
    // is inquired into string s.

    var platforms = WebCL.getPlatformIDs ();
    s += "Found " + platforms.length + " platform"
        + (platforms.length == 1 ? "" : "s")
        + "." + "<br><br>";
    for (var i in platforms) {
      var plat = platforms[i];

      var name = plat.getPlatformInfo (WebCL.CL_PLATFORM_NAME);
      s += "[" + i + "] \"<b>" + name + "</b>\"<br>";
      s += "<div style='padding-left:2em;'>";
      s += "<b>vendor:</b> " 
        + plat.getPlatformInfo (WebCL.CL_PLATFORM_VENDOR) + "<br>";
      s += "<b>version:</b> " 
        + plat.getPlatformInfo (WebCL.CL_PLATFORM_VERSION) + "<br>";
      s += "<b>profile:</b> " 
        + plat.getPlatformInfo (WebCL.CL_PLATFORM_PROFILE) + "<br>";
      s += "<b>extensions:</b> " 
        + plat.getPlatformInfo (WebCL.CL_PLATFORM_EXTENSIONS) + "<br>";

      var devices = plat.getDeviceIDs (WebCL.CL_DEVICE_TYPE_ALL);
      s += "<b>Devices:</b> " + devices.length + "<br>";
      for (var j in devices) {
        var dev = devices[j];
        s += "[" + j + "] \"<b>" + dev.getDeviceInfo(WebCL.CL_DEVICE_NAME) 
          + "</b>\"<br>";
        s += "<div style='padding-left:2em;'>";

        for (var k in infos) {
          s += infos[k][0] + ":   ";
          try {
            if (infos[k][1] == WebCL.CL_DEVICE_PLATFORM) {
              s += "<b>" 
                + dev.getDeviceInfo(infos[k][1]).getPlatformInfo(WebCL.CL_PLATFORM_NAME) 
                + "</b>";
            } else {
              s += "<b>" + dev.getDeviceInfo(infos[k][1]) + "</b>";
            }
          } catch (e) {
            s += "<b>Info not available</b>";
          }
          s += "<br>";
        }
        s += "</div>";
      }
      s += "</div>";
    }
    
    // String s is printed out to div element output
    this.domElement.innerHTML += s + "<br>";
  } catch(e) {
    this.domElement.innerHTML += s + "<br>";
    this.domElement.innerHTML += "<b>Error:</b> <pre style='color:red;'>"
                     + e.toString()+"</pre>";
    throw e;
  }
}