#include <stdio.h>
#include <ctype.h>
#include <stdlib.h>
#include "pcc32.h"

#define MAP_R 40
#define MAP_C 40
#define MAP_X 1
#define MAP_Y 1
#define R 1
#define S_N 2
#define S_DEAD 0
#define S_LIVE 1
int S_Color[] = {DARK_GRAY, LIGHT_GREEN};
char S_Shape[][3] = {"¡õ", "¡ö"};//¡õ¡ö¡ð¡ñ

int map[MAP_R][MAP_C] = {0};

int f(int x, int y)
{
  int aliveNes = 0;
  int offest[8][2] = {{ -1, -1}, {0, -1}, {1, -1}, {1, 0}, {1, 1}, {0, 1}, { -1, 1}, { -1, 0}};
  int d;
  for (d = 0; d < 8; d++)
  {
    int r;
    for (r = 1; r <= R; r++)
    {
      int neX = x + r * offest[d][0];
      int neY = y + r * offest[d][1];
      if (((offest[d][0] >= 0 && neX < MAP_C) || (offest[d][0] < 0 && neX > -1)) &&
          ((offest[d][1] >= 0 && neY < MAP_R) || (offest[d][1] < 0 && neY > -1)))
      {
        if (map[neY][neX] == S_LIVE)
          aliveNes++;
      }
    }
  }

  if (aliveNes == 3)
    return S_LIVE;
  else if (aliveNes == 2)
    return map[y][x];
  else
    return S_DEAD;
}

void drawCell(int s, int x, int y)
{
  gotoTextPos(MAP_X + x * 2, MAP_Y + y);
  setTextColor(S_Color[s]);
  printf("%2s", S_Shape[s]);
}

void draw()
{
  int i, j;
  for (i = 0; i < MAP_R; i++)
    for (j = 0; j < MAP_C; j++)
      drawCell(map[i][j], j, i);
}

void update()
{
  int newMap[MAP_R][MAP_C] = {0};
  int i, j;
  for (i = 0; i < MAP_R; i++)
    for (j = 0; j < MAP_C; j++)
    {
      newMap[i][j] = f(j, i);
      if(map[i][j] != newMap[i][j])
        drawCell(newMap[i][j], j, i);
    }
  for (i = 0; i < MAP_R; i++)
    for (j = 0; j < MAP_C; j++)
      map[i][j] = newMap[i][j];
}

void oneMap()
{
  int i, j;
  for (i = 0; i < MAP_R; i++)
    for (j = 0; j < MAP_C; j++)
      map[i][j] = S_DEAD;
  for (j = 0; j < 13; j++)
    map[MAP_R/2-1][j+MAP_C/2-13/2-1] = S_LIVE;
}

void save(char* filename)
{
  FILE* fp = fopen(filename, "w");
  if (fp == NULL)
    return;

  int i, j;
  for (i = 0; i < MAP_R; i++)
  {
    for (j = 0; j < MAP_C; j++)
    {
      char s;
      if (map[i][j] == S_DEAD)
        s = '0';
      else
        s = '1';
      fputc(s, fp);
    }
    fputc('\n', fp);
  }
  fclose(fp);
}

void load()
{
  FILE* fp = fopen("map.txt", "r");
  if (fp == NULL)
  {
    oneMap();
    save("map.txt");
    return;
  }

  int j = 0;
  while ((j < MAP_R * MAP_C) && !feof(fp))
  {
    char s;
    fscanf(fp, "%c", &s);
    if (!isdigit(s))
      continue;
    if (s - '0' == 0)
      s = S_DEAD;
    else
      s = S_LIVE;

    int r = j / MAP_C < 1 ? 0 : j / MAP_C - 1;
    int c = j % MAP_C - 1;
    map[r][c] = s;
    j++;
  }
  fclose(fp);
}

void init()
{
  load();
  //oneMap();
  draw();
}

int main()
{
  setCursorVisible(0);
  setConsoleTitle("Life");
  fixConsoleSize(MAP_C*2+2, MAP_R+2);

  init();
  while (1)
  {
    delayMS(500);
    update();
  }

  jkGetKey();
  return 0;
}
