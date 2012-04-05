<?php


?>

<title>WebCL - Example 1</title>

<script src="../src/examples/CL_vectorAdd.js"></script>

<script id="clProgramVectorAdd" type="text/x-opencl">
__kernel void ckVectorAdd(	__global unsigned int* vectorIn1,
							__global unsigned int* vectorIn2,
							__global unsigned int* vectorOut,
							unsigned int uiVectorWidth
)
{
	unsigned int x = get_global_id( 0 );
	if( x >= uiVectorWidth )
	{
		return;
	}
	// add the vector elements
	vectorOut[x] = vectorIn1[x] + vectorIn2[x];
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
		//CL_vectorAdd();
		//webcl.dumpCLData();
		
		var vectorAdd = new CL_vectorAdd( output, 30 );
		vectorAdd.init();
		
		// Execute (enqueue) kernel
		vectorAdd.runAll();
		
		// Print debug info
		vectorAdd.printDebug();
		// Print output buffer
		vectorAdd.printResult();
	}
}

</script>

