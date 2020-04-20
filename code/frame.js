(function()
{
	window.addEventListener("load", main);
}());

function main()
{
	console.log("frame");
	window.addEventListener("message", messageHandler);
}

function messageHandler(ev)
{
	console.log("frame: got message: " + ev.data);
	var p = document.getElementById("message");
	p.innerHTML = ev.data;

	setTimeout(reply, 3000, ev.source);
}

function reply(mainw)
{
	mainw.postMessage('Hello main', '*');	
}
