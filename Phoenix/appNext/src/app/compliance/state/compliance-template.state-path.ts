export const ComplianceTemplateStatePath = {
    complianceTemplate: {
        complianceTemplates: {
            instance: `complianceTemplate.complianceTemplates`,
            byId: (Id: number) => {
                return {
                    instance: `complianceTemplate.complianceTemplates.${Id}`
                };
            },
        },
        uiState: {
            instance: `complianceTemplate.uiState`,
            byId: (Id: number) => {
                return {
                    instance: `complianceTemplate.uiState.${Id}`,
                    editable: {
                        instance: `complianceTemplate.uiState.${Id}.editable`,
                    }
                };
            },
        }
    },
};
