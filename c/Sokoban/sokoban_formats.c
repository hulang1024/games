#include "sokoban_formats.h"


int decodeMap(SMap* map, FILE* fd)
{
  map->rows = -1;
  map->cols = -1;
  int rows = 0, cols = 0;
  int objCount = 0;
  char* xsbchars = "@+$*#.-";
  char ch;
  while ((ch = fgetc(fd)) != EOF)
  {
    if (ch == '\n')
    {
      if (map->cols < 0)
        map->cols = cols;
      rows++;
      cols = 0;
      continue;
    }
    int obj;
    char* chr = strchr(xsbchars, ch);
    if (chr != NULL)
      obj = chr - xsbchars;
    else if (isspace(ch))
      obj = SPACE;
    else break;
    map->array[rows][cols++] = obj;
    if (obj == MAN || obj == MAN_ON_GOAL)
    {
      map->manX = cols - 1;
      map->manY = rows;
    }
    objCount++;
  }
  map->rows = objCount / map->cols;
  
  if(ch != EOF) {
    fseek(fd, -1, SEEK_CUR);  
  }
  
  map->author[0] = 0;
  map->title[0] = 0;
  while(!feof(fd))
  {
    char line[207] = {0};
    fgets(line, 207, fd);
    if(strlen(line) == 0) continue;
    
    int spIndex = strchr(line, ':') - line;
    
    if(spIndex < 0) continue;

    char key[7] = {0};
    string_trim(strncpy(key, line, (spIndex < 7 ? spIndex : 7)));
    char val[200] = {0};
    string_trim(strncpy(val, line + spIndex + 1, 200));
    
    string_tolower(key);
    if(string_equals(key, "title")) {
      strcpy(map->title, val);
    }
    if(string_equals(key, "author")) {
      strcpy(map->author, val);
    }
  }
  return 0;
}


int decodeSolution(SSolution* solution, FILE* fd)
{
  int j = 0;
  char ch;
  char* s = "LURD";
  while ((ch = fgetc(fd)) != EOF)
  {
    if (ch == '\n') continue;
    char* chr = strchr(s, toupper(ch));
    solution->array[j++] = chr - s;//LURD
  }
  solution->length = j;
  return 0;
}

