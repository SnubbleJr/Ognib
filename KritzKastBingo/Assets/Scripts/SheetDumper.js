#pragma strict
import System.IO;
 
var tile : GameObject;
var emptyTile : GameObject;

var cols : int;
var rows: int;
var activeTilesPerRow : int;

var scale : float = 1;

var ruleTextLen = 15;

var tileComplete : AudioClip;
var rowComplete : AudioClip;
var GameComplete : AudioClip;

private var filePath : String;
private var line : String;

private var classList = new Array();
private var presenterList = new Array();
private var ruleList = new Array();

private var tileList = Array();

private var completedRows : int = 0;

private var won = false;

//for the p[osisition of the the tiles, have the logic stored in an array, and then just scaled, so 2,4 etc

function Start ()
{
    filePath = Application.dataPath;

    yield applySettings();

    yield makeLists();

    applyActiveTiles();
    spawnTiles();
}

function makeLists()
{
    makeClassList();
    makePresenterList();
    makeRulesList();

    makeTileList();
}

function getWebSettings() : String
{
}

function getDiskClasses() : String
{

}

function getDiskPresenterss() : String
{

}

function getDiskRuless() : String
{

}

function applySettings()
{
    var baseCols : float = 9;
    var baseRows : float = 3;
    var colRatio : float;
    var rowRatio : float;

    var path : String = Path.Combine(filePath,"Settings.txt");

#if UNITY_EDITOR
    var sr : StreamReader;

    sr = new File.OpenText(path);
    
    line = sr.ReadLine();
 
    if (line != null)
        cols = parseInt(line);

    line = sr.ReadLine();
 
    if (line != null)
        rows = parseInt(line);

    line = sr.ReadLine();
 
    if (line != null)
        activeTilesPerRow = parseInt(line);

        // Done reading, close the reader
    sr.Close();

#elif UNITY_WEBPLAYER
    var str : String;
    var www : WWW = new WWW (path);

    yield www;
    
    str = www.text;

    var lines = str.Split("\n"[0]);
    
    if (lines.length > 0)
        cols = parseInt(lines[0]);
    
    if (lines.length > 1)
        rows = parseInt(lines[1]);
    
    if (lines.length > 2)
        activeTilesPerRow = parseInt(lines[2]);

#endif
    
    //se we don't err here
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
}

