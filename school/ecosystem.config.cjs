module.exports = {
    apps: [
        {
            name: "school-platform",
            script: "node",
            args: "node_modules/next/dist/bin/next start -p 3000",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
