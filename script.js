/**
 * @author Csaba Farkas <csaba.farkas@mycit.ie>
 * Date of start of project:  22/03/2016
 * Date of last modification: 10/04/2016
 */

//Constants
var CIRCLE_RADIUS = 10;
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 479;
var RECT_HEIGHT = 60;

//Constant pop-up label offsets in different quadrants of the canvas
var QUARTER_ONE_Y_OFFSET = -75;
var QUARTER_TWO_Y_OFFSET = -75;
var QUARTER_THREE_Y_OFFSET = 15;
var QUARTER_FOUR_Y_OFFSET = 15;

//Canvas variables
var myCanvas;
var context;

//Circle object
var redCircle;

//Array to store circles and lines
var circleCollection;
var lineCollection;

//Lightbox div with text field and 'Save Caption' button
var lightBoxDiv;
var captionTextField;
var captionButton;

//Array to store coordinates of circle
var coords;

//Counters used during saving circles and during playback
var counter;
var playBackCounter;

//'Start Recording' and 'Play' buttons
var startButton;
var playButton;

//Width of the pop-up label is changing dynamically, depending on
//the width of the text drawn in it.
var rectWidth;

//Variables used during playback. They hold a different number of
//lines and circles at each stage of the playback.
var savedCirclesForPlayback;
var savedLinesForPlayback;

//Table variables
var tableDiv;
var table;
var tableHead;
var tableBody;

//A collection of all the 'Up', 'Down', 'Delete' buttons and
//'Label' textfields in table rows.
var controls;

//The three timeout functions need to be stored in variables,
//so timeout can be cleared if necessary
var timedPlayback;
var lastCyclePlayBack;
var removePopUpLabel;

window.onload = init;

/**
 * Init function sets up the scene. It initializes some of the collections and
 * other variables.
 */
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

	//Initialize an array which will store circles during playback
	savedCirclesForPlayback = new Array();

	//Initialize an array which will store lines during playback
	savedLinesForPlayback = new Array();

	//When 'Start Button' is clicked on during a recording session, the screen is
	//re-initialized. But to optimize the program, I don't want to recreate everything
	//from scratch. So the light box is only created once, when the page is loaded.
	if(lightBoxDiv === undefined)
	{
		//Add lightBoxDiv
		addLightBox();
	}

	//Similar scenario with the div that holds the table. It is only created once
	//with the header row. I know that rows here probably shouldn't be indented, but
	//I tried to follow their html structure so it might be easier to see what's
	//happening.
	if(tableDiv === undefined)
	{
		//Add table div
		tableDiv = document.createElement('div');
		tableDiv.setAttribute('id', 'tableDiv');

		//Create table element
		table = document.createElement('table');

			//Create and add 'colgroup'
			var colgroup = document.createElement('colgroup');

				//Create 'col' elements and add attributes to format the size
				//of the columns. The id's are used in the css file.
				var col1 = document.createElement('col');
				col1.setAttribute('span', '1');
				col1.setAttribute('id', 'col1');

				var col2 = document.createElement('col');
				col2.setAttribute('span', '2');
				col2.setAttribute('id', 'col2');

				var col3 = document.createElement('col');
				col3.setAttribute('span', '3');
				col3.setAttribute('id', 'col3');

			//Add col elements to colgroup
			colgroup.appendChild(col1);
			colgroup.appendChild(col2);
			colgroup.appendChild(col3);

		//Add colgroup to table
		table.appendChild(colgroup);

		//Create and add table header (thead)
		tableHead = document.createElement('thead');

			//Create the row
			var tableHeadRow = document.createElement('tr');

				//Create the table header cells
				var moveHeader = document.createElement('th');
				var nameHeader = document.createElement('th');
				var deleteHeader = document.createElement('th');

					//Create text nodes and append each table header cell with the
					//appropriate text node.
					moveHeader.appendChild(document.createTextNode('Move'));
					nameHeader.appendChild(document.createTextNode('Coords'));
					deleteHeader.appendChild(document.createTextNode('Delete'));

				//Add table header cells to table header row
				tableHeadRow.appendChild(moveHeader);
				tableHeadRow.appendChild(nameHeader);
				tableHeadRow.appendChild(deleteHeader);

			//Add table header row to thead element
			tableHead.appendChild(tableHeadRow);

		//Add thead element to table
		table.appendChild(tableHead);

 			//Create a tbody element
			tableBody = document.createElement('tbody');

		//Add the empty tbody to the table
		table.appendChild(tableBody);

		//Add the table to the div which was created at the start of this function.
		tableDiv.appendChild(table);


		document.getElementById('wrapper').appendChild(tableDiv);

	}

	//Initialize playback counter --> numbe of iterations
	playBackCounter = 0;

	//If 'Start Recording' button is clicked, 'mouseMoveFunction' is
	//added to myCanvas as 'mousemove' listener.
	startButton = document.getElementById('startRecordingButton');
	startButton.onclick = reset;

	//If 'Play' is clicked, playback starts
	playButton = document.getElementById('playButton');
	playButton.addEventListener('click', playBack);

}