function makeTileList()
{
    var arr1 = Array();
    var arr2 = Array();

    for (var j=0; j<cols; j++)
    {
        arr2.push(false);
    }

    for (var i=0; i<rows; i++)
    {
        arr1.push(arr2);
    }

    tileList = arr1;
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
            if (arr[range] == false)
            {
                arr[range] = true;
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
    try
    {
        var clas : Class;

        var sr = new File.OpenText(Path.Combine(filePath,"Classes.txt"));

        do
        {
            line = sr.ReadLine();
 
            if (line != null)
            {
                clas = parseClass(line);
                if (clas != null)
                {
                    classList.push(clas);
                }
            }
        }
        while (line != null);
 
        // Done reading, close the reader
        sr.Close();
    }
        
    // If anything broke in the try block, we throw an exception with information
    // on what didn't work
    catch (e)
    {
        print(e.Message);
    }
}

function makePresenterList()
{    
    try
    {
        var presenter : Presenter;

        var sr = new File.OpenText(Path.Combine(filePath,"Presenters.txt"));

        do
        {
            line = sr.ReadLine();
 
            if (line != null)
            {
                presenter = parsePresenter(line);
                if (presenter != null)
                {
                    presenterList.push(presenter);
                }
            }
        }
        while (line != null);
 
        // Done reading, close the reader
        sr.Close();
    }
        
    // If anything broke in the try block, we throw an exception with information
    // on what didn't work
    catch (e)
    {
        print(e.Message);
    }
}

function makeRulesList()
{    
    try
    {
        var rule : Rule;

        var sr = new File.OpenText(Path.Combine(filePath,"Rules.txt"));

        do
        {
            line = sr.ReadLine();
 
            if (line != null)
            {
                rule = parseRule(line);
                if (rule != null)
                {
                    ruleList.push(rule);
                }
            }
        }
        while (line != null);
 
        // Done reading, close the reader
        sr.Close();
    }
        
    // If anything broke in the try block, we throw an exception with information
    // on what didn't work
    catch (e)
    {
        print(e.Message);
    }
}

function parseClass(str : String) : Class
{
    var clas : Class = new Class();
    var subStr : String[];

    subStr = str.Split("`"[0]);

    if(subStr.length > 0)
    {
        var tex : Texture2D;
        tex = Resources.Load(subStr[1]);

        if (tex == null)
        {
            return null;
        }
        
        clas.className = subStr[0];
        clas.classIcon = tex;
    }
    else
    {
        return null;
    }

    return clas;
}

function parsePresenter(str : String) : Presenter
{
    var presenter : Presenter = new Presenter();
    var subStr : String[];

    subStr = str.Split("`"[0]);

    if(subStr.length >= 1)
    {
        //if there's a pic file round here...
        var tex = Resources.Load(subStr[2]);

        if (tex != null)
        {
            presenter.picture = tex;
        }
                
        presenter.name = subStr[0];
        presenter.clas = getClass(subStr[1]);
    }
    else
    {
        return null;
    }

    return presenter;
}

function parseRule(str : String) : Rule
{
    var rule : Rule = new Rule();
    var subStr : String[];

    subStr = str.Split("`"[0]);

    var text : String = resolveTextSize(subStr[1], ruleTextLen);
    //if rule is empty, or too long
    if(subStr.length > 0 && text != null)
    {        
        rule.presenter = getPresenter(subStr[0]);
        rule.text = text;
    }
    else
    {
        return null;
    }

    return rule;
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

//loop through the tileList and spawn active where true, else false
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
            if (arr[j] == true)
            {
                var rule : Rule = getRule();

                if (rule != null)
                {
                    spawnTile(tile, vec, rule);
                }
                else
                {
                    spawnTile(emptyTile, vec, null);
                }
            }
            else
            {
                spawnTile(emptyTile, vec, null);
            }
        }
    }
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
}

function Update()
{
    rowCheck();
    winCheck();
}

public function stampTile(tile : GameObject)
{
    var indexX : int = tile.GetComponent(BingoTile).arrIndex.x;
    var indexY : int = tile.GetComponent(BingoTile).arrIndex.y;
    var arr = [];

    arr = tileList[indexY];
    arr[indexX] = null;

    tileList[indexY] = arr;

    audio.PlayOneShot(tileComplete, .5);
}

function winCheck()
{
    //if all the rows are done, and haven't won yet win
    if (completedRows >= rows && !won)
        win();
}

//checks if row is done, if it is, delete it
function rowCheck()
{
    var completedTilesInRow : int = 0;
    var completedRow : int = -1;

    for (var i=0; i<tileList.length; i++)
    {
        var arr = [];
        arr = tileList[i];
        
        for (var j=0; j<arr.length; j++)
        {
            var vec : Vector2 = new Vector2(j,i);

            //if it's null, then we've got one that's been set
            if (arr[j] == null)
            {
                completedTilesInRow++;
            }
        }

        if (completedTilesInRow >= activeTilesPerRow)
        {
            completedRow = i;
        }

        completedTilesInRow = 0;
    }

    //we completed a row, set the whole row to false, so it doesn't get picked up again
    if (completedRow >= 0)
    {
        arr = tileList[completedRow];
        
        for (var k=0; k<arr.length; k++)
        {
            arr[k] = false;
        }

        tileList[completedRow] = arr;

        audio.PlayOneShot(rowComplete,0.5);
        completedRows++;
        completedRow = -1;
    }
}

function win()
{
    won = true;
    audio.PlayOneShot(GameComplete,1.2);
    Camera.main.gameObject.BroadcastMessage("showWin");
}