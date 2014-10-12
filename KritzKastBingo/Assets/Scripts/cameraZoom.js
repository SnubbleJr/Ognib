#pragma strict

private var zoomed = false;

private var oldTrans : Transform;
private var newTrans : Transform;

private var zoomedInCameraVector : Vector3 = new Vector3(0,4,-47);
private var zoomedInCameraRotation : Quaternion = Quaternion.identity;

function Start ()
{
	oldTrans = new GameObject().transform;
	oldTrans.position = transform.position;
	oldTrans.rotation = transform.rotation;
	
	newTrans = new GameObject().transform;
	newTrans.position = zoomedInCameraVector;
	newTrans.rotation = zoomedInCameraRotation;
}

function Update () {
	zoomedInCheck();
}

function zoomedInCheck()
{
	if(Input.GetMouseButtonDown(1))
		zoomed = !zoomed;
		
	if(zoomed)
	{
		transform.position = newTrans.position;
		transform.rotation = newTrans.rotation;
	}
	else
	{
		transform.position = oldTrans.position;
		transform.rotation = oldTrans.rotation;
	}
}