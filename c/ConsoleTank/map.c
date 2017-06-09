#include "map.h"

static PCCOLOR colors[] = {BLACK, RED, WHITE, GREEN, LIGHT_BLUE, DARK_GRAY};
static char graphs[][3] = {"  ","¡ö","¡ö","¡ù", "¡ö", "¡ô"};

void drawObj(Map* map, Vector2* pos)
{
  gotoTextPosInMap(pos->y, pos->x);
  setTextColor(colors[map->array[pos->y][pos->x]]);
  printf("%2s",  graphs[map->array[pos->y][pos->x]]);
}

void setObject(Map* map, int r, int c, int obj)
{
  map->array[r][c] = obj;
  gotoTextPosInMap(c, r);
  setTextColor(colors[map->array[r][c]]);
  printf("%2s",  graphs[map->array[r][c]]);
}

void drawMap(Map* map)
{
  int r, c;
  for (r = 0; r < map->height; r++)
  {
    gotoTextPosInMap(0, r);
    for (c = 0; c < map->width; c++)
    {
      if(map->array[r][c] != EMPTY)
        setTextColor(colors[map->array[r][c]]);
      printf("%2s",  graphs[map->array[r][c]]);
    }
  }
}

int isNotBarrier(Map* map, int x, int y)
{
  int obj = map->array[y][x];
  return obj == EMPTY || obj == GRASS;
}
