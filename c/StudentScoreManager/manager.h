#ifndef __C_MANAGER_H
#define __C_MANAGER_H

#include <stdio.h>
#include <strings.h>
#include <ctype.h>
#include "student_score_list.h"

struct list_head student_score_list;

void table_student_scores(struct list_head* list); 
void add_student_score();
void modify_student_score(struct student_score* s);
void edit_student_score(struct student_score* s);
void del_student_scores(struct list_head* list);
struct student_score* select_student_score_by_index();
void select_student_scores_by_snum(struct list_head* results);
void select_student_scores_by_name(struct list_head* results);
int savefile_student_score_list();
int loadfile_student_score_list();


#endif // __C_MANAGER_H
