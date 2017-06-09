/* * * * * * * * * * * * * * * * *
// Project: 五子棋
// Author:  Problue
// Date:    2012.11.10 23:50
* * * * * * * * * * * * * * * * */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <ctype.h>
#include <string.h>
#include <assert.h>
#include <stdbool.h>
#include <conio.h>
#include <windows.h>
//#include "ai.h"

// 定义程序窗口尺寸
#define APP_WIDTH  38
#define APP_HEIGHT 22

// 定义棋盘的尺寸
#define BOARD_SIZE_ROW  15
#define BOARD_SIZE_COL  15
#define CHESS_COUNT    (BOARD_SIZE_ROW * BOARD_SIZE_COL)
#define ClsScreen() system("cls")

// 定义各对象的形状(注意是宽字符)
char ChessShape[][3]  = {"", "●", "○"};
char Lines[][3] = {"┌", "┬", "┐", "├", "┼", "┤", "└", "┴", "┘"};
char BoardMap[BOARD_SIZE_ROW][BOARD_SIZE_COL] =
{
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,2,//┌┬┬┬┬┬┬┬┬┬┬┬┬┬┐
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  3,4,4,4,4,4,4,4,4,4,4,4,4,4,5,//├┼┼┼┼┼┼┼┼┼┼┼┼┼┤
  6,7,7,7,7,7,7,7,7,7,7,7,7,7,8 //└┴┴┴┴┴┴┴┴┴┴┴┴┴┘
};
char XNo[] = "ABCDEFGHIJKLMNO", YNo[] = "fedcba987654321";

// 坐标
typedef struct _POINT2D
{
  char x, y;
}POINT2D, *PPOINT2D;

// 定义玩家动作消息
typedef enum {PUTCHESS, LOSE, TIE, BACK, FORWARD, NEWGAME, QUIT} ACTION_MSG;

// 棋子
typedef enum
{
  SPACE = 0,
  BLACK = 1,
  WHITE = 2
}CHESS;

// 棋盘
typedef struct
{
  CHESS table[BOARD_SIZE_ROW][BOARD_SIZE_COL];
  CHESS list[CHESS_COUNT];
  POINT2D pos[CHESS_COUNT];
  int chessCnt;
}CHESSBOARD;

// 玩家
typedef struct _PLAYERTag
{
  char name[17];
  CHESS chess;
  struct
  {
    int win,lose;
  }score;

  ACTION_MSG (* putChess)(struct _PLAYERTag* thiz, CHESSBOARD*, POINT2D*);
}PLAYER;

ACTION_MSG user(PLAYER*, CHESSBOARD*, POINT2D*);
ACTION_MSG cpu1(PLAYER*, CHESSBOARD*, POINT2D*);

CHESS getChess(CHESSBOARD*,  POINT2D);
void addChess(CHESSBOARD*, CHESS, POINT2D);
void drawChess(CHESS, POINT2D);
void drawBoard(CHESSBOARD*);
void clear(CHESSBOARD*);
bool isChess(CHESSBOARD*,  POINT2D);
bool back(CHESSBOARD*);
bool forward(CHESSBOARD*);

void initGame();
void doGame();
bool hasWinner();
void newRound();
void OverRound();

// 游戏数据
int RoundCount;
CHESSBOARD Board;
PLAYER P1, P2;
POINT2D PutPos;
PLAYER* Turn[2];
PLAYER* CurrPlayer;
PLAYER* Winner;

int main()
{
  SetConsoleTitle("Gomoku.  by Problue");
  initGame();
  while (true)
  {
    newRound();
    OverRound();
  }
  return 0;
}

void initGame()
{
  strcpy(P1.name, "玩家1");
  strcpy(P2.name, "Deep");
  P1.putChess = user;
  P2.putChess = cpu1;
  P1.chess = WHITE;
  P2.chess = BLACK;

  RoundCount = 0;
  Turn[0] = &P1;
  Turn[1] = &P2;
  Winner = NULL;

}

