#ifndef __DRAW_H
#define __DRAW_H

#include <stdio.h>
#include <time.h> 
#include "pcc32.h"

typedef struct
{
  int x, y;
} Vector2;

#define gotoTextPosInMap(x, y) gotoTextPos((x) * 2, y)

#endif
