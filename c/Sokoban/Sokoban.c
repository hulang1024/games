#include <stdio.h>
#include <time.h>
#include <ctype.h>
#include "c_string.h"
#include "config.h"
#include "sokoban_objects.h"
#include "sokoban_formats.h"
#include "pcc32.h"


//up, down, left, right
int moveKeyVarArray[4];
long gameTime = 0L;
int autoplayMode = 0, playSpeed = 250;
int frameIndex;
long autoplayClock;
int manX, manY;
int nowLevel;
int moves;
int appWidth, appHeight;
int gameIsOver = 0; 
int sysMsgPopTime = -1;

SMap map;
SSolution solution;

void showSysMsg(const char* formatMsg, ...)
{
  int otc = getTextColor();
  setTextColor(BROWN);
  gotoTextPos(0, appHeight - 3);
  char msg[200];
  sprintf(msg, "[ %s ]", formatMsg);
  printf("%s", msg);
  setTextColor(otc);
  sysMsgPopTime = clock();
}

void clearSysMsg()
{
  gotoTextPos(0, appHeight - 3);
  int i,j;
  for (i = 0; i < 2; i++)
    for (j = 0; j < appWidth * 2 - 1; j++)
      printf(" ");
}

void tick()
{
  if(sysMsgPopTime > -1 && clock() - sysMsgPopTime >= 2000)
  {
    clearSysMsg();
    sysMsgPopTime = -1;
  }
}

void drawPlaySpeedNum()
{
  int otc = getTextColor();
  setTextColor(BROWN);
  gotoTextPos(45, appHeight - 3);
  printf("当前延时:%-04dms", playSpeed);
  setTextColor(otc);
}

void showAutoplayingInfo(int playing)
{
  if (playing)
  { 
    int otc = getTextColor();
    setTextColor(BROWN);
    gotoTextPos(0, appHeight - 3);
    printf("自动解决正在播放中.按-减慢和按+=加快播放速度");
    drawPlaySpeedNum();
    setTextColor(otc);
  }
  else
    clearSysMsg();
}


void saveSolution()
{
  char filename[50];
  if(nowLevel > 0)
  {
    sprintf(filename, "./solutions/%d.txt", nowLevel);
  }
  else
  {
    strcpy(filename, "./solutions/solution.txt");
  }
  FILE* fd = fopen(filename, "w");
  int j;
  for (j = 0; j < solution.length; j++)
  {
    fputc("LURD"[solution.array[j]], fd);
  }
  fclose(fd);
  
  char msg[200];
  sprintf(msg, "解决方案已保存为%s", filename);
  showSysMsg(msg);
}

void setObject(int r, int c, int obj)
{
  PCCOLOR colors[] = {LIGHT_RED, LIGHT_RED, YELLOW, LIGHT_GREEN, LIGHT_GRAY, LIGHT_BLUE, BLACK};
  char graphs[][3] = {"♀", "♀", "●", "⊙", "□", "○", "■"};
  int baseX = (appWidth - map.cols) / 2;
  int baseY = (appHeight - map.rows) / 2;
  map.array[r][c] = obj;
  gotoTextPos((baseX + c) * 2, baseY + r);
  setTextColor(colors[map.array[r][c]]);
  printf("%2s",  graphs[map.array[r][c]]);
}

void drawMap()
{
  int r, c;
  for (r = 0; r < map.rows; r++)
    for (c = 0; c < map.cols; c++)
    {
      setObject(r, c, map.array[r][c]);
    }
}

void drawOptions()
{
  gotoTextPos(0, 2);
  printf("重新开始关卡: Tab\n");
  printf("上一关: PgUp\n");
  printf("下一关: PgDn\n");
  printf("回放解决方案: Ctrl+A\n");
  printf("保存进度: Ctrl+D\n");
  printf("退出: Esc");
}

void drawLevelNum(int level)
{
  gotoTextPos(20, 0);
  char levelText[20];
  sprintf(levelText, "第%d关", level);
  gotoTextPos(appWidth - strlen(levelText) / 2 - 2, 0);
  setTextColor(LIGHT_GRAY);
  printf("%s", levelText);
}

void drawMoves(int moves)
{
  gotoTextPos(appWidth * 2 - 20, 0);
  setTextColor(LIGHT_GRAY);
  printf("步数: %d", moves);
}

void countTime()
{
  static long lastClock = 0L;
  if (clock() - lastClock >= 1000)
  {
    lastClock = clock();
    gotoTextPos(9, 0);
    setTextColor(LIGHT_GRAY);
    printf("%ld", gameTime++);
  }
}

