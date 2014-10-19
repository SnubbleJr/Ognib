#pragma strict
import System.IO;
 
var tile : GameObject;
var emptyTile : GameObject;

var ruleTextLen = 15;

public static var music = true;
public static var sfx = true;

private var sfxScale = 10;

private var started = false;

private var cols : int;
private var rows: int;
private var activeTilesPerRow : int;

private var scale : float = 1;

var tileComplete : AudioClip;
var rowComplete : AudioClip;
var gameComplete : AudioClip;

private var filePath : String;
private var lines = Array();
private var line : String;
private var tex : Texture2D;

private var clas : Class;
private var presenter : Presenter;
private var rule : Rule;

private var classList = Array();
private var presenterList = Array();
private var ruleList = Array();

private var tileList = Array();

private var completedRows : int = 0;

private var won = false;

//for the posisition of the the tiles, have the logic stored in an array, and then just scaled, so 2,4 etc

function Start ()
{
    filePath = Application.dataPath;

    yield applySettings();

    yield makeLists();
	
	spawnTiles();
}

function makeLists()
{
    yield makeClassList();
    yield makePresenterList();
    yield makeRulesList();

	yield makeTileList();
}

function getWebFile(path : String)
{
	var str : String;
    var www : WWW = new WWW (path);

	lines = Array();
	
    yield www;
    
    str = www.text;
	
	lines = str.Split("\n"[0]);
}

function getDiskFile(path : String)
{
	var sr : StreamReader;
	
	lines = Array();
	
    sr = new File.OpenText(path);
	
	line = sr.ReadLine();
	
	while (line != null)
	{
		lines.Push(line);
		line = sr.ReadLine();
	}
	
	// Done reading, close the reader
    sr.Close();
	yield;
}

function getWebTex(path : String)
{
    var www : WWW = new WWW (path);

    yield www;
	
	tex = www.texture;
}

function applySettings()
{
	loadingPrint("Applying Settings...");
	
    var baseCols : float = 9;
    var baseRows : float = 3;
    var colRatio : float;
    var rowRatio : float;

    var path : String = filePath + "/Settings.txt";
	
#if UNITY_EDITOR
	yield getDiskFile(path);
#elif UNITY_WEBPLAYER
    yield getWebFile(path);
#endif
	
    if (lines.length > 0)
        cols = parseInt(lines[0].ToString());
    
    if (lines.length > 1)
        rows = parseInt(lines[1].ToString());
    
    if (lines.length > 2)
        activeTilesPerRow = parseInt(lines[2].ToString());

    //so we don't err here
    if (activeTilesPerRow > cols)
        activeTilesPerRow = cols;

    //set scale correctly for the no of tiles we want per sheet at 1, it's 9x3
    colRatio = baseCols/cols;
    rowRatio = baseRows/rows;
    
    if (colRatio <= rowRatio)
    {
        scale = colRatio;
    }
    else
    {
        scale = rowRatio;
    }
	yield;
}

function makeTileList()
{
	loadingPrint("Making Bingo Sheet...");

    var arr1 = Array();
    var arr2 = Array();

    for (var j=0; j<cols; j++)
    {
        arr2.push(0);
    }

    for (var i=0; i<rows; i++)
    {
        arr1.push(arr2);
    }

    tileList = arr1;
			
	applyActiveTiles();
    yield;
}

//so the array is weird, it's just col * row length but goes r0c0,r0c1,r0c2,r1c0...
function applyActiveTiles()
{
    var currentActiveInRow : int = 0;
     
    var currentCol : int = 0;
    var currentRow : int = 0;

    for (var i=0; i<rows; i++)
    {
        var arr = [];
        arr = tileList[i];

        do
        {
            var range : int = Random.Range(0, cols);
            if (arr[range] == 0)
            {
                arr[range] = 1;
                tileList[i] = arr;
                
                currentActiveInRow++;;
            }

        }
		
        while (currentActiveInRow < activeTilesPerRow);
		currentActiveInRow = 0;
    }
}

