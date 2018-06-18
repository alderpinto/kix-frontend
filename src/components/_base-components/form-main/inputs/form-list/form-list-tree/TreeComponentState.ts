import { TreeNode } from "@kix/core/dist/model";
import { IdService } from "@kix/core/dist/browser";

export class TreeComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = 'tree-' + IdService.generateDateBasedId(),
        public activeNodes: TreeNode[] = null,
        public treeParent: any = null,
        public treeStyle: string = null
    ) { }

}
