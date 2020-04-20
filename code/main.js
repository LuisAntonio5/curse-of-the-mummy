(function()
{
	window.addEventListener("load", main);
}());

function main()
{
	window.addEventListener("message", messageHandler);

	var frm = document.getElementsByTagName("iframe")[0];
	var p = document.getElementById("p");
	
	frm.contentWindow.postMessage('hello frame', '*');
}


function messageHandler(ev)
{
	console.log("main: got message: " + ev.data);
	var p = document.getElementById("message");
	p.innerHTML = ev.data;
}

