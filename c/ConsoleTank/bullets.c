#include "game.h"
#include "list.h"

Bullet* createBullet()
{
  return (Bullet *)malloc(sizeof(Bullet));
}

Bullet* destoryBullet(Bullet* bullet)
{
  free(bullet);
}

void initBulletManager(BulletManager* bulletManager)
{
  INIT_LIST_HEAD(&bulletManager->head);
}

void destoryBulletManager(BulletManager* bulletManager)
{
  list_for_each(bulletManager->plist, &bulletManager->head) {
    BulletNode *node = list_entry(bulletManager->plist, BulletNode, list);
    destoryBullet(node->bullet);
  }
}

BulletNode* createBulletNode(Bullet* bullet)
{
  BulletNode* node = (BulletNode *)malloc(sizeof(BulletNode));
  node->bullet = bullet;
  return node;
}

void onCollisionBrick(BulletManager* bulletManager, Bullet* bullet)
{
  Vector2* brickPos = &bullet->pos;
  int* pBrick = &bulletManager->stage->map.array[brickPos->y][brickPos->x];
  if(*pBrick == STONE_BRICK || (*pBrick == STEEL_BRICK && bullet->power > 1))
  {
    setObject(&bulletManager->stage->map, brickPos->y, brickPos->x, EMPTY);
  }
  bullet->live = 0;
  bullet->parentTank->fireBuffering = 0;
}

int checkCollisionWall(BulletManager* bulletManager, Bullet* bullet)
{
  int b = 0;
  switch (bullet->dir)
  {
    case DIR_UP:
      if(bullet->pos.y < 0)
        b = 1;
      break;
    case DIR_DOWN:
      if(bullet->pos.y > bulletManager->stage->map.height - 1)
        b = 1;
      break;
    case DIR_LEFT:
      if(bullet->pos.x < 0)
        b = 1;
      break;
    case DIR_RIGHT:
      if(bullet->pos.x > bulletManager->stage->map.width - 1)
        b = 1;
      break;
  }
  return b;
}

//cond: step buttles
void checkCollisions(BulletManager* bulletManager, Bullet* bullet)
{
  if(checkCollisionWall(bulletManager, bullet))
  {
    bullet->live = 0;
    bullet->parentTank->fireBuffering = 0;
    return;
  }
  
  /*
  list_for_each(bulletManager->plist, &bulletManager->head) {
    BulletNode* bulletNode = list_entry(bulletManager->plist, BulletNode, list);
    Bullet* otherBullet = bulletNode->bullet;
    
    if((bullet->pos.x == otherBullet->pos.x && bullet->pos.y == otherBullet->pos.y) &&
        bullet->parentTank->host != otherBullet->parentTank->host)
    {
      bullet->live = 0;
      otherBullet->live = 0;
      return;
    }
  }*/

  int obj = bulletManager->stage->map.array[bullet->pos.y][bullet->pos.x];
  if(obj == STONE_BRICK || obj == STEEL_BRICK)
  {
    onCollisionBrick(bulletManager, bullet);
    return;
  }
  else if(obj == GRASS)
  {
    return;
  }
  
  list_for_each(tankManager.plist, &tankManager.head) {
    TankNode* tankNode = list_entry(tankManager.plist, TankNode, list);
    Tank* tank = tankNode->tank;

    switch (bullet->dir)
    {
      case DIR_UP: 
        if(bullet->pos.y == tank->pos.y + TANK_HEIGHT - 1 &&
          (bullet->pos.x == tank->pos.x || (bullet->pos.x > tank->pos.x && bullet->pos.x - tank->pos.x < TANK_WIDTH)))
        {
          onHitTank(bullet, tank);
        }
        break;
      case DIR_DOWN:
        if(bullet->pos.y == tank->pos.y &&
          (bullet->pos.x == tank->pos.x || (bullet->pos.x > tank->pos.x && bullet->pos.x - tank->pos.x < TANK_WIDTH)))
        {
          onHitTank(bullet, tank);
        }
        break;
      case DIR_LEFT:
        if(bullet->pos.x == tank->pos.x + TANK_HEIGHT - 1 &&
          (bullet->pos.y == tank->pos.y || (bullet->pos.y > tank->pos.y && bullet->pos.y - tank->pos.y < TANK_WIDTH)))
        {
          onHitTank(bullet, tank);
        }
        break;
      case DIR_RIGHT:
        if(bullet->pos.x == tank->pos.x &&
          (bullet->pos.y == tank->pos.y || (bullet->pos.y > tank->pos.y && bullet->pos.y - tank->pos.y < TANK_WIDTH)))
        {
          onHitTank(bullet, tank);
        }
        break;
    }
  }
}

void addBullet(BulletManager* bulletManager, Bullet* bullet)
{
  if(checkCollisionWall(bulletManager, bullet))
    return;
  list_add(&createBulletNode(bullet)->list, &bulletManager->head);
}

void drawBullet(Bullet* bullet)
{
  setTextColor(WHITE);
  gotoTextPosInMap(bullet->pos.x, bullet->pos.y);
  printf("¡ñ");
}

void stepBullet(Bullet* bullet)
{
  bullet->oldPos = bullet->pos; 
  switch (bullet->dir)
  {
    case DIR_UP:
      bullet->pos.y--;
      break;
    case DIR_DOWN:
      bullet->pos.y++;
      break;
    case DIR_LEFT:
      bullet->pos.x--;
      break;
    case DIR_RIGHT:
      bullet->pos.x++;
      break;
  }
} 

void updateBullets(BulletManager* bulletManager, clock_t gameClock)
{
  static clock_t lastClock = 0;
  if(gameClock - lastClock < 100)
  {
    return;
  }
  lastClock = clock();
  
  int index = 0;
  list_for_each(bulletManager->plist, &bulletManager->head) {
    BulletNode* bulletNode = list_entry(bulletManager->plist, BulletNode, list);
    Bullet* bullet = bulletNode->bullet;
    //if(bullet->velocity.)
    if(bullet->live)
    {
      if(bullet->oldPos.x > 0 && bullet->oldPos.y > 0) 
      {
        easeObj(&bullet->oldPos); 
      }
      drawBullet(bullet);
      stepBullet(bullet);
      checkCollisions(bulletManager, bullet);
    }
    else
    {
      easeObj(&bullet->oldPos);
      destoryBullet(bullet);
      list_del(&bulletNode->list);
      return;//wait fix 
    }
    index++; 
  }

}
