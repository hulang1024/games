#include "formats.h"

int decodeStage(Stage* stage, FILE* fd)
{
  stage->map.height = MAP_HEIGHT_DEFAULT;
  stage->map.width = MAP_WIDTH_DEFAULT;
  int rows = 0, cols = 0;
  char* chars = "-=#*~@";
  char ch;
  /*
   -  EMPTY
   = STONE_BRICK
   # STEEL_BRICK
   * GRASS
   ~ WATER
   @ HEART
  */
  while ((ch = fgetc(fd)) != EOF)
  {
    if (ch == '\n')
    {
      rows++;
      cols = 0;
      continue;
    }
    int obj;
    char* chr = strchr(chars, ch);
    if (chr != NULL)
      obj = chr - chars;
    else if (isspace(ch))
      obj = EMPTY;
    else break;
    stage->map.array[rows][cols++] = obj;
  }
  return 0;
}