function makeClassList()
{    	
	loadingPrint("Getting Class Info...");

	var path : String = filePath + "/Classes.txt";
	
#if UNITY_EDITOR
	yield getDiskFile(path);
#elif UNITY_WEBPLAYER
    yield getWebFile(path);
#endif

	for(var line in lines)
	{
		yield parseClass(line);
		if (clas != null)
		{
			classList.push(clas);
		}
	}
}

function makePresenterList()
{    
	loadingPrint("Getting Presenter Info...");

    var path : String = filePath + "/Presenters.txt";
	
#if UNITY_EDITOR
	yield getDiskFile(path);
#elif UNITY_WEBPLAYER
    yield getWebFile(path);
#endif

	for(var line in lines)
	{
		yield parsePresenter(line);
		if (presenter != null)
		{
			presenterList.push(presenter);
		}
	}
}

function makeRulesList()
{    
	loadingPrint("Getting Rule Info...");

    var path : String = filePath + "/Rules.txt";
	rule = new Rule();
	
#if UNITY_EDITOR
	yield getDiskFile(path);
#elif UNITY_WEBPLAYER
    yield getWebFile(path);
#endif

	for(var line : String in lines)
	{
		if (line.length > 1)
		{
			yield parseRule(line);
			if (rule != null)
			{
				ruleList.push(rule);
			}
		}
	}
}

function parseClass(str : String)
{
    clas = new Class();
    var subStr = Array();

	var path : String;
	
    subStr = str.Split("`"[0]);
	
    if(subStr.length > 0)
    {
		path = filePath + "/" + subStr[1];

#if UNITY_EDITOR
        tex = Resources.Load(subStr[1]);
		yield;
#elif UNITY_WEBPLAYER
		yield getWebTex(path);
#endif
		
        clas.className = subStr[0];
        clas.classIcon = tex;
    }
}

function parsePresenter(str : String)
{
    presenter = new Presenter();
    var subStr : String[];

	var path : String;
	
    subStr = str.Split("`"[0]);

    if(subStr.length >= 1)
    {	
        //if there's a pic file round here...
		path = filePath + "/" + subStr[2];

#if UNITY_EDITOR
        tex = Resources.Load(subStr[2]);
		yield;
#elif UNITY_WEBPLAYER
		yield getWebTex(path);
#endif

        if (tex != null)
        {
            presenter.picture = tex;
        }
                
        presenter.name = subStr[0];
        presenter.clas = getClass(subStr[1]);
    }
}

function parseRule(str : String) : Rule
{
	rule = new Rule();
    var subStr : String[];

    subStr = str.Split("`"[0]);

    var text : String = resolveTextSize(subStr[1], ruleTextLen);
    //if rule is empty, or too long
    if(subStr.length > 0 && text != null)
    {        
        rule.presenter = getPresenter(subStr[0]);
        rule.text = text;
    }
}

// Wrap text by line height
function resolveTextSize(input : String, lineLength : int) : String
{
    // Split string by char " "       
    var words : String[] = input.Split(" "[0]);
 
    // Prepare result
    var result : String;
 
    // Temp line string
    var line : String;
 
    // for each all words        
    for(var s : String in words)
    {
        //See if any part of the string is just too long
        if(s.length > lineLength)
            return null;

        // Append current word into line
        var temp : String = line + " " + s;
 
        // If line length is bigger than lineLength
        if(temp.Length > lineLength)
        { 
            // Append current line into result
            result += line + "\n";
            // Remain word append into new line
            line = s;
        }
        // Append current word into current line
        else 
        {
            line = temp;
        }
    }
    // Append last line into result      
    result += line;
 
    // Remove first " " char
    return result.Substring(1,result.Length-1);
}

function getClass(name: String) : Class
{
    for(var c : Class in classList)
    {
        if (c.className == name)
            return c;
    }
    return null;
}

function getPresenter(name : String) : Presenter
{
    for(var p : Presenter in presenterList)
    {
        if (p.name == name)
            return p;
    }
    return presenterList[0];
}

