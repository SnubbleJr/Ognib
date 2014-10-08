#pragma strict

var avatarPic : GameObject;
var classPic : GameObject;
var presText : GameObject;
var ruleText : GameObject;


function Start () {

}

function Update () {

}

public function setRule(rule : Rule)
{
    ruleText.GetComponent(TextMesh).text = rule.text;
    
    avatarPic.renderer.material.mainTexture = rule.presenter.picture;
    classPic.renderer.material.mainTexture = rule.presenter.clas.classIcon;
    presText.GetComponent(TextMesh).text = rule.presenter.name;
}