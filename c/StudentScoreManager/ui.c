#include "stdio.h"
#include "pcc32.h"
#include "ui.h"

static char* navTitleStack[10];
static int navTitleStackTop = 0;

static void setNavTitle()
{
    char title[200] = {0};
    int i;
    for(i = 0; i < navTitleStackTop; i++) {
        strcat(title, navTitleStack[i]);
        if(i < navTitleStackTop - 1)
            strcat(title, " > ");
    }
    setConsoleTitle(title);
} 

void pushNavTitle(const char* t)
{
    navTitleStack[navTitleStackTop] = (char*)t;
    navTitleStackTop++;
    setNavTitle();
}

void popNavTitle()
{
    navTitleStackTop--;
    setNavTitle();
}

void initUI()
{
    pushNavTitle("学生成绩记录薄");
    setBackColor(MAGENTA);
    setTextColor(WHITE);
}

void padChars(char c, int n)
{
    for(; n >= 0; n--)
        putchar(c);
}

void printLine(char c, int len)
{
    for(; len >= 0; len--)
        putchar(c);
    putchar('\n');
}

int printCenter(const char* str)
{
    const char* sc = str;
    int len = 0; 
    while(*sc) {
        if(*sc == '\t')
            len += 4;
        else if(*sc != '\n')
            len++;
        sc++;
    }
    int padding = (getLineWidth() - len) / 2;
    padChars(' ', padding);
    printf(str);
    return padding;
}

void menu_init(struct menu* menu, const char* items[], int n)
{
    menu->items = (char**)malloc(sizeof(char*) * n);
    int i;
    for(i = 0; i < n; i++)
        menu->items[i] = (char*)items[i];
    menu->items_count = n;
    menu->selected_index = 0;
    
    menu->anchor = 1;
    /* 为了让菜单项文字左对齐，选择最长 */ 
    int maxWidth = 0;
    for(i = 0; i < menu->items_count; i++) {
        int width = strlen(menu->items[i]);
        if(width > maxWidth)
            maxWidth = width;
    }
    menu->width = maxWidth + 6;//加上左右内边距
    if(menu->anchor == 1) {
        menu->x = (getLineWidth() - menu->width) / 2;//菜单居中
    }
    menu->y = getCursorY();
}

void menu_update(struct menu* menu)
{
    if(menu->anchor == 1) {
        menu->x = (getLineWidth() - menu->width) / 2;
    }
}

void menu_draw(struct menu* menu)
{
    int bc = getBackColor();
    int tc = getTextColor();
    int i;
    for(i = 0; i < menu->items_count; i++) {
        gotoTextPos(menu->x, menu->y + i);
        int selected = i == menu->selected_index; 
        setBackColor(selected ? LIGHT_MAGENTA : bc);
        setTextColor(selected ? LIGHT_CYAN : tc);
        int leftpadding = menu->width%2 == 0 ? 2 : 3;
        padChars(' ', leftpadding);
        int n = printf("%d.%s", i + 1, menu->items[i]);
        padChars(' ', menu->width - leftpadding - n);
        printf("\n");
        
    }
    gotoTextPos(menu->x - 1, menu->y + menu->selected_index);
    setBackColor(bc);
    setTextColor(tc);
}

int menu_select(struct menu* menu)
{
    menu_draw(menu);
    uint16 key;
    int stateChange = 0;
    int enter = 0;
    setCursorVisible(0);
    while(1) {
        if(!jkHasKey()) continue;
        
        key = jkGetKey();
        if(isdigit(key) && (1 + '0' <= key && key <= menu->items_count + '0')) {
            menu->selected_index = key - '1';
            stateChange = 1;
            enter = 1;
        }
        else
        switch(key){
        case JK_UP:
            if(menu->selected_index > 0)
                menu->selected_index--;
            else
                menu->selected_index = menu->items_count - 1;
            stateChange = 1;
            break;
        case JK_DOWN:
            if(menu->selected_index < menu->items_count - 1)
                menu->selected_index++;
            else
                menu->selected_index = 0;
            stateChange = 1;
            break;
        case JK_ENTER:
            enter = 1;
            stateChange = 2;
            break;
        case JK_ESC:
            return JK_ESC;
        }
        if(stateChange) {
            menu_draw(menu);
            int selected_no = menu->selected_index + 1;
            if(enter) {
                setCursorVisible(1);
                return selected_no;
            }
        }
    }
}

