#pragma strict

var avatarPic : GameObject;
var classPic : GameObject;
var presText : GameObject;
var ruleText : GameObject;
var stamp : GameObject;
var lighty : GameObject;
var arrIndex : Vector2;

var mouseH : AudioClip;
var mouseD : AudioClip;
var mouseU : AudioClip;

private var bingoed = false;

private var hovering = false;

function Start () {

}

function Update () {

}

//When pressed on, show stamp and inform controller
function OnMouseDown ()
{
    if (!bingoed)
    {
        bingoed = true;
        GameObject.FindWithTag("GameController").GetComponent(SheetDumper).stampTile(this.gameObject);
        stamp.active = true;
        audio.PlayOneShot(mouseD,1);
    }
}

function OnMouseUp () 
{
    audio.PlayOneShot(mouseU, 1);
}

function OnMouseOver () 
{
    if (!bingoed)
    {
        //highlight hte tile slightly
        lighty.active = true;
    }

    if (!hovering)
    {
        audio.PlayOneShot(mouseH,1);
        hovering = true;
    }
}

function OnMouseExit () 
{
    lighty.active = false;
    hovering = false;
}

function stamped()
{

}

public function setRule(rule : Rule, index : Vector2)
{
    ruleText.GetComponent(TextMesh).text = rule.text;
    
    avatarPic.renderer.material.mainTexture = rule.presenter.picture;
    classPic.renderer.material.mainTexture = rule.presenter.clas.classIcon;
    presText.GetComponent(TextMesh).text = rule.presenter.name;

    arrIndex = index;
}