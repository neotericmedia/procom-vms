export const DemoStatePath = {
    demo: {
        demos: {
            instance: `demo.demos`,
            byId: (Id: number) => {
                return {
                    instance: `demo.demos.${Id}`
                };
            },
        },
    },
};