void newRound()
{
  bool isOver = false;
  bool holdNext = true;
  ACTION_MSG msg;

  clear(&Board);
  RoundCount += 1;
  CHESS t = P1.chess;
  P1.chess = P2.chess;
  P2.chess = t;
  PutPos.x = 0;
  PutPos.y = 0;

  {
    ClsScreen();
    printf("\n\t第%d局\n", RoundCount);
    printf("%2s黑方: %s\n", ChessShape[BLACK], P1.name);
    printf("%2s白方: %s\n", ChessShape[WHITE], P2.name);
    printf("\n任意键开局...");
    getch();
  }

  while (! isOver)
  {
    drawBoard(&Board);

    if (holdNext)
      CurrPlayer = Turn[ getChessCount(&Board) % 2];

    printf("第%d手, ", getChessCount(&Board) + 1);
    printf("%s持棋. \n", CurrPlayer->name);
    msg = CurrPlayer->putChess(CurrPlayer, &Board, &PutPos);
    switch (msg)
    {
      case PUTCHESS:
        addChess(&Board, CurrPlayer->chess, PutPos);
        holdNext = true;
        break;
      case BACK:
        if (back(&Board))
          printf("%s:后退一步棋.", CurrPlayer->name);
        else
          printf("  后面无子了!\t");
        holdNext = false;
        break;
      case FORWARD:
        if (forward(&Board))
          printf("%s:前进一步棋.", CurrPlayer->name);
        else
          printf("  前面无子了!\t");
        holdNext = false;
        break;
      case LOSE:
        printf("%s:认输.", CurrPlayer->name);
        if (CurrPlayer != &P1)
          Winner = &P1;
        else
          Winner = &P2;
        isOver = true;
        break;
      case TIE:
        printf("%s求和.", CurrPlayer->name);
        Winner = NULL;
        isOver = true;
        break;
      case NEWGAME:
        return;
      case QUIT:
        printf("游戏退出...");
        exit(0);
        break;
      default:
        break;
    }

    if (holdNext)
      if (hasWinner())
      {
        Winner = CurrPlayer;
        isOver = true;
      }
  }

}

void OverRound()
{
  printf("\n本回合结束!结果:");
  if (Winner != NULL)
    printf("\n%s胜利!\n", Winner->name);
  else
    printf("平局。");
  getch();
}

#define RANGE_CHECK(exp) while(exp && (Board.table[i][j] == chess))
#define R_FIVE(cnt) do{if((cnt) >=5) return true;}while(0)
bool hasWinner()
{
  POINT2D pt = PutPos;
  CHESS chess = CurrPlayer->chess;
  int i, j;
  int count;

  // 左
  count = 0;
  i = pt.x;
  j = pt.y;
  RANGE_CHECK(i > -1)
  {
    i--;
    count++;
  }
  //右
  i = pt.x + 1;
  RANGE_CHECK(i < BOARD_SIZE_ROW)
  {
    i++;
    count++;
  }
  R_FIVE(count);
  // 上
  count = 0;
  i = pt.x;
  RANGE_CHECK(j > -1)
  {
    j--;
    count++;
  }
  // 下
  j = pt.y + 1;
  RANGE_CHECK(j < BOARD_SIZE_COL)
  {
    j++;
    count++;
  }
  R_FIVE(count);
  // 左上
  count = 0;
  j = pt.y;
  RANGE_CHECK(i > -1 && j > -1)
  {
    i--;
    j--;
    count++;
  }
  // 右下
  i = pt.x + 1;
  j = pt.y + 1;
  RANGE_CHECK(i < BOARD_SIZE_ROW && j < BOARD_SIZE_COL)
  {
    i++;
    j++;
    count++;
  }
  R_FIVE(count);
  // 右上
  count = 0;
  i = pt.x;
  j = pt.y;
  RANGE_CHECK(i < BOARD_SIZE_ROW && j > -1)
  {
    i++;
    j--;
    count++;
  }
  //左下
  i = pt.x - 1;
  j = pt.y + 1;
  RANGE_CHECK(i > -1 && j < BOARD_SIZE_COL)
  {
    i--;
    j++;
    count++;
  }
  R_FIVE(count);
  return false;
}

void drawBoard(CHESSBOARD* board)
{
  POINT2D pt;
  ClsScreen();
  for (pt.x = 0; pt.x < BOARD_SIZE_ROW; ++pt.x)
  {
    printf("%c ", YNo[pt.x]);
    for (pt.y = 0; pt.y < BOARD_SIZE_COL; ++pt.y)
      drawChess(board->table[pt.x][pt.y], pt);
    printf("\n");
  }
  printf("+  ");
  int i;
  for (i = 0; i < BOARD_SIZE_COL; ++i)
    printf("%c ", XNo[i]);
  printf("\n");
  for (i = 0; i <= APP_WIDTH; ++i)
    printf("─");
  printf("\n");
}

