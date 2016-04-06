/**
 * @author Csaba Farkas <csaba.farkas@mycit.ie>
 * Date of last modification: 27/03/2016
 */
var CIRCLE_RADIUS = 10;

var myCanvas;
var context;
var redCircle;
var circleCollection;
var lineCollection;
var counter;
var lightBoxDiv;
var myTextField;
var coords;
var playBackCounter;
var startButton;
var playButton;
var labelValue;
var labelDiv;

window.onload = init;

function init() {
	//Get canvas and context
	myCanvas = document.getElementById('myCanvas');
	context = myCanvas.getContext('2d');

	//Initialize redCircle object
	redCircle = {};
	redCircle.radius = CIRCLE_RADIUS;

	//Initialize counter (number of saved circles)
	counter = 0;

	//Initialize circle collection
	circleCollection = new Array();

	//Initialize lineCollection array
	lineCollection = new Array();

	if(lightBoxDiv === undefined)
	{
		//Add lightBoxDiv
		addLightBox();

		//Initialize myTextField variable
		myTextField = document.getElementById('textField');

		document.getElementById('submitButton').onclick = saveCircle;
		//submitButton.onclick = saveCircle;
	}

	labelValue = "TEST";
	if(labelDiv === undefined)
	{
		addLabel();
	}

	labelDiv = document.getElementById('labelDiv');

	//Initialize playback counter --> numbe of iterations
	playBackCounter = 0;

	//If 'Start Recording' button is clicked, 'mouseMoveFunction' is
	//added to myCanvas as 'mousemove' listener.
	startButton = document.getElementById('startRecordingButton');
	startButton.onclick = reset;

	//If 'Play' is clicked, playback starts
	playButton = document.getElementById('playButton');
	playButton.onclick = playBack;
}

//from quirksmode.org
//returns added offset of all containing elements
function findPos(obj) {

	var curleft = 0;
	var curtop = 0;

	if (obj.offsetParent)
	{
		do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);

		return [curleft,curtop];
	}

}

function getMouseCoords(event)
{

	if (!event)
	{
		var event = window.event;
	}

	var posx = 0;
	var posy = 0;

	if (event.pageX || event.pageY)
	{
		posx = event.pageX;
		posy = event.pageY;
	}
	else if (event.clientX || event.clientY)
	{
		posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}


	// get the offsets of the object that triggered the eventhandler
	var totaloffset = findPos(event.target);

 	var totalXoffset = totaloffset[0];
 	var totalYoffset = totaloffset[1];

 	var canvasX = posx- totalXoffset;
 	var canvasY = posy- totalYoffset;

 	// return coordinates in an array
	return [canvasX, canvasY];

}

function clearEntireCanvas()
{

	context.clearRect(0, 0, myCanvas.width, myCanvas.height);

}

function mouseMoveFunction(eventObject)
{
	//Drag red circle by
	/**
	 * 1. Clear canvas
	 * 2. Get mouse coordinates using the getMouseCoords(event) function
	 * 3. Using the coordinates returned by the function, set the coordinates of the circle
	 * 4. Draw the circle
	 */
	coords = getMouseCoords(eventObject);
	clearEntireCanvas();
	drawSavedLines();
	drawSavedCircles();

	redCircle.X = coords[0];
	redCircle.Y = coords[1];
	drawCircle(redCircle);
}

//Draw red circle if mouse is clicked
function mouseClickFunction(eventObject)
{
	//Get coordinates of click
	coords = getMouseCoords(eventObject);

	//Get lightbox visible
	lightBoxDiv.style.display = "block";

	//Add focus to myTextField
	myTextField.focus();
}

/*************************************************************************
********************* 				Circles										******************
*************************************************************************/
//Draw circle
/**
 *	@param Circle object
 */
function drawCircle(circle)
{
	context.beginPath();
  context.arc(circle.X, circle.Y, circle.radius, 0, 2.0 * Math.PI);
	context.fillStyle = 'red';
  context.fill();
}

//Save circle
function saveCircle()
{
	//Create circle object based on the coordinates
	circleCollection[counter] = new Object();
	circleCollection[counter].radius = CIRCLE_RADIUS;
	circleCollection[counter].X = coords[0];
	circleCollection[counter].Y = coords[1];

	//Get value from textField
	circleCollection[counter].circleName = myTextField.value;

	//Save line if there is more than 1 circle on the map
	if(counter > 0)
	{
		saveLines();
	}

	//Increment counter
	counter++;

	//Clear textField and close lightbox
	myTextField.value = "";
	lightBoxDiv.style.display = "none";
}

//Draw saved circles
function drawSavedCircles()
{

	for(var i = 0; i < circleCollection.length; i++)
	{
		drawCircle(circleCollection[i]);
	}

}

