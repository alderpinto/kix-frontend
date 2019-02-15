import {
    KIXObjectSearchService, DialogService, WidgetService, TableConfiguration, TableRowHeight,
    TableHeaderHeight, KIXObjectService, SearchOperator, BrowserUtil,
    TableFactoryService, ContextService, TableEvent, DefaultColumnConfiguration, ValueState
} from "../../../../core/browser";
import { FormService } from "../../../../core/browser/form";
import {
    FormContext, KIXObject, KIXObjectType, WidgetType, CreateLinkDescription, LinkTypeDescription,
    TreeNode, LinkType, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, DataType
} from "../../../../core/model";
import { ComponentState } from './ComponentState';
import { LinkUtil, LinkObjectDialogContext } from "../../../../core/browser/link";
import { EventService, IEventSubscriber } from "../../../../core/browser/event";

class LinkDialogComponent {

    private state: ComponentState;
    private linkTypeDescriptions: LinkTypeDescription[] = [];
    private resultListenerId: string;
    private linkPartners: Array<[string, KIXObjectType]> = [];
    private rootObject: KIXObject = null;
    public selectedObjects: KIXObject[] = [];

    private tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.linkDescriptions = !this.state.linkDescriptions
            ? input.linkDescriptions || []
            : this.state.linkDescriptions;
        this.state.objectType = input.objectType;
        this.resultListenerId = input.resultListenerId;
        this.rootObject = input.rootObject;
    }

    public onDestroy(): void {
        this.state.linkDescriptions = null;
    }

    public async onMount(): Promise<void> {
        this.selectedObjects = [];
        await this.setLinkableObjects();
        await this.setDefaultLinkableObject();

        WidgetService.getInstance().setWidgetType('link-object-dialog-form-widget', WidgetType.GROUP);

        const context = await ContextService.getInstance().getContext<LinkObjectDialogContext>(
            LinkObjectDialogContext.CONTEXT_ID
        );
        context.setObjectList([]);

        this.setLinkTypes();
        if (this.state.currentLinkableObjectNode) {
            this.prepareResultTable();
        }

        this.setSubmitState();
    }

    private async setLinkableObjects(): Promise<void> {
        this.linkPartners = await LinkUtil.getPossibleLinkPartners(this.state.objectType);

        this.linkPartners.forEach((lp) => {
            const formId = FormService.getInstance().getFormIdByContext(FormContext.LINK, lp[1]);
            if (formId) {
                this.state.linkableObjectNodes.push(new TreeNode(formId, lp[0]));
            }
        });
        if (this.state.linkableObjectNodes.length) {
            (this as any).setStateDirty('linkableObjectNodes');
        }
    }

    private async setDefaultLinkableObject(): Promise<void> {
        if (this.state.linkableObjectNodes.length) {
            const ticketNode = this.state.linkableObjectNodes.find((lo) => lo.label === KIXObjectType.TICKET);
            if (ticketNode) {
                this.state.currentLinkableObjectNode = ticketNode;
            } else {
                this.state.currentLinkableObjectNode = this.state.linkableObjectNodes[0];
            }

            await FormService.getInstance().getFormInstance(this.state.formId, false);
            this.state.formId = this.state.currentLinkableObjectNode.id.toString();
        }
    }

    public async keyPressed(event: any): Promise<void> {
        if (this.state.formId) {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            if (event.key === 'Enter' && formInstance.hasValues()) {
                this.executeSearch();
            }
        }
    }

    public async linkableObjectChanged(nodes: TreeNode[]): Promise<void> {
        DialogService.getInstance().setOverlayDialogLoading(true);

        this.state.currentLinkableObjectNode = nodes && nodes.length ? nodes[0] : null;
        this.selectedObjects = [];
        this.state.resultCount = 0;

        this.state.formId = null;

        const context = await ContextService.getInstance().getContext<LinkObjectDialogContext>(
            LinkObjectDialogContext.CONTEXT_ID
        );
        context.setObjectList([]);

        let formId;
        if (this.state.currentLinkableObjectNode) {
            formId = this.state.currentLinkableObjectNode.id.toString();
            await FormService.getInstance().getFormInstance(formId, false);
            await this.prepareResultTable();
        } else {
            this.state.table = null;
            formId = null;
            this.state.resultCount = 0;
        }

        await this.setLinkTypes();

        (this as any).setStateDirty('currentLinkableObjectNode');

        setTimeout(() => {
            this.state.formId = formId;
            this.setSubmitState();
            DialogService.getInstance().setOverlayDialogLoading(false);
        }, 50);
    }

    private async executeSearch(): Promise<void> {
        DialogService.getInstance().setOverlayDialogLoading(true);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (this.state.currentLinkableObjectNode && formInstance.hasValues()) {
            const objects = await KIXObjectSearchService.getInstance().executeSearch(
                this.state.currentLinkableObjectNode.id,
                this.rootObject && formInstance.getObjectType() === this.rootObject.KIXObjectType
                    ? [this.rootObject] : null
            );

            const context = await ContextService.getInstance().getContext<LinkObjectDialogContext>(
                LinkObjectDialogContext.CONTEXT_ID
            );
            context.setObjectList(objects);
            await this.prepareResultTable();
            this.state.resultCount = objects.length;
            this.setSubmitState();
        }

        DialogService.getInstance().setOverlayDialogLoading(false);
    }

    private async prepareResultTable(): Promise<void> {
        this.state.table = null;

        if (this.state.currentLinkableObjectNode) {
            const formInstance = await FormService.getInstance().getFormInstance(
                this.state.currentLinkableObjectNode.id
            );

            const objectType = formInstance.getObjectType();

            const tableConfiguration = new TableConfiguration(
                objectType, null, 5, null, null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = TableFactoryService.getInstance().createTable(
                objectType, tableConfiguration, null, LinkObjectDialogContext.CONTEXT_ID, null, null, true
            );

            this.state.table = table;

            this.tableSubscriber = {
                eventSubscriberId: 'link-object-dialog',
                eventPublished: (data: any, eventId: string) => {
                    if (data === table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED) {
                            table.addColumns([
                                new DefaultColumnConfiguration(
                                    'LinkedAs', true, false, true, false, 100, true, true, false, DataType.STRING
                                )
                            ]);
                            this.initSelectableRows();
                        }
                        this.selectedObjects = table.getSelectedRows().map((r) => r.getRowObject().getObject());
                        this.setSubmitState();
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
            EventService.getInstance().subscribe(TableEvent.SELECTION_CHANGED, this.tableSubscriber);
        }
    }

    private initSelectableRows(): void {
        const linkObjects = this.state.linkDescriptions.map((ld) => ld.linkableObject);
        const values = this.state.linkDescriptions.map((ld) => {
            const name = ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName;

            const value: [any, [string, any]] = [ld.linkableObject, ['LinkedAs', name]];
            return value;
        });

        this.state.table.setRowObjectValues(values);
        this.state.table.setRowsSelectableByObject(linkObjects, false);
    }

    private setSubmitState(): void {
        this.state.canSubmit = this.selectedObjects.length > 0 && this.state.currentLinkTypeDescription !== null;
    }

    public submitClicked(): void {
        if (this.state.canSubmit) {
            const newLinks = this.selectedObjects.map(
                (so) => new CreateLinkDescription(so, { ...this.state.currentLinkTypeDescription })
            );
            this.state.linkDescriptions = [...this.state.linkDescriptions, ...newLinks];
            // FIXME: obsolet, DialogEvnets.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
            DialogService.getInstance().publishDialogResult(
                this.resultListenerId,
                [this.state.linkDescriptions, newLinks]
            );
            BrowserUtil.openSuccessOverlay(`${newLinks.length} Verknüpfung(en) erfolgreich zugeordnet.`);
            this.initSelectableRows();
            this.state.table.selectNone();
            this.state.table.setRowObjectValueState(newLinks, ValueState.HIGHLIGHT_SUCCESS);
        }
    }

    private async setLinkTypes(): Promise<void> {
        this.state.currentLinkTypeNode = null;
        this.state.linkTypeNodes = [];

        this.linkTypeDescriptions = [];

        if (this.state.currentLinkableObjectNode) {
            const linkPartner = this.linkPartners.find(
                (lp) => lp[0] === this.state.currentLinkableObjectNode.label
            );
            const loadingOptions = new KIXObjectLoadingOptions(null, [
                new FilterCriteria(
                    'Source', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, this.state.objectType
                ),
                new FilterCriteria(
                    'Target', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, linkPartner[1]
                )
            ]);

            const linkTypes = await KIXObjectService.loadObjects<LinkType>(
                KIXObjectType.LINK_TYPE, null, loadingOptions, null, false
            );

            linkTypes.forEach((lt) => {
                const id = this.linkTypeDescriptions.length;
                this.linkTypeDescriptions.push(new LinkTypeDescription(lt, true));
                const node = new TreeNode(id, lt.SourceName);
                this.state.linkTypeNodes.push(node);
                if (lt.Pointed === 1) {
                    const pointedLinkType = new LinkType(lt);
                    this.linkTypeDescriptions.push(new LinkTypeDescription(pointedLinkType, false));
                    const pointedNode = new TreeNode(id + 1, pointedLinkType.TargetName);
                    this.state.linkTypeNodes.push(pointedNode);
                }
            });
        } else {
            this.state.linkTypeNodes = [];
            this.state.currentLinkTypeDescription = null;
        }
        (this as any).setStateDirty('linkTypeNodes');
    }

    public linkTypeChanged(nodes: TreeNode[]): void {
        this.state.currentLinkTypeNode = nodes && nodes.length ? nodes[0] : null;
        this.state.currentLinkTypeDescription = this.state.currentLinkTypeNode ?
            this.linkTypeDescriptions[this.state.currentLinkTypeNode.id] : null;
        this.setSubmitState();
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }
}

module.exports = LinkDialogComponent;
