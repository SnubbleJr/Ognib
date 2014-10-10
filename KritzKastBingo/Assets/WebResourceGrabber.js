#pragma strict

var text : TextMesh;

function Start () {
    text = this.GetComponent(TextMesh);
}

function Update () {
    text.text = Application.dataPath;
}