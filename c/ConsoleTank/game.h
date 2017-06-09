#ifndef __GAME_H
#define __GAME_H

#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <time.h> 
#include "stage.h"
#include "map.h"
#include "bullets.h"
#include "tank.h"
#include "draw.h"
#include "pcc32.h"

#define APP_WIDTH  (MAP_WIDTH_DEFAULT + 10)
#define APP_HEIGHT (MAP_HEIGHT_DEFAULT + 1)

struct tank; 
struct bullet;
 
Stage stage;
Tank* tankPlayer1;
Tank* tankPlayer2;
BulletManager bulletManager;
TankManager tankManager;

#endif