void addChess(CHESSBOARD* board, CHESS chess, POINT2D pos)
{
  board->table[pos.x][pos.y] = chess;
  board->list[board->chessCnt] = chess;
  board->pos[board->chessCnt] = pos;
  board->chessCnt += 1;
}

void drawChess(CHESS chess, POINT2D pos)
{
  if (chess != SPACE)
    printf("%2s", ChessShape[chess]);
  else
    printf("%2s", Lines[ BoardMap[pos.x][pos.y] ]);
  return;
}

void clear(CHESSBOARD* board)
{
  POINT2D pt;
  for (pt.x = 0; pt.x < BOARD_SIZE_ROW; ++pt.x)
  {
    for (pt.y = 0; pt.y < BOARD_SIZE_COL; ++pt.y)
    {
      board->table[pt.x][pt.y] = SPACE;
      board->pos[pt.x * BOARD_SIZE_ROW + pt.y].x = -1;
      board->pos[pt.x * BOARD_SIZE_ROW + pt.y].y = -1;
    }
  }
  board->chessCnt = 0;
}

bool back(CHESSBOARD* board)
{
  if (board->chessCnt <= 0)
    return false;
  board->chessCnt -= 1;
  POINT2D at = board->pos[board->chessCnt];
  board->table[at.x][at.y] = SPACE;
  return true;
}

bool forward(CHESSBOARD* board)
{
  if (board->list[board->chessCnt] == SPACE)
    return false;
  POINT2D at = board->pos[board->chessCnt];
  board->table[at.x][at.y] = board->list[board->chessCnt];
  board->chessCnt += 1;
  return true;
}

CHESS getChess(CHESSBOARD* board, POINT2D pos)
{
  return board->table[pos.x][pos.y];
}

bool isChess(CHESSBOARD* board, POINT2D pos)
{
  int i;
  for (i = 0; i <= board->chessCnt; ++i)
    if ((board->pos[i].x == pos.x) && (board->pos[i].y == pos.y))
      return true;
  return false;
}

int getChessCount(CHESSBOARD* board)
{
  return board->chessCnt;
}

ACTION_MSG user(PLAYER* thiz, CHESSBOARD* board, POINT2D* pt)
{
  char x, y;

  while (true)
  {
    puts(" 1   - 落子");
    puts(" 2/3 - 悔棋.后退/前进");
    puts(" 4/5 - 求和/认输");
    puts(" 6   - 重新开局 ");
    puts(" 7   - 退出");
    printf("选择");
    char choice;
    do
    {
      choice = getch();
    } while (!('1' <= choice && choice <= '7'));
    printf("\n");
    switch (choice)
    {
      case '2':
        return BACK;
      case '3':
        return FORWARD;
      case '4':
        return TIE;
      case '5':
        return LOSE;
      case '6':
        return NEWGAME;
      case '7':
        return QUIT;
      case '1':
        while (true)
        {
          printf("落棋位置: ");
          fflush(stdin);
          scanf("%c%c", &x, &y);
          getchar();
          char* pos;
          pt->y = ((pos = strchr(XNo, toupper(x))) != NULL ? pos - XNo : -1);
          pt->x = ((pos = strchr(YNo, tolower(y))) != NULL ? pos - YNo : -1);
          bool isRightPos = ((0 <= pt->x && pt->x <= BOARD_SIZE_ROW)
                && (0 <= pt->y && pt->y <= BOARD_SIZE_COL));
          if (! isRightPos)
          {
            puts(" 位置值错了.");
            continue;
          }
          else if (!isChess(board, *pt))
            break;
          else
            puts(" 此位置已有棋子.");
        }
        //printf("%d,%d\n", pt->x, pt->y);
        return PUTCHESS;
        break;
      default:
        break;
    }
  }
}

ACTION_MSG cpu1(PLAYER* thiz, CHESSBOARD* board, POINT2D* pt)
{
  int rot;
  srand((unsigned)time(NULL));
  printf("%s thinking...", thiz->name);
  do
  {
    pt->x = rand() % BOARD_SIZE_ROW;
    pt->y = rand() % BOARD_SIZE_COL;
    for (rot = 0; rot < 10; ++rot)
    {
      printf("%c\b", "|/-\\"[rot %4]);
      Sleep(50);
    }
  } while (isChess(board, *pt));
  printf("[%c%c]\n", XNo[pt->y], YNo[pt->x]);

  return PUTCHESS;
}
