#ifndef __BULLETS_H
#define __BULLETS_H

#include "tank.h" 
#include "stage.h"
 
typedef struct bullet 
{
  Tank* parentTank; 
  int dir;
  Vector2 pos;
  Vector2 oldPos; 
  int velocity;
  int live;
  int power;
} Bullet;

typedef struct
{
  Bullet* bullet;
  struct list_head list;
} BulletNode;

typedef struct
{
  struct list_head head, *plist;
  Stage* stage;
} BulletManager;

#endif
