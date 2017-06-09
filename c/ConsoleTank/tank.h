#ifndef __TANK_H
#define __TANK_H

#include "draw.h" 
#include "list.h"

//no change
#define DIR_NONE   -1
#define DIR_UP     0
#define DIR_DOWN   1
#define DIR_LEFT   2
#define DIR_RIGHT  3

#define TANK_WIDTH   3
#define TANK_HEIGHT  3

#define HOST_PLAYER   1 
#define HOST_HOSTILE  2

typedef struct
{
  int id;
  int host;
  int color;
  Vector2 pos;
  int dir;
  int live;
  int velocity;
  int fireBuffering;
} Tank;

typedef struct
{
  Tank* tank;
  struct list_head list;
} TankNode;

typedef struct
{
  struct list_head head, *plist;
} TankManager;

#endif
