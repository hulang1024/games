#ifndef _C_MACROS_H_
#define	_C_MACROS_H_

#include <string.h>

#define string_equals(s1,s2) (strcmp(s1, s2) == 0)

char* string_trim(char* s);
char* string_tolower(char* s);

#endif
