#ifndef __MAP_H
#define __MAP_H

#include <stdio.h>
#include "draw.h"
#include "pcc32.h"

//˫�ֽڵ�λ 
#define MAP_WIDTH_MAX       100
#define MAP_HEIGHT_MAX      100
#define MAP_WIDTH_DEFAULT   39
#define MAP_HEIGHT_DEFAULT  39

//no change
#define EMPTY         0 
#define STONE_BRICK   1
#define STEEL_BRICK   2
#define GRASS         3
#define WATER         4
#define HEART         5

typedef struct
{
  int array[MAP_WIDTH_MAX][MAP_HEIGHT_MAX];
  int width;
  int height;
} Map;

#endif
