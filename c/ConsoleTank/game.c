#include <stdio.h>
#include "game.h"

void exitGame()
{
  destoryTankManager(&tankManager);
  destoryBulletManager(&bulletManager);
  exit(0);
}

int randInt(int n, int m) {
  return (rand() % (m - n + 1)) + n;
}

void drawPlayfieldUI()
{
  int i;
  setTextColor(DARK_GRAY);
  for(i = 0; i <= stage.map.height; i++)
  {
    gotoTextPos((stage.map.width + 1) * 2, i);
    printf("©¶");
  }
}

void init()
{
  srand((uint32)time(NULL));

  stage.map.width = MAP_WIDTH_DEFAULT;
  stage.map.height = MAP_HEIGHT_DEFAULT;
  stage.num = 1;

  initTankManager(&tankManager);
  initBulletManager(&bulletManager);
  bulletManager.stage = &stage;
  
  tankPlayer1 = (Tank*)createTank();
  tankPlayer1->host = HOST_PLAYER;
  tankPlayer1->color = CYAN;
  tankPlayer1->pos.x = stage.map.width / 2 - TANK_HEIGHT - 4;
  tankPlayer1->pos.y = stage.map.height - TANK_HEIGHT;
  tankPlayer1->dir = DIR_UP;
  tankPlayer1->velocity = 1;
  tankPlayer1->fireBuffering = 0;
  
  tankPlayer2 = (Tank*)createTank();
  tankPlayer2->host = HOST_PLAYER;
  tankPlayer2->color = BROWN;
  tankPlayer2->pos.x = stage.map.width / 2 + 2;
  tankPlayer2->pos.y = stage.map.height - TANK_HEIGHT;
  tankPlayer2->dir = DIR_UP;
  tankPlayer2->velocity = 1;
  tankPlayer2->fireBuffering = 0;

  addTank(&tankManager, tankPlayer1);
  addTank(&tankManager, tankPlayer2);
}

void load()
{
  gotoTextPosInMap(APP_WIDTH / 2 - 6, APP_HEIGHT / 2);
  printf("º”‘ÿ÷–...«Î…‘∫Û:)");
  loadStage(&stage);
  clearText();
  drawPlayfieldUI();
  drawMap(&stage.map);
  drawTank(tankPlayer2);
  drawTank(tankPlayer1);
}

void update(clock_t gameClock)
{
  updateHostileTanks(gameClock);
  updateBullets(&bulletManager, gameClock);

  if (jkHasKey())
  { 
    uint16 inputKey = jkGetKey();
    if(97 <= inputKey && inputKey <= 97+25)
      inputKey = toupper(inputKey);
    
    switch (inputKey)
    {
      //1#player key
      case 'W':
        tankPlayer1->live && move(tankPlayer1, DIR_UP);
        break;
      case 'S':
        tankPlayer1->live && move(tankPlayer1, DIR_DOWN);
        break;
      case 'A':
        tankPlayer1->live && move(tankPlayer1, DIR_LEFT);
        break;
      case 'D':
        tankPlayer1->live && move(tankPlayer1, DIR_RIGHT);
        break;
      case 'J':
        tankPlayer1->live && fire(tankPlayer1, &bulletManager);
        break;
        
      //2#player key
      case JK_UP:
        tankPlayer2->live && move(tankPlayer2, DIR_UP);
        break;
      case JK_DOWN:
        tankPlayer2->live && move(tankPlayer2, DIR_DOWN);
        break;
      case JK_LEFT:
        tankPlayer2->live && move(tankPlayer2, DIR_LEFT);
        break;
      case JK_RIGHT:
        tankPlayer2->live && move(tankPlayer2, DIR_RIGHT);
        break;
      case '0':
        tankPlayer2->live && fire(tankPlayer2, &bulletManager);
        break;
      case JK_ESC:
        exitGame();
        break;
    }
  }
}

void draw(clock_t gameClock)
{
  drawTanks(&tankManager, gameClock);
}

int loadStage(Stage* stage)
{
  char stageFilename[30];
  sprintf(stageFilename, "./data/stages/%d.txt", stage->num);
  FILE* fd = fopen(stageFilename, "r");
  if (fd != NULL)
  {
    decodeStage(stage, fd);
    fclose(fd);
    return 0;
  }
  else
  {
    printf("open error: %s", stageFilename);
    getchar();
    exit(0);
    return 1;
  }
}
