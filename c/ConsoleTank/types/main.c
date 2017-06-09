#include <stdio.h>
#include "list.h"

struct cat {
  char* name;
  int age;
};

struct int_node {
        struct cat val;
        struct list_head list;
};
 
int main()
{
        struct list_head head, *plist;
        struct int_node a, b;
 
        a.val.age = 2;
        b.val.age = 3;
 
        INIT_LIST_HEAD(&head);
        list_add(&a.list, &head);
        list_add(&b.list, &head);
 
        list_for_each(plist, &head) {
                struct int_node *node = list_entry(plist, struct int_node, list);
                printf("val = %d\n", node->val.age);
        }
        getchar();
        return 0;
}