int loadMap()
{
  FILE* fd = fopen("./maps/map.txt", "r");
  if (fd != NULL)
  {
    decodeMap(&map, fd);
    fclose(fd);
    nowLevel = 0;
    return 0;
  }

  char filename[50];
  sprintf(filename, "./maps/%d.txt", nowLevel + 1);
  fd = fopen(filename, "r");
  if (fd != NULL)
  { 
    decodeMap(&map, fd);
    fclose(fd);
    nowLevel++;
    return 0;
  }
  return 1;
}

int loadSolution()
{
  char filename[50];
  sprintf(filename, "./solutions/%d.txt", nowLevel);
  FILE* fd;
  fd = fopen(filename, "r");
  if (fd == NULL)
  {
    fd = fopen("./solutions/solution.txt", "r");
  }
  
  int success = 1; 
  if(fd != NULL)
  { 
    success = decodeSolution(&solution, fd);
    fclose(fd);
  }
  return success;
}

void nextLevel()
{
  int ret = loadMap();
  if(ret != 0)
    return;

  char winTitle[300] = "Sokoban ";
  if(map.author[0] != 0 && map.title[0] != 0)
    sprintf(winTitle, "Sokoban %s - %s", map.author, map.title);
  else if(map.author[0] != 0)
    strcat(winTitle, map.author);
  else if(map.title[0] != 0)
    strcat(winTitle, map.title);
  setConsoleTitle(winTitle);
  
  if(config_getBoolVal("AutomaticWindowSizing"))
  {
    appWidth = map.cols + 20;
    appHeight = map.rows + 14;
    fixConsoleSize(appWidth * 2, appHeight);
  }
  
  gameIsOver = 0;
  moves = 0;
  gameTime = 1;
  solution.length = 0;
  manX = map.manX;
  manY = map.manY;
  
  clearText();
  drawOptions();
  drawLevelNum(nowLevel);
  drawMoves(moves);
  drawMap(&map);
  gotoTextPos(0, 0);
  setTextColor(LIGHT_GRAY);
  printf("时间(s): %ld", 0);
}

void restartLevel()
{
  nowLevel--;
  nextLevel();
}

void prevLevel()
{
  if (nowLevel > 1)
  {
    nowLevel -= 2;
    nextLevel();
  }
}

int isFinish(SMap* map)
{
  int boxCount = 0, goalCount = 0, boxOnGoalCount = 0;
  int r, c;
  for (r = 0; r < map->rows; r++)
  {
    for (c = 0; c < map->cols; c++)
    {
      int obj = map->array[r][c];
      if(obj == BOX_ON_GOAL) boxOnGoalCount++;
      else if(obj == BOX) boxCount++;
      else if(obj == GOAL) goalCount++;
      if (obj == GOAL || obj == MAN_ON_GOAL)
        return 0;
    }
  }
  return goalCount > 0 && goalCount == boxCount;
}

void move(int moveDir)
{
  int ox, oy;
  int x = manX;
  int y = manY;
  int canMove = 0;
  switch (moveDir)
  {
    case DIR_LEFT:
      x--;
      ox = -1, oy = 0;
      break;
    case DIR_UP:
      y--;
      ox = 0, oy = -1;
      break;
    case DIR_RIGHT:
      x++;
      ox = 1, oy = 0;
      break;
    case DIR_DOWN:
      y++;
      ox = 0, oy = 1;
      break;
  }
  if (map.array[y][x] == SPACE)
  {
    setObject(y, x, MAN);
    canMove = 1;
  }
  else if (map.array[y][x] == GOAL)
  {
    setObject(y, x, MAN_ON_GOAL);
    canMove = 1;
  }
  else if (map.array[y][x] == BOX || map.array[y][x] == BOX_ON_GOAL)
  {
    if (map.array[y + oy][x + ox] == GOAL || map.array[y + oy][x + ox] == SPACE)
    {
      if (map.array[y][x] == BOX_ON_GOAL)
        setObject(y, x, MAN_ON_GOAL);
      else
        setObject(y, x, MAN);
      if (map.array[y + oy][x + ox] == GOAL)
        setObject(y + oy, x + ox, BOX_ON_GOAL);
      else
        setObject(y + oy, x + ox, BOX);
      canMove = 1;
    }
  }

  if (canMove)
  {
    if (map.array[manY][manX] == MAN_ON_GOAL)
      setObject(manY, manX, GOAL);
    else
      setObject(manY, manX, SPACE);
    manX = x;
    manY = y;
    moves++;
    drawMoves(moves);
    if (gameIsOver = isFinish(&map))
    {
      if (autoplayMode)
      {
        showAutoplayingInfo(0);
      }
      else
      {
        saveSolution();
      }
    }
  }
}

