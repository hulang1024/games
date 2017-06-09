#ifndef _SOKOBAN_FORMAT_H_
#define	_SOKOBAN_FORMAT_H_

#include <stdio.h>
#include "c_string.h"

char* config_getStringVal(char* key);
int config_getIntVal(char* key);
int config_getBoolVal(char* key);
void loadConfig();

#endif 
