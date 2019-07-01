import { ComponentState } from './ComponentState';
import { ContextService } from '../../core/browser';
import { TreeNode, Bookmark } from '../../core/model';
import { TranslationService } from '../../core/browser/i18n/TranslationService';
import { AuthenticationSocketClient } from '../../core/browser/application/AuthenticationSocketClient';
import { KIXModulesSocketClient } from '../../core/browser/modules/KIXModulesSocketClient';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#Bookmarks');

        const availableBookmarks = [];
        const bookmarks = await KIXModulesSocketClient.getInstance().loadBookmarks();
        for (const b of bookmarks) {
            if (await AuthenticationSocketClient.getInstance().checkPermissions(b.permissions)) {
                availableBookmarks.push(new TreeNode(b, b.title, b.icon));
            }
        }
        this.state.bookmarks = availableBookmarks;
    }

    public nodesChanged(nodes: TreeNode[]): void {
        if (nodes && nodes.length) {
            const bookmark = nodes[0].id as Bookmark;
            ContextService.getInstance().setContext(bookmark.contextId, bookmark.objectType, null, bookmark.objectID);
            const component = (this as any).getComponent("bookmarks-dropdown");
            if (component) {
                component.clear();
            }
        }
    }

}

module.exports = Component;
