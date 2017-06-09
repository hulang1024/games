#include "c_string.h"

char* string_trim(char* s)
{
  size_t len = strlen(s);
  int i, si, ei;
  
  for(i = 0; i < len && isspace(s[i]); i++);
  si = i;

  for(i = len - 1; i >= 0 && isspace(s[i]); i--);
  ei = i;
  
  s[ei + 1] = '\0';
  for(i = 0; i <= ei; i++)
    s[i] = s[si++];

  return s;
}

char* string_tolower(char* s)
{
  char* sc = s;
  while(*sc)
    *sc = tolower(*sc++);
  return s;
}
