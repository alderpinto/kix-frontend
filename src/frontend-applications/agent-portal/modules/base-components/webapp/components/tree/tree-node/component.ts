/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../core/tree';

class TreeNodeComponent {

    private state: ComponentState;
    private hasListener: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;

        if (this.state.node) {
            this.state.isVisible = this.state.node.selectable || this.hasClickableChildren(this.state.node.children);
            if (!this.state.node.expandOnClick) {
                this.state.node.expandOnClick = !this.state.node.selectable;
            }
        }

        this.state.filterValue = input.filterValue;
        this.state.activeNode = input.activeNode;
        (this as any).setStateDirty('activeNode');
        this.state.treeId = input.treeId;
        this.state.nodeId = this.state.treeId + '-node-' + this.state.node.id;
        if (!this.hasListener && input.treeParent) {
            this.state.treeParent = input.treeParent;
            this.state.treeParent.addEventListener('keydown', this.navigateTree.bind(this));
            this.hasListener = true;
        }
    }

    private hasClickableChildren(tree: TreeNode[]): boolean {
        for (const t of tree) {
            if (t.selectable) {
                return true;
            }

            if (t.children && t.children.length) {
                const hasChildren = this.hasClickableChildren(t.children);
                if (hasChildren) {
                    return true;
                }
            }
        }
        return false;
    }

    public onDestroy(): void {
        this.state.treeParent.removeEventListener('keydown', this.navigateTree);
        this.state.node = null;
        this.state.filterValue = null;
    }

    public hasChildren(): boolean {
        return (this.state.node.children && this.state.node.children.length > 0);
    }

    public getLabel(): string {
        let title = this.state.node.label;
        if (this.state.node.properties) {
            const values = this.state.node.properties.map((prop) => prop.value);
            title += ' (' + values.join('|') + ')';
        }
        return title;
    }

    private isNodeActive(): boolean {
        return this.state.activeNode && this.state.activeNode.id === this.state.node.id;
    }

    public hasActiveChild(): boolean {
        return this.state.activeNode &&
            this.state.node.children &&
            this.checkForActiveChild(this.state.node.children);
    }

    private checkForActiveChild(children: TreeNode[]): boolean {
        return children && children.length && children.some(
            (c) => c.id === this.state.activeNode.id || this.checkForActiveChild(c.children)
        );
    }

    public toggleNode(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).emit('nodeToggled', this.state.node);
        (this as any).setStateDirty();
    }

    public nodeClicked(event: any): void {
        if (this.state.node.expandOnClick) {
            this.toggleNode(event);
        }

        if (this.state.node.selectable) {
            (this as any).emit('nodeClicked', this.state.node);
        }
    }

    public nodeHovered(): void {
        if (!this.isNodeActive()) {
            (this as any).emit('nodeHovered', this.state.node);
        }
    }

    public childNodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    public childNodeToggled(node: TreeNode): void {
        (this as any).emit('nodeToggled', node);
    }

    public childNodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    // TODO: Tastatur-Steuerung wieder aktivieren, falls nötig
    private navigateTree(event: any): void {
        // if (this.state.node && this.navigationKeyPressed(event) && this.isNodeActive()) {
        //     if (event.preventDefault) {
        //         event.preventDefault();
        //         event.stopPropagation();
        //     }

        //     switch (event.key) {
        //         case 'ArrowUp':
        //             if (this.state.node.previousNode) {
        //                 this.childNodeHovered(this.state.node.previousNode);
        //             }
        //             break;
        //         case 'ArrowDown':
        //             if (this.state.node.nextNode) {
        //                 this.childNodeHovered(this.state.node.nextNode);
        //             }
        //             break;
        //         case 'ArrowLeft':
        //             this.state.node.expanded = false;
        //             this.childNodeToggled(this.state.node);
        //             (this as any).setStateDirty();
        //             break;
        //         case 'ArrowRight':
        //             if (TreeUtil.hasChildrenToShow(this.state.node, this.state.filterValue)) {
        //                 this.state.node.expanded = true;
        //                 this.childNodeToggled(this.state.node);
        //                 (this as any).setStateDirty();
        //             }
        //             break;
        //         default:
        //     }
        // }
    }

    public navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowLeft'
            || event.key === 'ArrowRight'
            || event.key === 'ArrowUp'
            || event.key === 'ArrowDown';
    }
}

module.exports = TreeNodeComponent;
