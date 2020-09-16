import { PhxConstants } from '../../common/index';




export interface ComplianceTemplateRestriction {
    Id: number;
    ComplianceTemplateId: number;
    ComplianceTemplateRestrictionTypeId: PhxConstants.ComplianceTemplateRestrictionType;
    LineOfBusinessId?: number;
    ClientOrganizationId?: number;
    BranchId?: number;
    ProfileTypeId?: number;
    InternalOrganizationId?: number;
    WorksiteId?: number;
    OrganizationRoleTypeId?: number;
    TaxSubdivisionId?: number;
    WorkerEligibilityId?: number;
    LineOfBusinessName?: string;
    ClientOrganizationName?: string;
    BranchName?: string;
    ProfileTypeName?: string;
    InternalOrganizationName?: string;
    WorksiteName?: string;
    OrganizationRoleTypeName?: string;
    TaxSubdivisionName?: string;
    WorkerEligibilityName?: string;
}

export class ComplianceTemplateRestrictionExtension {
    public static getRestrictionEntityId(restriction: ComplianceTemplateRestriction): number {
        switch (restriction.ComplianceTemplateRestrictionTypeId) {
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganizationDefinition1: {
                return restriction.BranchId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.ClientOrganization: {
                return restriction.ClientOrganizationId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganization: {
                return restriction.InternalOrganizationId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.LineOfBusiness: {
                return restriction.LineOfBusinessId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.OrganizationRoleType: {
                return restriction.OrganizationRoleTypeId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.Worksite: {
                return restriction.WorksiteId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerType: {
                return restriction.ProfileTypeId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.TaxSubdivision: {
                return restriction.TaxSubdivisionId;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerEligibility: {
                return restriction.WorkerEligibilityId;
            }
            default:
                return null;
        }
    }

    public static setRestrictionEntity(restriction: ComplianceTemplateRestriction, id: number, text: string) {
        switch (restriction.ComplianceTemplateRestrictionTypeId) {
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganizationDefinition1: {
                restriction.BranchId = id;
                restriction.BranchName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.ClientOrganization: {
                restriction.ClientOrganizationId = id;
                restriction.ClientOrganizationName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.InternalOrganization: {
                restriction.InternalOrganizationId = id;
                restriction.InternalOrganizationName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.LineOfBusiness: {
                restriction.LineOfBusinessId = id;
                restriction.LineOfBusinessName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.OrganizationRoleType: {
                restriction.OrganizationRoleTypeId = id;
                restriction.OrganizationRoleTypeName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.Worksite: {
                restriction.WorksiteId = id;
                restriction.WorksiteName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerType: {
                restriction.ProfileTypeId = id;
                restriction.ProfileTypeName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.TaxSubdivision: {
                restriction.TaxSubdivisionId = id;
                restriction.TaxSubdivisionName = text;
                break;
            }
            case PhxConstants.ComplianceTemplateRestrictionType.WorkerEligibility: {
                restriction.WorkerEligibilityId = id;
                restriction.WorkerEligibilityName = text;
                break;
            }
        }
    }
}
