#include <stdio.h>
#include <stdlib.h>
#include "student_score_list.h"
#include "manager.h"
#include "pcc32.h"
#include "ui.h"

void selectAndOp();
void help();
void printCopyrightInfo(int x, int y, int center);
int confirmExit();

int main(int argc, char *argv[])
{
    initUI();
    printf("加载数据中,请稍候...");
    INIT_LIST_HEAD(&student_score_list);
    loadfile_student_score_list();
    clearText();

    struct menu topMenu;
    const char* menuItems[] = {"查看所有成绩", "选择成绩以操作", "添加成绩", "帮助与关于", "刷新", "退出"};
    menu_init(&topMenu, menuItems, 6);
    topMenu.y = 4;

    int exit = 0;
    int choice;
    while(!exit) {
        printCopyrightInfo(0, 18, 1);
        gotoTextPos(0,0);
        printf("\n");
        printCenter("欢迎使用学生成绩记录薄\n");
        printCenter("请按数字键或上下键来选择功能,按Esc返回上一级界面.\n");
        menu_update(&topMenu);
        choice = menu_select(&topMenu);
        clearText();
        if(choice == JK_ESC)
            topMenu.selected_index = topMenu.items_count - 1;

        pushNavTitle(topMenu.items[topMenu.selected_index]);

        switch(choice) {
        case 1:
            table_student_scores(&student_score_list);
            getch();
            break;
        case 2:
            selectAndOp();
            topMenu.selected_index = 0;//为了方便查看新修改,默认选择查看
            break;
        case 3:
            add_student_score();
            topMenu.selected_index = 0;
            getch();
            break;
        case 4:
            help();
            getch();
            break;
        case 5:
            break;
        case JK_ESC:
        case 6:
            exit = confirmExit();
            break;
        }
        popNavTitle();
        clearText();
    }
	return 0;
}

void selectAndOp()
{
    struct menu lv2Menu;
    struct menu lv3Menu;
    const char* lv2MenuItems[] = {"按序号", "按学生学号", "按学生姓名", "C语言分数60以下", "C语言分数60~79", "C语言分数80~89", "C语言分数90以上", "返回"};
    const char* lv3MenuItems[] = {"修改", "删除", "返回"};
    menu_init(&lv2Menu, lv2MenuItems, 8);
    lv2Menu.y = 4;
    menu_init(&lv3Menu, lv3MenuItems, 3);

    int back, choice = 0;

    while(!back) {
        printf("\n\n");
        printCenter("选择-查询条件");
        pushNavTitle("查询条件");
        choice = menu_select(&lv2Menu);
        clearText();
        if(choice == JK_ESC)
            lv2Menu.selected_index = lv2Menu.items_count - 1;
        pushNavTitle(lv2Menu.items[lv2Menu.selected_index]);

        struct list_head results;
        INIT_LIST_HEAD(&results);
        struct student_score* result = NULL;
        switch(choice) {
        case 1:
            result = select_student_score_by_index();
            if(result != NULL)
                student_score_list_add(&results, result);
            break;
        case 2:
            select_student_scores_by_snum(&results);
            break;
        case 3:
            select_student_scores_by_name(&results);
            break;
        case 4:
            student_score_list_get_by_score_range(&student_score_list, &results, "clang", 0, 59);
            break;
        case 5:
            student_score_list_get_by_score_range(&student_score_list, &results, "clang", 60, 79);
            break;
        case 6:
            student_score_list_get_by_score_range(&student_score_list, &results, "clang", 80, 89);
            break;
        case 7:
            student_score_list_get_by_score_range(&student_score_list, &results, "clang", 90, 120);
            break;
        case JK_ESC:
        case 8:
            back = 1;
        }
        if(back) {
            popNavTitle();
            popNavTitle();
            break;
        }
        if(!list_empty(&results)) {
            table_student_scores(&results);
            printf("\n\n");
            printCenter("操作\n");
            lv3Menu.y = getCursorY();
            lv3Menu.selected_index = 0;
            choice = menu_select(&lv3Menu);
            popNavTitle();
            pushNavTitle(lv3Menu.items[lv3Menu.selected_index]);
            if(choice == JK_ESC)
                lv3Menu.selected_index = lv3Menu.items_count - 1;
            clearText();
            switch(choice) {
            case 1:
                modify_student_score(student_score_list_get_by_index(&results, 0));
                getch();
                break;
            case 2:
                del_student_scores(&results);
                getch();
                break;
            case JK_ESC:
            case 3:
                ;
            }
            popNavTitle();

        }
        else {
            puts("无结果.");
            getch();
            popNavTitle();
        }
        popNavTitle();
        clearText();
    }
}

void help()
{
    printf("\n");
    padChars(' ', 2);
    printf("学生成绩记录薄\n");
    printCopyrightInfo(3, getCursorY() + 1, 0);
}

void printCopyrightInfo(int x, int y, int center) {
    const char* copyrightSts[] = {"Copyright 2017 ", "Hu Lang", ". All Rights Reserved."};

    if(center) {
        gotoTextPos(getCursorX(), y);
        int padding = (getLineWidth() - strlen(copyrightSts[0]) - strlen(copyrightSts[1]) - strlen(copyrightSts[2])) / 2;
        padChars(' ', padding);
    }
    else {
        gotoTextPos(x, y);
    }
    int tc = getTextColor();
    setTextColor(WHITE);
    printf(copyrightSts[0]);
    setTextColor(LIGHT_CYAN);
    printf(copyrightSts[1]);
    setTextColor(WHITE);
    printf(copyrightSts[2]);
    setTextColor(tc);
}

int confirmExit()
{
    printCenter("您真的要退出吗?");
    struct menu menu;
    const char* menuItems[] = {"是,我想退出", "取消"};
    menu_init(&menu, menuItems, 2);
    menu.y = 2;

    int r = menu_select(&menu);
    if(r == 1) {
        student_score_list_free(&student_score_list);
        exit(0);
    }
    return 0;
}

