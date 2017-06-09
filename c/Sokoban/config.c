#include "config.h"

static char* filename = "sokoban.cfg";
static char keyUpMove[20], keyDownMove[20], keyLeftMove[20], keyRightMove[20];
static int width, height, automaticWindowSizing;

char* config_getStringVal(char* key)
{
  if(string_equals(key, "keyUpMove")) return keyUpMove;
  else if(string_equals(key, "keyDownMove")) return keyDownMove;
  else if(string_equals(key, "keyLeftMove")) return keyLeftMove;
  else if(string_equals(key, "keyRightMove")) return keyRightMove;
  return NULL;
}

int config_getIntVal(char* key)
{
  if(string_equals(key, "Width")) return width; 
  else if(string_equals(key, "Height")) return height;
  else if(string_equals(key, "AutomaticWindowSizing")) automaticWindowSizing;
  return 0;
}

int config_getBoolVal(char* key)
{
  if(string_equals(key, "AutomaticWindowSizing")) return automaticWindowSizing;
  return 0;
}

void initDefaultConfig()
{
  width = 1024;
  height = 600;
  automaticWindowSizing = 1;
  strcpy(keyUpMove, "Up");
  strcpy(keyDownMove, "Down");
  strcpy(keyLeftMove, "Left");
  strcpy(keyRightMove, "Right");
}

void writeDefaultConfigFile()
{
  FILE* fd = fopen(filename, "w");
  fprintf(fd, "#配置\n");
  fprintf(fd, "\n\n");
  fprintf(fd, "Width = %d\n", width);
  fprintf(fd, "Height = %d\n", height);
  fprintf(fd, "AutomaticWindowSizing = %d\n", automaticWindowSizing);
  fprintf(fd, "#键盘按键, 支持方向键,字母和数字\n");
  fprintf(fd, "keyUpMove = %s\n", keyUpMove);
  fprintf(fd, "keyDownMove = %s\n", keyDownMove);
  fprintf(fd, "keyLeftMove = %s\n", keyLeftMove);
  fprintf(fd, "keyRightMove = %s\n", keyRightMove);
  fclose(fd);
}


void loadConfig()
{
  initDefaultConfig();
  
  FILE* fd = fopen(filename, "r");
  if (fd == NULL)
  {
    fclose(fd);
    writeDefaultConfigFile();
    return;
  }

  while(!feof(fd))
  {
    char line[300] = {0};
    fgets(line, 300, fd);
    if(strlen(line) == 0) continue;
    
    int equalsIndex = strchr(line, '=') - line;
    
    if(line[0] == '#' || equalsIndex < 0) continue;
    
    char key[30] = {0};
    string_trim(strncpy(key, line, (equalsIndex < 30 ? equalsIndex : 30)));
    char val[270] = {0};
    string_trim(strncpy(val, line + equalsIndex + 1, 270));

    if(string_equals(key, "Width")) width = atoi(val);
    else if(string_equals(key, "Height")) height = atoi(val);
    else if(string_equals(key, "AutomaticWindowSizing")) automaticWindowSizing = !!atoi(val);
    else if(string_equals(key, "keyUpMove")) strcpy(keyUpMove, val);
    else if(string_equals(key, "keyDownMove")) strcpy(keyDownMove, val);
    else if(string_equals(key, "keyLeftMove")) strcpy(keyLeftMove, val);
    else if(string_equals(key, "keyRightMove")) strcpy(keyRightMove, val);
  }
  fclose(fd);
}
