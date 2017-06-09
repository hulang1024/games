#include "manager.h"

void table_student_scores(struct list_head* list)
{
    const char* titles[] = {"序号","学号","姓名","C语言成绩 "};//标题文字 
    float widthPercents[] = {25, 25, 25, 25};//列宽百分比%
    int widths[4] = {0};//实际列宽 
    int i;
    
    int lineWidth = getLineWidth() - sizeof(titles) / sizeof(char*);
    lineWidth -= 2;
    for(i = 0; i < 4; i++) {
        widths[i] = lineWidth * widthPercents[i] / 100;
    }
    
    printf(" ");
    for(i = 0; i < 4; i++) {
        printf("＋");
        padChars('-', widths[i] - 2);
    }
    printf("＋");
    printf("\n");

    printf(" ");
    for(i = 0; i < 4; i++) {
        printf("│");
        int pad = (widths[i] - 2 - strlen(titles[i])) / 2; 
        padChars(' ', pad - 1);
        printf(titles[i]);
        padChars(' ', pad);
    }
    printf("│");
    printf("\n");
    
    printf(" ");
    for(i = 0; i < 4; i++) {
        printf("＋");
        padChars('-', widths[i] - 2);
    }
    printf("＋");
    printf("\n");
    
    int index = 0;
    struct list_head *plist;
    list_for_each(plist, list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        
        char values[4][30] = {0};
        sprintf(values[0], "%d", index + 1);
        sprintf(values[1], "%s", node->score->stu->snum);
        sprintf(values[2], "%s", node->score->stu->name);
        sprintf(values[3], "%d", node->score->clang);
        
        printf(" ");
        for(i = 0; i < 4; i++) {
            printf("│");
            printf(values[i]);
            int pad = widths[i] - 2 - strlen(values[i]); 
            padChars(' ', pad);
        }
        printf("│");
        printf("\n");
        
        index++;
    }
    
    printf(" ");
    for(i = 0; i < 4; i++) {
        printf("＋");
        padChars('-', widths[i] - 2);
    }
    printf("＋");
    printf("\n");
    
    printf("共%d条数据.", index);
}

void add_student_score()
{
    struct student* stu = NEW_STUDENT();
    struct student_score* score = NEW_STUDENT_SCORE();
    score->stu = stu;

    edit_student_score(score);
    
    int succeed = student_score_list_add(&student_score_list, score);
    if(succeed) {
        succeed = savefile_student_score_list();
        if(succeed)
            printf("添加成功.");
    }
}

void edit_student_score(struct student_score* s)
{
    printf("学生学号:");
    scanf("%s", s->stu->snum);
    printf("学生姓名:");
    scanf("%s", s->stu->name);
    printf("C语言分数:");
    scanf("%d", &s->clang);
}

struct student_score* select_student_score_by_index()
{
    printf("序号:");
    int no;
    scanf("%d", &no);
    return student_score_list_get_by_index(&student_score_list, no - 1);
}

void select_student_scores_by_snum(struct list_head* results)
{
    printf("学生学号:");
    char snum[10];
    scanf("%s", snum);
    student_score_list_get_by_snum(&student_score_list, results, snum);
}

void select_student_scores_by_name(struct list_head* results)
{
    printf("学生姓名:");
    char name[20];
    scanf("%s", name);
    student_score_list_get_by_name(&student_score_list, results, name);
}

void modify_student_score(struct student_score* s)
{
    printf("新的信息:\n");
    edit_student_score(s);
    int succeed = savefile_student_score_list();
    if(succeed)
        printf("修改成功.");
}

void del_student_scores(struct list_head* list)
{
    student_score_list_del_list(&student_score_list, list);
    int succeed = savefile_student_score_list();
    if(succeed)
        printf("删除成功.");
}

int savefile_student_score_list()
{
    FILE* fd = fopen("studentscore.csv", "w");
    struct list_head *plist;
    fputs("snum\tname\tclang_score\n", fd);
    list_for_each(plist, &student_score_list) {
        struct student_score_node *node = list_entry(plist, struct student_score_node, list);
        fprintf(fd, "%s\t%s\t%d\n", node->score->stu->snum, node->score->stu->name, node->score->clang);
    }
    fclose(fd);
    return 1;
}

int loadfile_student_score_list()
{
    FILE* fd = fopen("studentscore.csv", "r");
    if(fd == NULL) {
        fclose(fd);
        return 1;
    }
    char columns[3][50];
    if(!feof(fd))
        fscanf(fd, "%s\t%s\t%s\n", columns[0], columns[1], columns[2]);
    while(!feof(fd)) {
        struct student* stu = NEW_STUDENT();
        struct student_score* score = NEW_STUDENT_SCORE();
        score->stu = stu; 
        fscanf(fd, "%s\t%s\t%d\n", stu->snum, stu->name, &score->clang);
        
        student_score_list_add(&student_score_list, score);
    }
    fclose(fd);
    return 1;
}
