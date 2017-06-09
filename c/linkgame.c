#include <stdio.h>
#include <math.h>
#include <pcc32.h>
//~ ccflag = -lpcc32

#define MAP_PG      1
#define MAP_CT_R    8
#define MAP_CT_C    7
#define MAP_R       (MAP_CT_R+MAP_PG*2)
#define MAP_C       (MAP_CT_C+MAP_PG*2)
#define MAP_BASE_X  (80/2/2-MAP_R/2-1)
#define MAP_BASE_Y  (25/2-MAP_R/2-1)

#define IS_SPACE(r,c)     (map[r][c]==0)
#define OFFEST(a,b)       ((a) == (b) ? 0 : (a)>(b) ? -1 : 1)
#define GOTO_MAP_POS(x,y)  gotoTextPos((x+MAP_BASE_X)*2, y+MAP_BASE_Y)

typedef struct
{
  int x, y;
} POINT2D, *PPOINT2D;

int map[MAP_R][MAP_C];
POINT2D cur;
POINT2D sc1, sc2;
int corner;
POINT2D cornerPt[2];

void dBlock(int x, int y)
{
  GOTO_MAP_POS(x, y);
  setBackColor(BLACK);
  setTextColor(map[y][x]);
  printf("◆");
}

void dBack(int x, int y)
{
  GOTO_MAP_POS(x, y);
  setBackColor(BLACK);
  setTextColor(BLACK);
  printf("□");
}

void dMark(int x, int y, int b)
{
  GOTO_MAP_POS(x, y);
  setBackColor(b ? LIGHT_GRAY : BLACK);
  setTextColor(map[y][x]);
  printf("◆");
}

void dLine(POINT2D start, POINT2D end, int isErase)
{
  int dx = abs(start.x - end.x);
  int dy = abs(start.y - end.y);
  int d = (dx > dy ? dx : dy);
  int ox = OFFEST(start.x, end.x);
  int oy = OFFEST(start.y, end.y);

  if(isErase)
  {
    int j;
    for(j = 1; j < d; j++)
      dBack(start.x + (ox * j), start.y + (oy * j));
    return;
  }

  char* type = ox == 0 ? "│" : "─";
  int j;
  for(j = 1; j < d; j++)
  {
    GOTO_MAP_POS(start.x + (ox * j), start.y + (oy * j));
    printf("%2s", type);
    delayMS(100);
  }
}

void dCorner(POINT2D start, POINT2D vt, POINT2D end, int isErase)
{
  int o1x = OFFEST(start.x, vt.x);
  int o1y = OFFEST(start.y, vt.y);
  int o2x = OFFEST(vt.x, end.x);
  int o2y = OFFEST(vt.y, end.y);

  if(isErase)
  {
    dBack(vt.x, vt.y);
    return;
  }

  char* type;
  if(((o1x == -1 && o1y == 0) && (o2x == 0 && o2y == -1)) ||
      ((o1x == 0 && o1y == 1) && (o2x == 1 && o2y == 0)))
    type = "└";
  else if(((o1x == 0 && o1y == -1) && (o2x == 1 && o2y == 0)) ||
          ((o1x == -1 && o1y == 0) && (o2x == 0 && o2y == 1)))
    type = "┌";
  else if(((o1x == 1 && o1y == 0) && (o2x == 0 && o2y == 1)) ||
          ((o1x == 0 && o1y == -1) && (o2x == -1 && o2y == 0)))
    type = "┐";
  else if(((o1x == 0 && o1y == 1) && (o2x == -1 && o2y == 0)) ||
          ((o1x == 1 && o1y == 0) && (o2x == 0 && o2y == -1)))
    type = "┘";
  GOTO_MAP_POS(vt.x, vt.y);
  printf("%2s", type);
}

