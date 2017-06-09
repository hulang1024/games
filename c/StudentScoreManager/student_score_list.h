#ifndef __C_STUDENT_SCORE_LIST_H
#define __C_STUDENT_SCORE_LIST_H

#include <stdlib.h> 
#include "list.h"

#define NEW_STUDENT() (struct student*)malloc(sizeof(struct student))
#define NEW_STUDENT_SCORE() (struct student_score*)malloc(sizeof(struct student_score))
#define NEW_STUDENT_SCORE_NODE() (struct student_score_node*)malloc(sizeof(struct student_score_node))

struct student {
    char snum[10];
    char name[20];
};

struct student_score {
    int id;
    struct student* stu;
    int clang;
};

struct student_score_node {
    struct student_score* score;
    struct list_head list;
};

int student_score_list_add(struct list_head* list, const struct student_score* s);
int student_score_list_del(struct list_head* list, const struct student_score* s);
int student_score_list_del_list(struct list_head* list, struct list_head* dellist);
struct student_score* student_score_list_get_by_index(const struct list_head* list, int index);
void student_score_list_get_by_snum(const struct list_head* list, struct list_head* results, const char* snum);
void student_score_list_get_by_name(const struct list_head* list, struct list_head* results, const char* name);
void student_score_list_get_by_score_range(const struct list_head* list, struct list_head* results, const char* scoreType, int start, int end);
void student_score_list_free(struct list_head* list);

#endif // __C_STUDENT_SCORE_LIST_H