/**
 *	I reused the next function from the specification of the project.
 * 	"from quirksmode.org"
 *	"returns added offset of all containing elements"
 */
function findPos(obj)
{

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

/**
 *	The next function was attached to the specification of project as well.
 *	It finds the coordinates of an event that fires the function (a click in this case) on the screen.
 *	Uses the above 'findPos' function to calculate the offset of the element on which the event was
 *	fired.
 */
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

/**
 *	Function clears the entire canvas by drawing a clear rectangle to entire
 *	width and height of the canvas.
 */
function clearEntireCanvas()
{

	context.clearRect(0, 0, myCanvas.width, myCanvas.height);

}

/*********************************************************************************
*************************	   Canvas event handlers	   ***************************
*********************************************************************************/

/**
 * This function is fired in recording mode only.
 * This function is triggered by the movement of the mouse over the canvas.
 * 1. Clear canvas
 * 2. Get mouse coordinates using the getMouseCoords(event) function
 * 3. Using the coordinates returned by the function, set the coordinates of the circle
 * 4. Draw the circle
 * This creates an effect that the circle is dragged by the cursor.
 *
 * @param {event object} eventObject -  event object created by the event
 */
function mouseMoveFunction(eventObject)
{
	coords = getMouseCoords(eventObject);
	clearEntireCanvas();
	drawSavedLines();
	drawSavedCircles();

	redCircle.X = coords[0];
	redCircle.Y = coords[1];
	drawCircle(redCircle);
}

/**
 * This function is fired in recording mode only.
 * It is triggered by a click on the canvas.
 * Displays the light box with the input field and button.
 * Gives focus to the input field in the lightbox.
 *
 * @param {event object} eventObject - event object created by the event
 */
function mouseClickFunction(eventObject)
{
	//Get coordinates of click
	coords = getMouseCoords(eventObject);

	//Get lightbox visible
	lightBoxDiv.style.display = "block";
	startRecordingButton.disabled = true;
	playButton.disabled = true;

	//Add focus to captionTextField
	captionTextField.focus();
}

/*************************************************************************
********************* 				Circles										******************
*************************************************************************/

/**
 *	Method draws the param circle on canvas, using its coordinates.
 *
 *	@param {object} circle - circle object
 */
function drawCircle(circle)
{
	context.save();
	context.beginPath();
  context.arc(circle.X, circle.Y, circle.radius, 0, 2.0 * Math.PI);
	context.fillStyle = 'red';
  context.fill();
	context.restore();
}

/**
 *	Method is attached to the 'Save Caption' button as a click event handler.
 *	It gets the center point coordinates of the new circle and saves it as a
 *	circle object.
 */
function saveCircle()
{
	//Create circle object based on the coordinates
	//Uses the counter to identify the lastly added element.
	circleCollection[counter] = new Object();
	circleCollection[counter].radius = CIRCLE_RADIUS;
	circleCollection[counter].X = coords[0];
	circleCollection[counter].Y = coords[1];

	//Attach a new attribute called 'circleName' to the circle object.
	//The value of 'circleName' equals to the text in the textfield.
	circleCollection[counter].circleName = captionTextField.value;

	//Create and save line if there is more than 1 circle on the map
	if(counter > 0)
	{
		saveLines();
	}

	//Clear textField and close lightbox
	captionTextField.value = "";
	lightBoxDiv.style.display = "none";

	//Create new row in the table
	createNewTableRow();

	//Increment counter
	counter++;

	//Re-enable the 'Start Recording' and the 'Play' buttons
	playButton.disabled = false;
	startRecordingButton.disabled = false;
}

/**
 *	This method draws all the circles which are saved in the 'circleCollection'
 *	array to the canvas.
 */
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

/**
 *	Draw the line param to the canvas.
 *
 *	@param {object} line - line object
 */
function drawLine(line)
{
	context.beginPath();
	context.moveTo(line.startX, line.startY);
	context.lineTo(line.endX, line.endY);
	context.stroke();
}

/**
 *	After a new circle is added to or removed from the circleCollection, the structure
 * 	of the lines change. So they have to be recreated based on the current circles.
 *	This function is traversing through the circles and creates line objects which connects
 *	the center points of every two adjacent circles.
 */
function saveLines()
{
	lineCollection = new Array();

	for(var i = 1; i < circleCollection.length; i++)
	{
		lineCollection[i] = new Object();
		lineCollection[i].startX = circleCollection[i-1].X;
		lineCollection[i].startY = circleCollection[i-1].Y;
		lineCollection[i].endX = circleCollection[i].X;
		lineCollection[i].endY = circleCollection[i].Y;
	}
}

/**
 *	This method draws all of the lines saved in the lineCollection to the canvas. The lines
 *	must be drawn before the circles, otherwise the lines will overlap the circles.
 */
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

/**
 * Create a light box with an outer and inner container. A form in the inner container and
 * an input text field and button in the form element.
 */
function addLightBox()
{
	//Create outer container
	lightBoxDiv = document.createElement("div");
	lightBoxDiv.setAttribute("id", "lightBoxDiv");

		//Create inner container
		var dialogContainerDiv = document.createElement('div');
		dialogContainerDiv.setAttribute('id', 'dialogContainer');

			//Create form
			var formElem = document.createElement('form');
			//onsubmit attribute of form returns false so the page is not refreshing itself by default
			formElem.setAttribute('onsubmit', 'return false');

				//Create input text field
				captionTextField = document.createElement('input');
				captionTextField.setAttribute('id', 'textField');
				captionTextField.setAttribute('type', 'text');

				//Create 'Save Caption' button
				captionButton = document.createElement('input');
				captionButton.setAttribute('id', 'captionButton');
				captionButton.setAttribute('type', 'submit');
				captionButton.setAttribute('value', 'Save Caption');
				captionButton.addEventListener('click', saveCircle);

			//Add text field and button to the form
			formElem.appendChild(captionTextField);
			formElem.appendChild(captionButton);

			//Add form to the inner container
			dialogContainerDiv.appendChild(formElem);

		//Add inner container to the outer container
		lightBoxDiv.appendChild(dialogContainerDiv);

	document.getElementById('canvasContainer').insertBefore(lightBoxDiv, myCanvas);

}

/**********************************************************************************************
******************************			Pop-up label next to circle       *************************
**********************************************************************************************/

/**
 *	Function creates the pop-up label and draws it to the canvas, next to the circle.
 *	Its coordinates, the circle name and stroke/fill type are passed in as parameters.
 *
 *	@param {number} - 	X is the x coordinate of the rectangle
 *	@param {number} - 	Y is the y coordinate of the rectangle
 *	@param {boolean} - 	If true, stroke rectangle. If false, fill rectangle
 *	@param {string} -		The name of the circle
 */
function drawLabel(X, Y, stroke, name)
{
	//Begin path and save current context
	context.beginPath();
	context.save();

	//Change font size and type of context before getting the width of the circle name text
	context.font = "bold 20px Arial";

	//Trim circle name string
	name = name.trim();

	//Get the width of the text
	textWidth = context.measureText(name).width;
	rectWidth = textWidth + 20;

	//I researched many different methods to draw a rounded rectangle. In my opinion, this method
	//is one of the simple ones.
	//To understand arcTo, do the following:
	//1. arcTo uses three points - there is only two passed in as parameters, the third one is the last point
	//	 of the current path
	//2. draw two intersecting lines by using the three points - the 'second point' is the intersection
	//3. draw a circle in the angle of the intersection using radius parameter as the radius of the circle
	//4. both sides of the circle should 'touch' one of the lines - tangent points
	//5. draw the path from point one, along the first line, along the part of the circumference of the circle
	//	 between the two tangent points, to the third point to get the arc
	//Source: http://www.dbp-consulting.com/tutorials/canvas/CanvasArcTo.html
	context.moveTo(X + CIRCLE_RADIUS, Y);

	context.arcTo(X + rectWidth, Y, X + rectWidth, Y + CIRCLE_RADIUS, CIRCLE_RADIUS);

	context.arcTo(X + rectWidth, Y + RECT_HEIGHT, X + rectWidth - CIRCLE_RADIUS, Y + RECT_HEIGHT, CIRCLE_RADIUS);

	context.arcTo(X, Y + RECT_HEIGHT, X, Y + RECT_HEIGHT - CIRCLE_RADIUS, CIRCLE_RADIUS);

	context.arcTo(X, Y, X + CIRCLE_RADIUS, Y, CIRCLE_RADIUS);

	//Draw outer 'stroke' black rectangle if stroke is true
	//And restore the context
	if(stroke)
	{
		context.lineWidth = 5;
		context.stroke();

		context.restore();
	}
	//Draw inner 'filled' rectangle if stroke is false
	//And restore the context
	else
	{
		context.fillStyle = "#FFFFFF";
		context.fill();

		context.restore();
	}

	//Font must be set again - context was restored recently
	context.font = "bold 20px Arial";

	//Draw the text - use X of circle, text width and rectangle width to get x coordinate.
	//								use Y of circle plus a 35px padding to get y coordinate.
	context.fillText(name, X + ((rectWidth - textWidth) / 2), Y + 35);

}

/**********************************************************************************************
******************************			playback							*************************************
**********************************************************************************************/

/**
 *	Click event handler attached to 'Play' button.
 */
function playBack()
{
	//Remove this function as 'Play' button's event listener
	playButton.removeEventListener('click', playBack);

	//Add a new event handler which clears the timeouts and
	//clears the canvas and restarts playback.
	playButton.addEventListener('click', function() {
		clearTimeout(timedPlayback);
		clearTimeout(lastCyclePlayBack);
		clearTimeout(removePopUpLabel);
		playButton.addEventListener('click', playBack);
		clearEntireCanvas();
		playBack();
	});

	//Initialize two arrays used during playback
	savedCirclesForPlayback = new Array();
	savedLinesForPlayback = new Array();

	//Start playback, if and only if there is at least one circle saved in circleCollection
	if(circleCollection.length > 0)
	{
		//Disable 'Start recording' button
		startButton.disabled = true;

		//Disable mousemove and click handlers of canvas
		myCanvas.removeEventListener('mousemove', mouseMoveFunction);
		myCanvas.removeEventListener('click', mouseClickFunction);

		//Disable all control buttons and text fields
		controls = document.getElementsByClassName('control-button');
		for(var i = 0; i < controls.length; i++)
		{
			controls[i].disabled = true;
		}

		//Clear canvas
		clearEntireCanvas();

		//Start playback
		play();

		//Reinitialize playback counter after play() finished
		playBackCounter = 0;
	}
	else
	{
		alert("You need to record before playback.");
	}
}

/**
 *	Function fires a drawPlayBack() call and a recursive play() call at every 2 seconds, thus
 *  creating a realistic playback effect. It fires the above calls as many times as many circles
 *	are in circleCollection.
 *	After the last call, it fires lastCyclePlayBack handler, which redraws the circles (and lines)
 *	without the last pop-up label, and re-enables all the buttons and fields.
 */
function play()
{
	timedPlayback = setTimeout(function()
	{
		drawPlayBack();
		playBackCounter++;
		if(playBackCounter < circleCollection.length)
		{
			play();
		}
		else
		{
			lastCyclePlayBack = setTimeout(function()
			{
				//Redraw without last label at the end of playback
				clearEntireCanvas();
				redrawPreviousObjects();
				//Re-enable 'Start recording' button and control buttons
				startButton.disabled = false;
				for(var i = 0; i < controls.length; i++)
				{
					controls[i].disabled = false;
				}
				//Re-initialize event listener on 'Play' button
				playButton.addEventListener('click', playBack);
			}, 2000);
		}
	}, 2000);

}

/**
 * Draws a given number of elements (value of 'given number' is the value of the
 * playBackCounter) to the canvas. Again, lines are drawn before circles so they don't ovelap.
 */
function drawPlayBack()
{
	//Initialize local variables for current circles and lines.
	var currentCircle = circleCollection[playBackCounter];
	var previousCircle = circleCollection[playBackCounter-1];
	var currentLine = lineCollection[playBackCounter];

	//If playBackCounter is 0 -> first circle will be drawn with no line
	if(playBackCounter == 0)
	{
		drawCircle(currentCircle);

		//save drawn circle in savedCirclesForPlayback collection (tracking the status of playback)
		savedCirclesForPlayback[0] = currentCircle;
	}
	else
	{
		//Clear the canvas
		clearEntireCanvas();

		//Redraw previous circles and lines (drawn in the previuos step of the playback process)
		redrawPreviousObjects();

		//Draw the current line
		drawLine(currentLine);

		//Draw previuos and current circle. In fact, previous circle is drawn twice on the top of each
		//other to avoid the current line overlapping the previous circle.
		drawCircle(previousCircle);
		drawCircle(currentCircle);

		//save drawn line and circle in savedLinesForPlayback and savedCirclesForPlayback (tracking the status of playback)
		savedCirclesForPlayback[playBackCounter] = currentCircle;
		savedLinesForPlayback[playBackCounter] = currentLine;
	}

	//If circle name is not an empty string
	if(currentCircle.circleName.trim().length > 0)
	{
		//Call labelCoords function to calculate the coordinates of the pop-up label next to the circle
		var lCoords = labelCoords(currentCircle.X, currentCircle.Y, currentCircle.circleName);

		//Draw pop-up label
		drawLabel(lCoords[0], lCoords[1], true, currentCircle.circleName);
		drawLabel(lCoords[0], lCoords[1], false, currentCircle.circleName);

		/**
		 *	This timeout call fires slightly before the next iteration of the playback starts, so
		 *	the pop-up label disappears slightly before the next circle is drawn to the canvas.
		 */
		removePopUpLabel = setTimeout(function() {
			//Redraw without last label at the end of playback
			clearEntireCanvas();
			redrawPreviousObjects();
		}, 1500);
	}
}

/**
 *	This function uses savedLinesForPlayback and savedCirclesForPlayback to redraw all of the previously
 *	drawn elements in the playback.
 */
function redrawPreviousObjects()
{
	//Draw lines
	for(var i = 1; i < savedLinesForPlayback.length; i++)
	{
		drawLine(savedLinesForPlayback[i]);
	}

	//Draw circles
	for(var j = 0; j < savedCirclesForPlayback.length; j++)
	{
		drawCircle(savedCirclesForPlayback[j]);
	}
}

/**
 *	Function calculates the coordinates of the pop-up label.
 *
 * 	@param {number} X - x coordinate of circle
 *	@param {number} Y - y coordinate of circle
 *	@param {string} name - name of circle
 */
function labelCoords(X, Y, name)
{
	//Save current context of canvas and change the font
	//NB: Changing the font all the time wouldn't be necessary. However, I decided to
	//do it this way, so if the program was extended with new functions that are using
	//other font types, changing to them wouldn't cause a problem.
	context.save();
	context.font = "bold 20px Arial";

	//Calculate text width using the new font
	var textWidth = context.measureText(name).width;

	//Restore context
	context.restore();

	//Add 20 for the padding +
	labelWidth = textWidth + 20;

	//Calculate the area of each quarter. Draw to a horizontal and a vertical line going through
	//the center point of the circle to get the quarters.
	var areaQ1 = X * Y;
	var areaQ2 = (CANVAS_WIDTH - X) * Y;
	var areaQ3 = (CANVAS_WIDTH - X) * (CANVAS_HEIGHT - Y);
	var areaQ4 = (X * (CANVAS_HEIGHT - Y));

	//Put them in an array
	var areaArray = [areaQ1, areaQ2, areaQ3, areaQ4];

	//get the largest value
	var largestArea = Math.max.apply(Math, areaArray);

	//Return the coordinates of the label, which is going to be
	//placed into the quarter with the largest area
	switch(largestArea)
	{
		case areaQ1:
		return [
			X - (labelWidth + 15),
			Y + QUARTER_ONE_Y_OFFSET
		];
		break;
		case areaQ2:
		return [
			X + 15,
			Y + QUARTER_TWO_Y_OFFSET
		];
		break;
		case areaQ3:
		return [
			X + 15,
			Y + QUARTER_THREE_Y_OFFSET
		];
		break;
		default:
		return [
			X - (labelWidth + 15),
			Y + QUARTER_FOUR_Y_OFFSET
		];
	}
}

/************************************************************************************
******************             Create new table row	        *************************
************************************************************************************/

/**
 *	Function creates a new table row, using DOM scripting. Again, it probably shoudn't be
 *	indented, but it's easier to understand what's going on, if the script follows the
 *	structure of the html.
 */
function createNewTableRow()
{
	//Create new table row element
	var tableRow = document.createElement('tr');

		//Create all three cells
		var moveCell = document.createElement('td')
		var coordsCell = document.createElement('td');
		var deleteCell = document.createElement('td');

			//Create the three buttons
			var upButton = document.createElement('button');
			var downButton = document.createElement('button');
			var deleteButton = document.createElement('button');

			//Give classes to the newly created buttons
			//Class name is used when disabling/enabling the buttons and textfields
			upButton.setAttribute('class', 'control-button');
			downButton.setAttribute('class', 'control-button');
			deleteButton.setAttribute('class', 'control-button');

			//Set the text on each button
			upButton.innerHTML = 'Up';
			downButton.innerHTML = 'Down';
			deleteButton.innerHTML = 'Delete';

			//Add event handlers to the buttons

			/**
			 *	Up button event handler
			 */
			upButton.addEventListener('click', function() {
					//Get the row object, where this up button is in the table.
					var parentRow = this.parentNode.parentNode;
					//Get the previous sibling of the row object i.e. previous row
					var previousSiblingRow = parentRow.previousSibling;

					//If row is not to topmost row, move it up
					if(previousSiblingRow !== null)
					{

						//Swap circles in circleCollection, using the index of the table rows to identify them
						swapCircles(parentRow.rowIndex - 1, parentRow.rowIndex - 2);
						//Insert table row before the previous row
						tableBody.insertBefore(parentRow, previousSiblingRow);
						//Redraw the canvas
						redraw();
					}
			});

			/**
			 * Down button click event handler - this function can be considered as the opposite of the
			 * previous function. It moves a table row and circle down in the table/collection.
			 */
			downButton.addEventListener('click', function() {
				var parentRow = this.parentNode.parentNode;
				var nextSiblingRow = parentRow.nextSibling;

				//Fires only if row is not the bottommost row
				if(nextSiblingRow !== null)
				{
					swapCircles(parentRow.rowIndex - 1, parentRow.rowIndex);
					//Insert before the next sibling of the next sibling (before the second next row)
					tableBody.insertBefore(parentRow, nextSiblingRow.nextSibling);
					redraw();
				}
			});

			/**
			 *	Delete button click event handler - removes the circle from the collection and the row
			 *	from the table.
			 */
			deleteButton.addEventListener('click', function() {

				//Get the parent row and its index (-1 because of header row)
				var parentRow = this.parentNode.parentNode;
				rowIndexInTbody = parentRow.rowIndex - 1;

				//Remove the circle, using the index of row, from circleCollection
				circleCollection.splice(rowIndexInTbody, 1);

				//delete row
				table.deleteRow(parentRow.rowIndex);

				redraw();
			});

			//Create a label and an input field
			var label = document.createElement('label');
			label.innerHTML = "Label: ";

			var inputField = document.createElement('input');
			inputField.setAttribute('type', 'text');
			//Set value of input field to circle name
			inputField.setAttribute('value', circleCollection[counter].circleName);
			inputField.setAttribute('class', 'control-button');

			//Add event listener to input field
			/**
			 *	This event handler fires at every 'key up' event.
			 */
			inputField.addEventListener('keyup', function() {
				//Get the table row index where this input field is
				var circleIndex = this.parentNode.parentNode.rowIndex - 1;
				//Change the name of the circle  to the value of the input field (using row index to identify circle)
				circleCollection[circleIndex].circleName = this.value;
			});

			//Create two span nodes for coordinates
			var xSpan = document.createElement('span');
			var ySpan = document.createElement('span');
			//Text in span elements are the coordinates of the current circle
			xSpan.innerHTML = "x: " + circleCollection[counter].X;
			ySpan.innerHTML = " y: " + circleCollection[counter].Y;

		//Assemble everything
		moveCell.appendChild(upButton);
		moveCell.appendChild(downButton);
		coordsCell.appendChild(label);
		coordsCell.appendChild(inputField);
		coordsCell.appendChild(xSpan);
		coordsCell.appendChild(ySpan);
		deleteCell.appendChild(deleteButton);

	tableRow.appendChild(moveCell);
	tableRow.appendChild(coordsCell);
	tableRow.appendChild(deleteCell);


	tableBody.appendChild(tableRow);
}

/**
 *	Function swaps two circle in the circleCollection using the params.
 *
 *	@param {number} circleIndex1 - index of first circle in circleCollection
 *	@param {number} circleIndex2 - index of second circle in circleCollection
 */
function swapCircles(circleIndex1, circleIndex2)
{
	var tempCircle = circleCollection[circleIndex1];
	circleCollection[circleIndex1] = circleCollection[circleIndex2];
	circleCollection[circleIndex2] = tempCircle;
}

/**
 *	This function redraws the entire canvas.
 */
function redraw()
{
	//Clear canvas and redraw
	clearEntireCanvas();

	//If there are more than 1 circle in the collection, recreate lines and redraw them
	if(circleCollection.length > 1)
	{
		saveLines();
		drawSavedLines();
	}
	//If there is only one circle in circleCollection, re-initialize the lineCollection array
	else
	{
		lineCollection = new Array();
	}

	//Draw circles
	drawSavedCircles();
}

/************************************************************************************
****************** Reset - Start recording button listener	*************************
************************************************************************************/

/**
 *	Click event handler attaced to 'Start Recording' button
 */
function reset()
{
	clearEntireCanvas();

	//Delete all tablerows
	var tableRows = document.getElementsByTagName('tr');
	//Remove all rows except the first one (header)
	for(var i = tableRows.length-1; i > 0; i--)
	{
		tableBody.removeChild(tableRows[i]);
	}

	//Reset the program and add the event handlers to the canvas
	init();
	myCanvas.addEventListener('mousemove', mouseMoveFunction);
	myCanvas.addEventListener('click', mouseClickFunction);
}