function getRule() : Rule
{
    var range : int = Random.Range(0, ruleList.length-1);

    try
    {
        var rule : Rule = ruleList[range];
    }
    catch (e)
    {
        return null;
    }

    ruleList.splice(range, 1);

    return rule;
}

//loop through the tileList and spawn active where 1, else 0
function spawnTiles()
{    
    for (var i=0; i<rows; i++)
    {
        var arr = [];
        arr = tileList[i];
        
        for (var j=0; j<cols; j++)
        {
            var vec : Vector2 = new Vector2(j,i);

            //if this requires a rule, and there are rules left
            if (arr[j] == 1)
            {   
				var rule : Rule = getRule();

                if (rule != null)
                {
                    yield spawnTile(tile, vec, rule);
                }
                else
                {
                    yield spawnTile(emptyTile, vec, null);
                }
            }
            else
            {
                yield spawnTile(emptyTile, vec, null);
            }
        }
    }
	//initalastion complete
	started = true;
	loadingPrint("");

}

//this spawns tiles, based on the co ord (which is it's pos in the array) and the scale, by default, each tile is 10x10, it then offsets it by how big the array is, so the middle tile (or combo of tiles) is 0,0
function spawnTile(tile : GameObject, position : Vector2, rule : Rule)
{
    var newTile : GameObject;

    //offset for centre done by halving both col-1 and row-1 and then just taking away
    var newPosition = new Vector2(position.x - ((cols-1)*0.5), position.y - ((rows-1)*0.5))* scale;

    //base coord, so 1,1, would go at 10,10
    var offset : Vector3 = new Vector3(10 * newPosition.x, 10 * newPosition.y, 0);

    newTile = Instantiate(tile, offset, transform.rotation);

    newTile.transform.localScale = new Vector3(scale, scale, scale);

    newTile.transform.parent = transform;

    if(rule != null)
        newTile.GetComponent(BingoTile).setRule(rule, position);
	
	yield;
}

function Update()
{
	if (started)
	{		   
		rowCheck();
		winCheck();
	}
}

public function stampTile(tile : GameObject)
{
    var indexX : int = tile.GetComponent(BingoTile).arrIndex.x;
    var indexY : int = tile.GetComponent(BingoTile).arrIndex.y;
    var arr = [];

    arr = tileList[indexY];
    arr[indexX] = 2;

    tileList[indexY] = arr;
	
	if (sfx)
		audio.PlayOneShot(tileComplete, .5*sfxScale);
}

function winCheck()
{
    //if all the rows are done, and haven't won yet win
    if (completedRows >= rows && !won && activeTilesPerRow != 0)
        win();
}

//checks if row is done, if it is, delete it
function rowCheck()
{
    var completedTilesInRow : int;
    var completedRow : int = -1;

    for (var i=0; i<tileList.length; i++)
    {
        var arr = [];
        arr = tileList[i];
		
        completedTilesInRow = 0;
        
        for (var j=0; j<arr.length; j++)
        {
            //if it's 2, then we've got one that's been stamped
            if (arr[j] == 2)
            {
                completedTilesInRow++;
            }
        }

		//if the whole row is complete
        if (completedTilesInRow >= activeTilesPerRow)
        {
            completedRow = i;
        }
    }

    //we completed a row, set the whole row to 0, so it doesn't get picked up again
    if (completedRow >= 0)
    {
        arr = tileList[completedRow];
        
        for (var k=0; k<arr.length; k++)
        {
            arr[k] = 0;
        }

        tileList[completedRow] = arr;
		
		if (sfx)
			audio.PlayOneShot(rowComplete,0.5*sfxScale);
        completedRows++;
        completedRow = -1;
    }
}

function win()
{
    won = true;
	
	if (sfx)
		audio.PlayOneShot(gameComplete,1.2*sfxScale);
    Camera.main.gameObject.BroadcastMessage("showWin");
}

function loadingPrint(str : String)
{
	var text : TextMesh;
    text = GameObject.Find("Loading Text").GetComponent(TextMesh);
	
	text.text = str;
}