void dPath()
{
  PCCOLOR oc = getTextColor();
  setBackColor(BLACK);
  setTextColor(WHITE);
  setCursorVisible(0);

  if(corner == 0)
  {
    dLine(sc1, sc2, 0);
    delayMS(300);
    dLine(sc1, sc2, 1);
  }
  else if(corner == 1)
  {
    dLine(sc1, cornerPt[0], 0);
    dCorner(sc1, cornerPt[0], sc2, 0);
    dLine(cornerPt[0], sc2, 0);
    delayMS(300);
    dLine(sc1, cornerPt[0], 1);
    dCorner(sc1, cornerPt[0], sc2, 1);
    dLine(cornerPt[0], sc2, 1);
  }
  else if(corner == 2)
  {
    dLine(sc1, cornerPt[0], 0);
    dCorner(sc1, cornerPt[0], cornerPt[1], 0);
    dLine(cornerPt[0], cornerPt[1], 0);
    dCorner(cornerPt[0], cornerPt[1], sc2, 0);
    dLine(cornerPt[1], sc2, 0);
    delayMS(300);
    dLine(sc1, cornerPt[0], 1);
    dCorner(sc1, cornerPt[0], cornerPt[1], 1);
    dLine(cornerPt[0], cornerPt[1], 1);
    dCorner(cornerPt[0], cornerPt[1], sc2, 1);
    dLine(cornerPt[1], sc2, 1);
  }

  setTextColor(oc);
  setCursorVisible(1);
}

void drawMap()
{
  int r, c;
  for(r = 0; r < MAP_R; r++)
  {
    for(c = 0; c < MAP_C; c++)
    {
      if(IS_SPACE(r, c))
        dBack(c, r);
      else
        dBlock(c, r);
    }
  }
}

void selectOne()
{
  dMark(sc1.x, sc1.y, 0);
  sc1 = sc2;
  sc2.x = -1;
  sc2.y = -1;
}

int isClear(POINT2D start, POINT2D end)
{
  int dx = abs(start.x - end.x);
  int dy = abs(start.y - end.y);
  int d = (dx > dy ? dx : dy);
  if(d == 1)
    return 1;

  int ox = OFFEST(start.x, end.x);
  int oy = OFFEST(start.y, end.y);
  int j;
  for(j = 1; j < d; j++)
    if(!IS_SPACE(start.y + (oy * j), start.x + (ox * j)))
      return 0;
  return 1;
}

int clearCorner(POINT2D pt1, POINT2D pt2, PPOINT2D vt)
{
  vt->x = pt1.x;
  vt->y = pt2.y;
  if(IS_SPACE(vt->y, vt->x) &&
    isClear(pt1, *vt) && isClear(*vt, pt2))
  {
    return 1;
  }
  vt->x = pt2.x;
  vt->y = pt1.y;
  if(IS_SPACE(vt->y, vt->x) &&
    isClear(pt1, *vt) && isClear(*vt, pt2))
  {
    return 1;
  }
  return 0;
}

int canLink()
{
  POINT2D vt1, vt2;
  
  if((OFFEST(sc1.x, sc2.x) == 0 || OFFEST(sc1.y, sc2.y) == 0) &&
    isClear(sc1, sc2))
  {
    corner = 0;
    return 1;
  }
  else if(clearCorner(sc1, sc2, &vt1))
  {
    corner = 1;
    cornerPt[0] = vt1;
    return 1;
  }
  else
  {
    vt1.x = sc1.x;
    int y;
    for(y = 0; y < MAP_R; y++)
    {
      if(y == sc1.y)
        continue;
      vt1.y = y;
      if(IS_SPACE(vt1.y, vt1.x) &&
        isClear(sc1, vt1) && clearCorner(vt1, sc2, &vt2))
      {
        corner = 2;
        cornerPt[0] = vt1;
        cornerPt[1] = vt2;
        return 1;
      }
    }
    vt1.y = sc1.y;
    int x;
    for(x = 0; x < MAP_C; x++)
    {
      if(x == sc1.x)
        continue;
      vt1.x = x;
      if(IS_SPACE(vt1.y, vt1.x) &&
        isClear(sc1, vt1) && clearCorner(vt1, sc2, &vt2))
      {
        corner = 2;
        cornerPt[0] = vt1;
        cornerPt[1] = vt2;
        return 1;
      }
    }
  }

  return 0;
}

void link()
{
  dPath();
  dBack(sc1.x, sc1.y);
  dBack(sc2.x, sc2.y);
  map[sc1.y][sc1.x] = 0;
  map[sc2.y][sc2.x] = 0;
  sc1.x = sc1.y = -1;
  sc2.x = sc2.y = -1;
  GOTO_MAP_POS(cur.x, cur.y);
}

