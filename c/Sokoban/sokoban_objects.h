#ifndef _SOKOBAN_OBJECT_H_
#define	_SOKOBAN_OBJECT_H_

#define MAN           0
#define MAN_ON_GOAL   1
#define BOX           2
#define BOX_ON_GOAL   3
#define WALL          4
#define GOAL          5
#define SPACE         6

//no change
#define DIR_NONE   -1
#define DIR_UP     0
#define DIR_DOWN   1
#define DIR_LEFT   2
#define DIR_RIGHT  3

#define SOLUTION_LENGTH_MAX   2048
#define MAP_ROWS_MAX 100
#define MAP_COLS_MAX 100

typedef struct
{
  int array[MAP_ROWS_MAX][MAP_COLS_MAX];
  int rows;
  int cols;
  int manX, manY;
  
  //metadata
  char title[200];
  char author[100];
} SMap;

typedef struct
{
  int array[SOLUTION_LENGTH_MAX];
  int length;
} SSolution;

#endif
