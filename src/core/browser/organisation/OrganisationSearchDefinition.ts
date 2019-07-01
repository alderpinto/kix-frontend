import { SearchDefinition, SearchResultCategory } from "../kix";
import {
    KIXObjectType, OrganisationProperty, InputFieldTypes, FilterCriteria,
    KIXObjectLoadingOptions, KIXObjectProperty
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { OrganisationService } from "./OrganisationService";

export class OrganisationSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.ORGANISATION);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [
            [SearchProperty.FULLTEXT, null],
            [OrganisationProperty.NAME, null],
            [OrganisationProperty.NUMBER, null],
            [OrganisationProperty.CITY, null],
            [OrganisationProperty.COUNTRY, null],
            [OrganisationProperty.NUMBER, null],
            [OrganisationProperty.STREET, null],
            [OrganisationProperty.URL, null],
            [OrganisationProperty.ZIP, null]
        ];
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        const stringOperators = [
            SearchOperator.EQUALS,
            SearchOperator.STARTS_WITH,
            SearchOperator.ENDS_WITH,
            SearchOperator.CONTAINS,
            SearchOperator.LIKE
        ];
        const numberOperators = [
            SearchOperator.EQUALS,
            SearchOperator.IN
        ];

        if (this.isDropDown(property)) {
            operations = numberOperators;
        } else {
            operations = stringOperators;
        }

        return operations;
    }

    public async getInputFieldType(property: string, parameter?: Array<[string, any]>): Promise<InputFieldTypes> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === KIXObjectProperty.VALID_ID;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(KIXObjectProperty.VALID_ID, 'valid-input');
        return components;
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const contactCategory = new SearchResultCategory('Translatable#Contacts', KIXObjectType.CONTACT);
        const ticketCategory = new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET);

        return new SearchResultCategory(
            'Translatable#Organisations', KIXObjectType.ORGANISATION, [contactCategory, ticketCategory]
        );
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Tickets', 'Contacts']);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);
            const filter = await OrganisationService.getInstance().prepareFullTextFilter(value.toString());
            criteria = [...criteria, ...filter];
        }
        return criteria;
    }
}
