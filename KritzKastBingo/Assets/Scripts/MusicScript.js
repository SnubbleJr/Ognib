#pragma strict

var On : Texture2D;
var Off : Texture2D;
var state = false;

function Start () {

}

function Update () {

	if (state)
	{
		renderer.material.mainTexture = On;
	}
	else
	{
		renderer.material.mainTexture = Off;		
	}
}

function OnMouseDown()
{
	state = !state;
	
	SheetDumper.music = state;
}