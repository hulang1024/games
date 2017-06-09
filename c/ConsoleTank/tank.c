#include "tank.h"
#include "game.h" 
#include <math.h>

static long int tankId = 1;
int totalHostiles = 18;

Tank* createTank()
{
  Tank* tank = (Tank *)malloc(sizeof(Tank));
  tank->live = 1;
  tank->id = tankId++;
  return tank;
}

void destoryTank(Tank* tank)
{
  free(tank);
}

void initTankManager(TankManager* tankManager)
{
  INIT_LIST_HEAD(&tankManager->head);
}

void destoryTankManager(TankManager* tankManager)
{
  list_for_each(tankManager->plist, &tankManager->head) {
    TankNode *node = list_entry(tankManager->plist, TankNode, list);
    destoryTank(node->tank);
  }
}

TankNode* createTankNode(Tank* tank)
{
  TankNode* node = (TankNode *)malloc(sizeof(TankNode));
  node->tank = tank;
  return node;
}

void addTank(TankManager* tankManager, Tank* tank)
{
  list_add(&createTankNode(tank)->list, &tankManager->head);
}

void easeTank(Vector2* pos)
{
  setTextColor(DARK_GRAY); 
  gotoTextPosInMap(pos->x, pos->y + 0);
  puts("      ");
  gotoTextPosInMap(pos->x, pos->y + 1);
  puts("      ");
  gotoTextPosInMap(pos->x, pos->y + 2);
  puts("      ");
}

void drawTank(Tank* tank)
{
  char *s1, *s2, *s3;

  if(tank->dir == DIR_UP)
  {
    s1 = "  ¡ö  ";
    s2 = "¡ö¡ö¡ö";
    s3 = "¡ö  ¡ö";
  }
  else if(tank->dir == DIR_DOWN)
  {
    s1 = "¡ö  ¡ö";
    s2 = "¡ö¡ö¡ö";
    s3 = "  ¡ö  ";
  }
  else if(tank->dir == DIR_LEFT)
  {
    s1 = "  ¡ö¡ö";
    s2 = "¡ö¡ö  ";
    s3 = "  ¡ö¡ö";
  }
  else if(tank->dir == DIR_RIGHT)
  {
    s1 = "¡ö¡ö  ";
    s2 = "  ¡ö¡ö";
    s3 = "¡ö¡ö  ";
  }
  
  setTextColor(tank->color);
  gotoTextPosInMap(tank->pos.x, tank->pos.y + 0);
  puts(s1);
  gotoTextPosInMap(tank->pos.x, tank->pos.y + 1);
  puts(s2);
  gotoTextPosInMap(tank->pos.x, tank->pos.y + 2);
  puts(s3);
} 

int checkCanMove(Tank* tank, int dir)
{
  list_for_each(tankManager.plist, &tankManager.head)
  {
    TankNode* tankNode = list_entry(tankManager.plist, TankNode, list);
    Tank* otherTank = tankNode->tank; 
    if(otherTank == tank)
    {
      continue;
    }

    switch (dir)
    {
      case DIR_UP:
        if(otherTank->pos.y + TANK_HEIGHT == tank->pos.y && abs(otherTank->pos.x - tank->pos.x) < TANK_WIDTH)
        {
          return 0;
        }
        break;
      case DIR_DOWN:
        if(otherTank->pos.y == tank->pos.y + TANK_HEIGHT && abs(otherTank->pos.x - tank->pos.x) < TANK_WIDTH)
        {
          return 0;
        }
        break;
      case DIR_LEFT:
        if(otherTank->pos.x + TANK_WIDTH == tank->pos.x && abs(otherTank->pos.y - tank->pos.y) < TANK_HEIGHT)
        {
          return 0;
        }
        break;
      case DIR_RIGHT:
        if(otherTank->pos.x == tank->pos.x + TANK_WIDTH && abs(otherTank->pos.y - tank->pos.y) < TANK_HEIGHT)
        {
          return 0;
        }
        break;
    }
  }

  return 1;
}

