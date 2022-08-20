/* eslint no-var: 0 */
/* eslint vars-on-top: 0 */

declare global {
    var draggingItem:
        | undefined
        | {
              itemIndex: number;
              itemListUuid: string;
              itemGroup: string;
              itemOnMove?: (index: number) => any;
              initialItemIndex: number;
              initialItemListUuid: string;
          };
}

export {};
