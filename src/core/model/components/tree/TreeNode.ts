/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNodeProperty } from "./TreeNodeProperty";
import { ObjectIcon } from "../..";

export class TreeNode {
    public constructor(
        public id: any = null,
        public label: string = null,
        public icon: string | ObjectIcon = null,
        public secondaryIcon: string | ObjectIcon = null,
        public children?: TreeNode[],
        public parent?: TreeNode,
        public nextNode?: TreeNode,
        public previousNode?: TreeNode,
        public properties?: TreeNodeProperty[],
        public expanded: boolean = false,
        public visible: boolean = false,
        public expandOnClick: boolean = false,
        public clickable: boolean = true,
        public tooltip: string = label,
        public flags: string[] = []
    ) { }
}
