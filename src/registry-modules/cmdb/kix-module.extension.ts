import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'cmdb-module';

    public initComponents: UIComponent[] = [
        new UIComponent('cmdb-module-read-component', 'cmdb/module/cmdb-read-module-component', [
            new UIComponentPermission('cmdb/configitems', [CRUD.READ])
        ]),
        new UIComponent('cmdb-module-edit-component', 'cmdb/module/cmdb-edit-module-component', [
            new UIComponentPermission('cmdb/configitems/*', [CRUD.UPDATE]),
            new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.CREATE])
        ])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('cmdb-module', 'cmdb/cmdb-module', []),
        new UIComponent('config-item-info', 'cmdb/config-item-info', []),
        new UIComponent('new-config-item-dialog', 'cmdb/dialogs/new-config-item-dialog', []),
        new UIComponent('edit-config-item-dialog', 'cmdb/dialogs/edit-config-item-dialog', []),
        new UIComponent('search-config-item-dialog', 'cmdb/dialogs/search-config-item-dialog', []),
        new UIComponent('config-item-version-details', 'cmdb/config-item-version-details', []),
        new UIComponent('ci-class-reference-input', 'cmdb/inputs/ci-class-reference-input', []),
        new UIComponent('ci-class-input', 'cmdb/inputs/ci-class-input', []),
        new UIComponent('config-item-info-widget', 'cmdb/widgets/config-item-info-widget', []),
        new UIComponent('config-item-history-widget', 'cmdb/widgets/config-item-history-widget', []),
        new UIComponent('config-item-graph-widget', 'cmdb/widgets/config-item-graph-widget', []),
        new UIComponent('config-item-class-explorer', 'cmdb/widgets/config-item-class-explorer', []),
        new UIComponent('config-item-chart-widget', 'cmdb/widgets/config-item-chart-widget', []),
        new UIComponent('config-item-images-widget', 'cmdb/widgets/config-item-images-widget', []),
        new UIComponent('config-item-class-definition', 'cmdb/config-item-class-definition', []),
        new UIComponent(
            'compare-config-item-version-dialog', 'cmdb/dialogs/compare-config-item-version-dialog', []
        ),
        new UIComponent(
            'config-item-version-compare-legend', 'cmdb/widgets/config-item-version-compare-legend', []
        ),
        new UIComponent('go-to-version-cell', 'cmdb/table/go-to-version-cell', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
