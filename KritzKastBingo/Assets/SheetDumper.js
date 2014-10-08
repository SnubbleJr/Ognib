#pragma strict
import System.IO;
 
var tile : GameObject;
var emptyTile : GameObject;

var cols : int;
var rows: int;
var activeTilesPerRow : int;

private var filePath : String;
private var line : String;

private var classList = new Array();
private var presenterList = new Array();
private var ruleList = new Array();

private var tileList = Array();

//for the p[osisition of the the tiles, have the logic stored in an array, and then just scaled, so 2,4 etc

function Start ()
{
    filePath = Application.dataPath;

    applySettings();

    makeLists();
    applyActiveTiles();
}

function makeLists()
{
    makeClassList();
    makePresenterList();
    makeRulesList();

    makeTileList();
}

function applySettings()
{
    var sr = new File.OpenText(Path.Combine(filePath,"Settings.txt"));
    
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

    //se we don't err here
    if (activeTilesPerRow > cols)
        activeTilesPerRow = cols;
}

function makeTileList()
{
    var arr1 = Array();
    var arr2 = Array();

    for (var j=0; j<rows; j++)
    {
        arr2.push(false);
    }

    for (var i=0; i<cols; i++)
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
                tileList[range] = true;
                //here we spawn the the tile, need to add a posistion function 
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

    if(subStr.length > 1)
    {
        var tex : Texture2D;
        tex = Resources.Load(subStr[2]);
                
        presenter.name = subStr[0];
        presenter.clas = getClass(subStr[1]);
        presenter.picture = tex;
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

    if(subStr.length > 0)
    {        
        rule.presenter = getPresenter(subStr[0]);
        rule.text = subStr[1];
    }
    else
    {
        return null;
    }

    return rule;
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

function spawnTile(tile : GameObject, posistion : Vector3, rule : Rule)
{
    var newTile : GameObject;

    newTile = Instantiate(tile, posistion, transform.rotation);
    newTile.SendMessage("setRule", rule);
}