void move(Tank* tank, int dir)
{
  Vector2 oldPos = tank->pos;
  int oldDir = tank->dir;
  int canMove = 0;
  
  switch (dir)
  {
    case DIR_UP:
      if(tank->pos.y - 1 >= 0
        && isNotBarrier(&stage.map, tank->pos.x + 0, tank->pos.y - 1)
        && isNotBarrier(&stage.map, tank->pos.x + 1, tank->pos.y - 1)
        && isNotBarrier(&stage.map, tank->pos.x + 2, tank->pos.y - 1) && checkCanMove(tank, dir))
      {
        canMove = 1;
        tank->pos.y--;
      }
      break;
    case DIR_DOWN:
      if(tank->pos.y + TANK_HEIGHT < stage.map.height
        && isNotBarrier(&stage.map, tank->pos.x + 0, tank->pos.y + TANK_HEIGHT)
        && isNotBarrier(&stage.map, tank->pos.x + 1, tank->pos.y + TANK_HEIGHT)
        && isNotBarrier(&stage.map, tank->pos.x + 2, tank->pos.y + TANK_HEIGHT) && checkCanMove(tank, dir))
      {
        canMove = 1;
        tank->pos.y++;
      }
      break;
    case DIR_LEFT:
      if(tank->pos.x - 1 >= 0
        && isNotBarrier(&stage.map, tank->pos.x - 1, tank->pos.y + 0)
        && isNotBarrier(&stage.map, tank->pos.x - 1, tank->pos.y + 1)
        && isNotBarrier(&stage.map, tank->pos.x - 1, tank->pos.y + 2) && checkCanMove(tank, dir))
      {
        canMove = 1;
        tank->pos.x--;
      }
      break;
    case DIR_RIGHT:
      if(tank->pos.x + TANK_WIDTH < stage.map.width
        && isNotBarrier(&stage.map, tank->pos.x + TANK_WIDTH, tank->pos.y + 0)
        && isNotBarrier(&stage.map, tank->pos.x + TANK_WIDTH, tank->pos.y + 1)
        && isNotBarrier(&stage.map, tank->pos.x + TANK_WIDTH, tank->pos.y + 2) && checkCanMove(tank, dir))
      {
        canMove = 1;
        tank->pos.x++;
      }
      break;
  }
 
  if(canMove)
  {
    /*
    if(tank->id == 1)
    {
      setTextColor(tank->color);
      gotoTextPos((stage.map.width + 1) * 2, 2);
      printf("player1 (%3d,%3d)", tank->pos.x, tank->pos.y);
    }
    if(tank->id == 2)
    {
      setTextColor(tank->color);
      gotoTextPos((stage.map.width + 1) * 2, 3);
      printf("player2 (%3d,%3d)", tank->pos.x, tank->pos.y);
    }*/
    tank->dir = dir;
    easeTank(&oldPos);
    drawTank(tank);
  }
}

void fire(Tank* tank, BulletManager* bulletManager)
{
  if(tank->fireBuffering)
    return;
  tank->fireBuffering = 1;
  
  Bullet* bullet = (Bullet*)createBullet();
  switch (tank->dir)
  {
    case DIR_UP:
      bullet->pos.x = tank->pos.x + 1;
      bullet->pos.y = tank->pos.y - 1;
      break;
    case DIR_DOWN:
      bullet->pos.x = tank->pos.x + 1;
      bullet->pos.y = tank->pos.y + TANK_HEIGHT;
      break;
    case DIR_LEFT:
      bullet->pos.x = tank->pos.x - 1;
      bullet->pos.y = tank->pos.y + 1;
      break;
    case DIR_RIGHT:
      bullet->pos.x = tank->pos.x + TANK_HEIGHT;
      bullet->pos.y = tank->pos.y + 1;
      break;
  }
  bullet->dir = tank->dir;
  bullet->parentTank = tank;
  bullet->power = 1;
  bullet->live = 1;
  bullet->oldPos.x = -1;
  bullet->oldPos.y = -1;
  addBullet(bulletManager, bullet);
}


void drawTanks(TankManager* tankManager, clock_t gameClock)
{
  static clock_t lastClock = 0;
  if(gameClock - lastClock < 17)
  {
    return;
  }
  lastClock = clock();
  int index = 0; 
  list_for_each(tankManager->plist, &tankManager->head)
  {
    TankNode* tankNode = list_entry(tankManager->plist, TankNode, list);
    Tank* tank = tankNode->tank;
    
    if(tank->host == HOST_PLAYER)
      continue;

    drawTank(tank);
    
    if(tank->live)
    {
    }
    else
    {
      easeTank(&tank->pos);
      destoryTank(tank);
      list_del(&tankNode->list);
      return;//wait fix  
    }
    index++;
  }
}

void randomHostileTanks()
{
  if(totalHostiles < 0) return;
  int cnt = randInt(0, 4);
  while(cnt-- > 0)
  {
    Tank* tank = (Tank*)createTank();
    tank->host = HOST_HOSTILE;
    tank->color = DARK_GRAY;
    tank->pos.x = randInt(0, stage.map.width - TANK_WIDTH);
    tank->pos.y = 0;
    tank->dir = DIR_DOWN;
    tank->velocity = 1;
    tank->fireBuffering = 0;
    addTank(&tankManager, tank);
    drawTank(tank);
  }
  totalHostiles -= cnt;
} 

void onHitTank(Bullet* bullet, Tank* tank)
{
  if(bullet->parentTank->host != tank->host)
  {
    tank->live = 0;
    bullet->live = 0;
    bullet->parentTank->fireBuffering = 0;
    if(tank->host == HOST_HOSTILE)
    {
      randomHostileTanks();
    }
    else
    {
      easeTank(&tank->pos);
    }
  }
  else
  {
    //drawTank(tank);
  }
}

void updateHostileTanks(clock_t gameClock)
{
  static clock_t lastClock = 0;
  if(gameClock - lastClock < 2000)
  {
    return;
  }
  lastClock = clock();
  int hostiles = 0;
  list_for_each(tankManager.plist, &tankManager.head) {
    TankNode* tankNode = list_entry(tankManager.plist, TankNode, list);
    Tank* tank = tankNode->tank;

    if(tank->host == HOST_PLAYER)
      continue;
    
    int r = randInt(0, 5);
    if(r == 5) fire(tank, &bulletManager);
    else move(tank, r);
    
    hostiles++;
  }
  if(hostiles < 3)
    randomHostileTanks();
}
