#include "student_score_list.h"

int student_score_list_add(struct list_head* list, const struct student_score* s)
{
    struct student_score_node* node = NEW_STUDENT_SCORE_NODE();
    node->score = (struct student_score*)s;
    list_add_tail(&node->list, list);
    return 1;
}

int student_score_list_del_list(struct list_head* list, struct list_head* dellist)
{
    struct list_head *plist;
    list_for_each(plist, dellist) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        student_score_list_del(list, node->score);
    }
    return 1;
}

int student_score_list_del(struct list_head* list, const struct student_score* s)
{
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        if(strcmp(node->score->stu->snum, s->stu->snum) == 0 && strcmp(node->score->stu->name, s->stu->name) == 0) {
            list_del(&node->list);
            break;
        }
    }
    return 1;
}

struct student_score* student_score_list_get_by_index(const struct list_head* list, int index)
{
    int i = 0;
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        if(i == index) {
            return node->score;
        } 
        i++;
    }
    return NULL;
}

void student_score_list_get_by_snum(const struct list_head* list, struct list_head* results, const char* snum)
{
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        if(strcmp(node->score->stu->snum, snum) == 0)
            student_score_list_add(results, node->score);
    }
}

void student_score_list_get_by_name(const struct list_head* list, struct list_head* results, const char* name)
{
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        if(strcmp(node->score->stu->name, name) == 0)
            student_score_list_add(results, node->score);
    }
}

void student_score_list_get_by_score_range(const struct list_head* list, struct list_head* results, const char* scoreType, int start, int end)
{
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        if(start <= node->score->clang && node->score->clang <= end)
            student_score_list_add(results, node->score);
    }
}

void student_score_list_free(struct list_head* list)
{
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        free(node->score->stu);
        free(node->score);
    }
}