/*********************************************************************************
******************************			Lines					********************************
*********************************************************************************/
//Draw line between two circles
function drawLine(line)
{
	context.beginPath();
	context.moveTo(line.startX, line.startY);
	context.lineTo(line.endX, line.endY);
	context.stroke();
}

//Save line objects based on the current circles
function saveLines()
{
	for(var i = 1; i < circleCollection.length; i++)
	{
		lineCollection[i] = new Object();
		lineCollection[i].startX = circleCollection[i-1].X;
		lineCollection[i].startY = circleCollection[i-1].Y;
		lineCollection[i].endX = circleCollection[i].X;
		lineCollection[i].endY = circleCollection[i].Y;
	}
}

//Draw saved line objects
function drawSavedLines()
{
		for(var i = 1; i < lineCollection.length; i++)
		{
			drawLine(lineCollection[i]);
		}
}

/******************************************************************************************
******************************				LightBox					***********************************
******************************************************************************************/

//Add lightbox
function addLightBox()
{
	lightBoxDiv = document.createElement("div");

	lightBoxDiv.setAttribute("id", "lightBoxDiv");

	// Create a string containing with the html of the new div
	html = "	<div id = \"dialogContainer\">";
	html += "		<form />";
	html += "			<input id=\"textField\" type=\"text\" name=\"markerName\" />"
	html += "			<input id=\"submitButton\" type=\"button\" name=\"submit\" value=\"Save Caption\" />";
	html += "		</form>";
	html+= "	</div>";

	lightBoxDiv.innerHTML = html;

	document.body.appendChild(lightBoxDiv);

}

//Tester - Delete it before submit
function print() {
	console.log("Circles\n\n");
	for(var i = 0; i < circleCollection.length; i++) {
		circle = circleCollection[i];
		console.log(circle.circleName + "\n" + circle.X + ", " + circle.Y + "\n" + circle.radius + "\n\n");
	}
}

/**********************************************************************************************
******************************			Label next to circle       ********************************
**********************************************************************************************/
//Add label to the html
function addLabel()
{
	labelDiv = document.createElement("div");

	labelDiv.setAttribute("id", "label");

	// Create a string containing with the html of the new div
	html = "	<div id = \"labelDiv\">";
	html += "		<h2 id=\"playBackLabel\">" + labelValue + "</h2>";
	html+= "	</div>";

	labelDiv.innerHTML = html;

	document.getElementById('canvasContainer').appendChild(labelDiv);

}

//Tester - Delete it before submit
function print() {
	console.log("Circles\n\n");
	for(var i = 0; i < circleCollection.length; i++) {
		circle = circleCollection[i];
		console.log(circle.circleName + "\n" + circle.X + ", " + circle.Y + "\n" + circle.radius + "\n\n");
	}
}


/**********************************************************************************************
******************************			playback							*************************************
**********************************************************************************************/
function playBack()
{
	startButton.disabled = true;

	startButton.onclik = reset;

	//Disable Recording
	myCanvas.removeEventListener('mousemove', mouseMoveFunction);
	myCanvas.removeEventListener('click', mouseClickFunction);

	if(circleCollection.length > 0)
	{
		//Clear canvas
		clearEntireCanvas();

		//Start playback
		play();

		//Reinitialize playback counter
		playBackCounter = 0;
	}
	else
	{
		alert("You need to record before playback.");
	}
}

//Timeout function firing a drawPlayBack() call and a recursive play() call at every 2 seconds
function play()
{
	setTimeout(function()
	{
		drawPlayBack();
		playBackCounter++;
		if(playBackCounter < circleCollection.length)
		{
			play();
		}
		else
		{
			startButton.disabled = false;
		}
	}, 2000);

}

//Draws the elements to the canvas. It draws the lines before the
//circles so the line won't overlap the circles.
function drawPlayBack()
{
			if(playBackCounter == 0)
			{
				drawCircle(circleCollection[playBackCounter]);
			}
			else
			{
				drawLine(lineCollection[playBackCounter]);
				drawCircle(circleCollection[playBackCounter-1]);
				drawCircle(circleCollection[playBackCounter]);
			}

			labelDiv.style.top = circleCollection[playBackCounter].X + "px";
			console.log(labelDiv.style.top);
			labelDiv.style.left = circleCollection[playBackCounter].Y + "px";
			console.log(labelDiv.style.left);


}


/************************************************************************************
****************** Reset - Start recording button listener	*************************
************************************************************************************/
function reset()
{
	clearEntireCanvas();
	init();
	myCanvas.addEventListener('mousemove', mouseMoveFunction);
	myCanvas.addEventListener('click', mouseClickFunction);
}
