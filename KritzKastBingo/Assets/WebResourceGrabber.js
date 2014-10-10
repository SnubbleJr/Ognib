#pragma strict

var text : TextMesh;

function Start () {
    text = this.GetComponent(TextMesh);

    var www : WWW = new WWW (Path.Combine(Application.dataPath,"Settings.txt"));

    yield www;
    
    var str : String;
        
    str = www.text;

    var lines = str.Split("\n"[0]);
    
    text.text = lines.length.ToString();
}

function Update () {
}