int mapIsClear()
{
  int r, c;
  for(r = 0; r < MAP_R; r++)
    for(c = 0; c < MAP_C; c++)
      if(!IS_SPACE(r, c))
        return 0;
  return 1;
}

void randMap()
{
  int r, c;
  int randMap[MAP_CT_R][MAP_CT_C];
  int j = 1, no = 1;
  for(r = 0; r < MAP_CT_R; r++)
    for(c = 0; c < MAP_CT_C; c++)
    {
      randMap[r][c] = no;
      if(j++ % 4 == 0)
        no++;
    }
  srand(time(0));
  for(r = 0; r < MAP_CT_R; r++)
    for(c = 0; c < MAP_CT_C; c++)
    {
      int rx = rand() % MAP_CT_C;
      int ry = rand() % MAP_CT_R;
      int t = randMap[rx][ry];
      randMap[rx][ry] = randMap[r][c];
      randMap[r][c] = t;
    }

  for(r = 0; r < MAP_PG; r++)
    for(c = 0; c < MAP_C; c++)
      map[r][c] = 0;
  for(; r < MAP_CT_R + MAP_PG; r++)
  {
    for(c = 0; c < MAP_PG; c++)
      map[r][c] = 0;
    for(; c < MAP_CT_C + MAP_PG; c++)
      map[r][c] = randMap[r - MAP_PG][c - MAP_PG];
    for(; c < MAP_PG; c++)
      map[r][c] = 0;
  }
  for(; r < MAP_PG; r++)
    for(c = 0; c < MAP_C; c++)
      map[r][c] = 0;
}


void init()
{
  setConsoleTitle("方块连连看");
  randMap();
  drawMap();
  sc1.x = sc1.y = -1;
  sc2.x = sc2.y = -1;
  cur.x = MAP_R / 2 - 1;
  cur.y = MAP_C / 2 - 1;
  GOTO_MAP_POS(cur.x, cur.y);
}

int main()
{
  int isClear = 0;
  POINT2D scPos[2];
  int scNo = 0;
  int posSame = 1;
  while(1)
  {
    init();
    isClear = 0;
    while(!isClear)
    {
      scPos[0] = sc1;
      scPos[1] = sc2;
      scNo = 0;
      if(sc1.x != -1 && sc1.y != -1)
        scNo++;
      posSame = 1;
      while(posSame)
      {
        for (; scNo < 2; scNo++)
        {
          int enter = 0;
          while(!enter)
          {
            if(!jkHasKey())
              continue;

            switch(jkGetKey())
            {
              case JK_LEFT:
                if(cur.x - 1 < MAP_PG)
                  cur.x = MAP_CT_C;
                else
                  cur.x--;
                break;
              case JK_UP:
                if(cur.y - 1 < MAP_PG)
                  cur.y = MAP_CT_R;
                else
                  cur.y--;
                break;
              case JK_RIGHT:
                if(cur.x + 1 > MAP_CT_C)
                  cur.x = MAP_PG;
                else
                  cur.x++;
                break;
              case JK_DOWN:
                if(cur.y + 1 > MAP_CT_R)
                  cur.y = MAP_PG;
                else
                  cur.y++;
                break;
              case JK_ENTER:
              case JK_SPACE:
                if(!IS_SPACE(cur.y, cur.x))
                {
                  dMark(cur.x, cur.y, 1);
                  enter = 1;
                }
                break;
              default:
                ;
            }
            GOTO_MAP_POS(cur.x, cur.y);
          }
          scPos[scNo] = cur;
        }
        posSame = ((scPos[0].x == scPos[1].x) && (scPos[0].y == scPos[1].y));
        if(posSame)
        {
          dMark(cur.x, cur.y, 0);
          scNo = 0;
        }
      }
      sc1 = scPos[0];
      sc2 = scPos[1];

      if(map[sc1.y][sc1.x] == map[sc2.y][sc2.x] && canLink())
      {
        link();
        isClear = mapIsClear();
      }
      else
      {
        selectOne();
      }
    }
  }
}
