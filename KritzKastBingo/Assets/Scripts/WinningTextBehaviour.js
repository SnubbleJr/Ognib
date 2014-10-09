#pragma strict

function Start () {

}

function Update () {

}

public function showWin()
{
    for(var child : Transform in transform)
    {
        child.gameObject.SetActive(true);
    }
}