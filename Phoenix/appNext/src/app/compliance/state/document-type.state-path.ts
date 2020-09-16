export const DocumentTypeStatePath = {
    documentType: {
        documentTypes: {
            instance: `documentType.documentTypes`,
            byId: (Id: number) => {
                return {
                    instance: `documentType.documentTypes.${Id}`
                };
            },
        },
        uiState: {
            instance: `documentType.uiState`,
            byId: (Id: number) => {
                return {
                    instance: `documentType.uiState.${Id}`,
                    editable: {
                        instance: `documentType.uiState.${Id}.editable`,
                    }
                };
            },
        },
    },
};
