#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "pcc32.h"

#define APP_HEIGHT  7
#define APP_WIDTH   38
#define DIS_BASE_X  2
#define DIS_BASE_Y  0
#define TEXT_COLOR  LIGHT_GREEN

#define GotoMap(x,y) gotoTextPos((x)*2,(y))
#define PRINT_BOX(s) printf("%2s",s)
#define GET_BIT(v,b) ((v)>>(b)&1)

PCCOLOR COLORS[] = {BLACK, LIGHT_GREEN};
char   LIGHT[][3] = {" ", "■"};

// 各数字的形状方块的码表
static uint16 digitTable[10] =
{ 0x7B6F, 0x2492, 0x73E7, 0x79E7, 0x49ED, 0x79CF, 0x7BCF, 0x4927, 0x7BEF, 0x79EF };

void drawDd(int dit, int px);
void drawSeptor(int color, int px);
void initTime(int* h, int* m, int* s);

int main()
{
  int h,m,s;
  int sepcx = 0;

  fixConsoleSize(APP_WIDTH*2, APP_HEIGHT);
  setConsoleTitle("数字时钟");
  setCursorVisible(0);
  initTime(&h, &m, &s);

  while (1)
  {
    delayMS(1000);

    drawSeptor((COLORS[sepcx = !sepcx]), DIS_BASE_X + 22);
    drawSeptor(TEXT_COLOR, DIS_BASE_X + 10);
    drawDd(h / 10, DIS_BASE_X + 0);
    drawDd(h % 10, DIS_BASE_X + 4);
    drawDd(m / 10, DIS_BASE_X + 12);
    drawDd(m % 10, DIS_BASE_X + 16);
    drawDd(s / 10, DIS_BASE_X + 24);
    drawDd(s % 10, DIS_BASE_X + 28);

    s = ((s >= 59) ? (++m, 0) : ++s);
    m = ((m >= 59) ? (++h, 0) : m);

  }

  return 0;
}

void drawDd(int dit, int px)
{
  int b;
  int hx = px, hy = DIS_BASE_Y;

  setTextColor(TEXT_COLOR);
  for (b = 0; b <= 15; ++b)
  {
    GotoMap(hx, hy);
    PRINT_BOX(LIGHT[ GET_BIT(digitTable[dit], b-1) ]);
    if (b % 3 == 0)
    {
      hy++;
      hx = px;
    }
    hx++;
  }
}

void drawSeptor(int color, int px)
{
  setTextColor(color);
  GotoMap(px, DIS_BASE_Y + 2);
  PRINT_BOX(LIGHT[1]);
  GotoMap(px, DIS_BASE_Y + 4);
  PRINT_BOX(LIGHT[1]);
}

void initTime(int* h, int* m, int* s)
{
  time_t t = time(NULL);
  struct tm* cur = localtime(&t);
  *h = cur->tm_hour;
  *m = cur->tm_min;
  *s = cur->tm_sec;
}
