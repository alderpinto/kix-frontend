import { SearchOperator } from "../../SearchOperator";
import {
    KIXObjectType, InputFieldTypes, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, TreeNode, KIXObject, DataType
} from "../../../model";
import { SearchResultCategory } from "./SearchResultCategory";
import { LabelService } from "../../LabelService";
import { IColumnConfiguration, DefaultColumnConfiguration } from "../../table";

export abstract class SearchDefinition {

    public constructor(public objectType: KIXObjectType) { }

    public abstract getProperties(parameter?: Array<[string, any]>): Promise<Array<[string, string]>>;

    public abstract getOperations(property: string, parameter?: Array<[string, any]>): Promise<SearchOperator[]>;

    public abstract getInputFieldType(
        property: string, parameter?: Array<[string, any]>
    ): Promise<InputFieldTypes>;

    public abstract getInputComponents(): Promise<Map<string, string>>;

    public abstract getSearchResultCategories(): Promise<SearchResultCategory>;

    public async getDisplaySearchValue(property: string, parameter: Array<[string, any]>, value: any): Promise<string> {
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        return await labelProvider.getPropertyValueDisplayText(property, value);
    }

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        return [];
    }

    public async getTreeNodes(property: string, parameter: Array<[string, any]>): Promise<TreeNode[]> {
        return [];
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        return criteria.filter((c) => c.value !== null && c.value !== undefined && c.value !== '');
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        return [new FilterCriteria(property, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, value)];
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<IColumnConfiguration[]> {
        const columns: IColumnConfiguration[] = [];
        for (const p of searchParameter) {
            let text = p[1];
            if (!text) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
                if (labelProvider) {
                    text = await labelProvider.getPropertyText(p[0]);
                }
            }

            columns.push(new DefaultColumnConfiguration(
                p[0], true, false, true, false, 150, true, true, false, DataType.STRING, true)
            );
        }
        return columns;
    }
}
