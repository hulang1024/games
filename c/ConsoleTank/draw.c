#include "draw.h"

void easeObj(Vector2* pos)
{
  setTextColor(BLACK); 
  gotoTextPosInMap(pos->x, pos->y);
  printf("  ");
}
