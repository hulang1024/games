#ifndef _SOKOBAN_FORMAT_H_
#define	_SOKOBAN_FORMAT_H_

#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include "c_string.h"
#include "sokoban_objects.h"

int decodeMap(SMap* map, FILE* fd);
int decodeSolution(SSolution* solution, FILE* fd);

#endif
