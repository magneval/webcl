<title>WebCL - Example 2</title>

<script src="../src/examples/CL_desaturate.js"></script>

<script id="clProgramDesaturate" type="text/x-opencl">
  __kernel void clDesaturate(__global const uchar4* src,
                             __global uchar4* dst,
                             uint width, 
                             uint height)
  {
    int x = get_global_id(0);
    int y = get_global_id(1);
    if (x >= width || y >= height) return;

    int i = y * width + x;

    uchar4 color = src[i];
    uchar lum = (uchar)(0.30f * color.x + 0.59f * color.y + 0.11f * color.z);
    dst[i] = (uchar4)(lum, lum, lum, 255);
  }
</script>

<script>

window.onload=function()
{

	// All output is written to element by id "output"
	var output = document.createElement('div');
	document.body.appendChild( output );
	
	var webcl = new WebCLEasing( output );

	var clEnabled = webcl.detectCL();
	

	if( clEnabled )
	{
		setupCanvas ();
		CL_desaturate( output );
		//CL_vectorAdd();
		//webcl.dumpCLData();
		
		//var vectorAdd = new CL_vectorAdd( output, 30 );
		//vectorAdd.init();
		
		// Execute (enqueue) kernel
		//vectorAdd.runAll();
		
		// Print debug info
		//vectorAdd.printDebug();
		// Print output buffer
		//vectorAdd.printResult();
	}
}

</script>