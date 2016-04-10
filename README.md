<h1>Assignment Specification</h1>
<h2>Assignment 1: Annotated Map Tool</h2>
<h4>Module Name: Advanced Interactive Web Design</h4>
<h3>Part I: Add Markers to Map</h3>
<p>The page should allow you to add markers (red circles) over a map. The map is an image shown behind a canvas as a CSS background and not part of the canvas itself.</p>
<p>Once you press the "Start Recording" button moving the mouse over the map should draw a marker as a cursor under the current position of the mouse. The marker is a red circle.</p>
<p>If you click on the mouse while hovering over the canvas it will pop up a form asking for a label for the marker. It then draws a marker on the canvas at that position and draws a line from the previous marker to it. (You will need to store the x and y coordinates of the marker along with the label).</p>
<p>When the form pops up, the test field should be automatically selected so that the user doesn't have to click on it to select it in order to be able to type in it. To dismiss the form the user should either click on the "Save" button or press return.</p>
<p><b>Note: </b>Pressing Start Recording again will clear the current markers and start again.</p>
<h3>Part 2: Playback</h3>
<p>For each marker you must draw a line to the previous marker and also temporarily display the label that was stored with it (If there was no label for a particular marker then you don't show the label box).</p>
<p>The position of the label is based on the position of its marker. The label should disappear slightly before the next marker is drawn.</p>
<p>The label is positioned so it has the maximum room to display its contents within the bounds of the canvas.</p>
<p>Its position will depend on the position of its marker.</p>
<ul>
<li>If the marker is in the top half of the canvas then the label is positioned beneath it.</li>
<li>If the marker is in the bottom half of the canvas then the label is positioned above the marker.</li>
<li>If the marker is on the left hand side of the canvas then the label is positioned to its right</li>
<li>If the marker is on the right hand side of the canvas then the label is positioned to its right (and vice versa)</li>
</ul>
<p>While the playback is in progress <i>you must disable the other buttons on the page so they can't interfere with it. They will be enabled again when the playback is finished.</i></p>
<h3>Part 3: Editing the Marker List (DOM Scripting)</h3>
<p>Every time a marker is added to the canvas you should add an entry to a list of markers on the page (using DOM scripting).</p>
<p>The list shows the details of the marker that was just added.</p>
<ul>
<li>The x coordinate of the marker</li>
<li>The y coordinate of the marker</li>
<li>The label of the marker</li>
</ul>
<p>The label for the marker should be in a text field so you can edit it. Any changes you make to the label in the text field should automatically be stored as the actual label.</p>
<p>It should also add controls that allow you alter the list of markers.</p>
<ul>
<li>It should also add controls that allow you alter the list of markers.</li>
<li>A button to move the marker down the list (i.e. to swap position with the entry after it).</li>
<li>A button to delete the marker from the list</li>
</ul>
<p>Any change to the onscreen list should change the actual data you have stored for the markers (including their order).</p>
<p>Every change you make to the list (changing the order of markers, deleting a marker) should be shown on the canvas. I.e. you redraw the markers and lines to illustrate the current list of markers.</p>
<p>Changes to the label don't have to redraw the markers on canvas as you wouldn't see the labels but the changes can be seen if you replay the animation.</p>
<p><b>Note I:</b> If you press the "Start" button again then the list should be emptied so it is ready to start again.</p>
<p><b>Note II:</b> In playback mode the control buttons mentioned above should also be disabled.</p>
