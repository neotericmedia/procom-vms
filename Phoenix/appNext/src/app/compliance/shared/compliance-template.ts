import { ComplianceTemplateRestriction, ComplianceTemplateRestrictionExtension } from './compliance-template-restriction';
import { AccessAction } from '../../common/model/index';
import { PhxConstants } from '../../common/index';

export interface ComplianceTemplate {
    AccessActions: Array<AccessAction>;

    Id: number;
    Name: string;
    ComplianceDocumentTypeId?: number;
    ComplianceDocumentTypeName?: string;
    ComplianceDocumentTypeStatusId?: PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus;
    SampleDocumentId?: number;
    SampleDocumentName: string;
    SampleDocumentPublicId: string;

    TemplateDocumentId?: number;
    TemplateDocumentName: string;
    TemplateDocumentPublicId: string;

    LastModifiedDatetime: Date;

    HasRestriction: boolean;
    LineOfBusinesses: string;
    ClientOrganizations: string;
    Branches: string;
    ProfileTypes: string;
    InternalOrganizations: string;
    Worksites: string;
    OrganizationRoleTypes: string;
    TaxSubdivisions: string;
    WorkerEligibilities: string;

    LineOfBusinessList: Array<string>;
    ClientOrganizationList: Array<string>;
    BranchList: Array<string>;
    ProfileTypeList: Array<string>;
    InternalOrganizationList: Array<string>;
    WorksiteList: Array<string>;
    OrganizationRoleTypeList: Array<string>;
    TaxSubdivisionList: Array<string>;
    WorkerEligibilityList: Array<string>;

    Restrictions: Array<ComplianceTemplateRestriction>;
}

export class ComplianceTemplateExtension {
    public static setRestrictions(template: ComplianceTemplate, restrictionType: PhxConstants.ComplianceTemplateRestrictionType, newRestrictions: Array<{ id: number, text: string }>): void {
        const textArray = newRestrictions.map(item => item.text);
        const commaSeperatedTexts = textArray.join(', ');
        switch (restrictionType) {
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganizationDefinition1: {
                template.Branches = commaSeperatedTexts;
                template.BranchList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

            }
                break;

            case PhxConstants.ComplianceTemplateRestrictionType.ClientOrganization: {
                template.ClientOrganizations = commaSeperatedTexts;
                template.ClientOrganizationList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganization: {
                template.InternalOrganizations = commaSeperatedTexts;
                template.InternalOrganizationList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.LineOfBusiness: {
                template.LineOfBusinesses = commaSeperatedTexts;
                template.LineOfBusinessList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.OrganizationRoleType: {
                template.OrganizationRoleTypes = commaSeperatedTexts;
                template.OrganizationRoleTypeList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.Worksite: {
                template.Worksites = commaSeperatedTexts;
                template.WorksiteList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerType: {
                template.ProfileTypes = commaSeperatedTexts;
                template.ProfileTypeList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.TaxSubdivision: {
                template.TaxSubdivisions = commaSeperatedTexts;
                template.TaxSubdivisionList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerEligibility: {
                template.WorkerEligibilities = commaSeperatedTexts;
                template.WorkerEligibilityList = textArray;

                ComplianceTemplateExtension.mergeRestrictions(template, restrictionType, newRestrictions);

                break;
            }
        }

        template.HasRestriction =
            (template.BranchList.length +
                template.ClientOrganizationList.length +
                template.InternalOrganizationList.length +
                template.LineOfBusinessList.length +
                template.OrganizationRoleTypeList.length +
                template.ProfileTypeList.length +
                template.WorksiteList.length +
                template.TaxSubdivisionList.length +
                template.WorkerEligibilityList.length
            ) > 0;
    }

    public static getRestrictions(template: ComplianceTemplate, restrictionType: PhxConstants.ComplianceTemplateRestrictionType): Array<number> {
        const filteredRestrictionByRestrictionType = template.Restrictions.filter((item) => item.ComplianceTemplateRestrictionTypeId === restrictionType);
        switch (restrictionType) {
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganizationDefinition1: {
                return filteredRestrictionByRestrictionType.map((item) => item.BranchId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.ClientOrganization: {
                return filteredRestrictionByRestrictionType.map((item) => item.ClientOrganizationId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganization: {
                return filteredRestrictionByRestrictionType.map((item) => item.InternalOrganizationId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.LineOfBusiness: {
                return filteredRestrictionByRestrictionType.map((item) => item.LineOfBusinessId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.OrganizationRoleType: {
                return filteredRestrictionByRestrictionType.map((item) => item.OrganizationRoleTypeId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.Worksite: {
                return filteredRestrictionByRestrictionType.map((item) => item.WorksiteId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerType: {
                return filteredRestrictionByRestrictionType.map((item) => item.ProfileTypeId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.TaxSubdivision: {
                return filteredRestrictionByRestrictionType.map((item) => item.TaxSubdivisionId);
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerEligibility: {
                return filteredRestrictionByRestrictionType.map((item) => item.WorkerEligibilityId);
            }
        }

    }

    private static mergeRestrictions(template: ComplianceTemplate, restrictionType: PhxConstants.ComplianceTemplateRestrictionType, newRestrictions: Array<{ id: number, text: string }>): void {
        const restrictions = template.Restrictions.filter((item) => item.ComplianceTemplateRestrictionTypeId === restrictionType);

        restrictions.forEach((item) => {

            const newRestriction = newRestrictions.find((newItem) => newItem.id === ComplianceTemplateRestrictionExtension.getRestrictionEntityId(item));

            if (newRestriction == null) {
                const itemIndex = template.Restrictions.findIndex((i) => item.Id === i.Id);
                if (itemIndex !== -1) {
                    template.Restrictions.splice(itemIndex, 1);
                }
            }
        });


        newRestrictions.forEach((newItem) => {
            const idx = restrictions.findIndex((item) => newItem.id === ComplianceTemplateRestrictionExtension.getRestrictionEntityId(item));
            if (idx === -1) {
                const newRestriction: ComplianceTemplateRestriction = {
                    Id: 0,
                    ComplianceTemplateRestrictionTypeId: restrictionType,
                    ComplianceTemplateId: template.Id,
                };

                ComplianceTemplateRestrictionExtension.setRestrictionEntity(newRestriction, newItem.id, newItem.text);
                template.Restrictions.push(newRestriction);
            }

        });
    }
}
