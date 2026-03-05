export default ({ config }) => {
    return {
        ...config,
        owner: process.env.EXPO_PUBLIC_EAS_OWNER,
        extra: {
            ...config.extra,
            eas: {
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
            },
        },
    };
};
