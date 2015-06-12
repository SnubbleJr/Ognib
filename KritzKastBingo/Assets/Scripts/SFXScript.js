#pragma strict

var On : Texture2D;
var Off : Texture2D;
var state = false;

function Start () {

}

function Update () {

	if (state)
	{
		GetComponent.<Renderer>().material.mainTexture = On;
	}
	else
	{
		GetComponent.<Renderer>().material.mainTexture = Off;		
	}
}

function OnMouseDown()
{
	state = !state;
	
	SheetDumper.sfx = state;
}