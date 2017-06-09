#include "game.h"

int main(int argc, char *argv[])
{
  fixConsoleSize(APP_WIDTH * 2, APP_HEIGHT);
  setConsoleTitle("Tank War");
  setCursorVisible(0);

  init();
  load();
  
  clock_t gameClock = clock();
  while(1)
  {
    gameClock = clock();
    update(gameClock);
    draw(gameClock);
  }
  jkGetKey();
  return 0;
}