void switchAutoplayMode()
{
  if (autoplayMode)
  {
    autoplayMode = 0;
    showAutoplayingInfo(0);
  }
  else
  {
    restartLevel();
    int ret = loadSolution();
    if(ret == 0)
    {
      autoplayMode = 1;
      frameIndex = 0;
      autoplayClock = clock();
      showAutoplayingInfo(1);
    }
    else
    {
      showSysMsg("读取解决方案文件失败，该文件可能不存在!"); 
    }
  }
}

int onKeyDown()
{
  if (!jkHasKey())
    return 0;

  uint16 inputKey = jkGetKey();
  if(97 <= inputKey && inputKey <= 97+25)
    inputKey = toupper(inputKey);

  int moveDir = DIR_NONE;
  int d;
  for(d = 0; d < 4; d++)
  {
    if(inputKey == moveKeyVarArray[d])
    {
      moveDir = d;
      if (!gameIsOver && !autoplayMode)
      {
        if (solution.length < SOLUTION_LENGTH_MAX)
          solution.array[solution.length++] = moveDir;
        move(moveDir);
      }
    }
  }

  switch (inputKey)
  {
    case JK_TAB:
      restartLevel();
      break;
    case JK_PGUP:
      prevLevel();
      break;
    case JK_PGDW:
      nextLevel();
      break;
    case JK_CTRL_A:
      switchAutoplayMode();
      break;
    case JK_CTRL_D:
      saveSolution();
      break;
    case '+': case '=':
      if (autoplayMode && playSpeed > 0)
      {
        playSpeed -= 10;
        drawPlaySpeedNum();
      }
      break;
    case '-':
      if (autoplayMode && playSpeed < 9990)
      {
        playSpeed += 10;
        drawPlaySpeedNum();
      }
      break;
    case JK_ESC:
      exit(0);
    default: ;
  }

  return 1;
}

void loadConfigAndSetting()
{
  loadConfig();
  
  appWidth = config_getIntVal("Width") / 8 / 2;
  appHeight = config_getIntVal("Height") / 16;
  if(!config_getBoolVal("AutomaticWindowSizing"))
  {
    fixConsoleSize(config_getIntVal("Width") / 8, appHeight);
  }
  
  //up, down, left, right
  char* arrowKeyKeyArray[] = {"keyUpMove", "keyDownMove", "keyLeftMove", "keyRightMove"};
  char* arrowKeyNameArray[] = {"Up", "Down", "Left", "Right"};
  int arrowKeyValArray[] = {JK_UP, JK_DOWN, JK_LEFT, JK_RIGHT};
  int kki, kvi;
  for(kki = 0; kki < 4; kki++)
  {
    char* cfgKeyVal = config_getStringVal(arrowKeyKeyArray[kki]);
    int isArrowKey = 0;
    for(kvi = 0; kvi < 4; kvi++)
    {
      if(string_equals(arrowKeyNameArray[kvi], cfgKeyVal))
      {
        moveKeyVarArray[kki] = arrowKeyValArray[kvi];
        isArrowKey = 1;
        break;
      }
    }
    if(!isArrowKey)
    {
      if(strlen(cfgKeyVal) == 1)
        moveKeyVarArray[kki] = toupper(cfgKeyVal[0]);
    }
  }

}

int main()
{
  loadConfigAndSetting();  

  setConsoleTitle("Sokoban");
  setCursorVisible(0);

  nowLevel = 0;
  nextLevel();

  while (1)
  {
    onKeyDown();
    tick();
    if(!gameIsOver)
      countTime();
    if (autoplayMode)
    {
      if (clock() - autoplayClock >= playSpeed)
      {
        autoplayClock = clock();
        if (frameIndex < solution.length)
        {
          move(solution.array[frameIndex]);
          frameIndex++;
        }
        else
        {
          autoplayMode = 0;
          showAutoplayingInfo(0);
          gotoTextPos(0, appHeight - 3);
          showSysMsg("自动播放已结束!");
          gameIsOver = 1;
        }
      }
    }
  }

  jkGetKey();
  return 0;
}
