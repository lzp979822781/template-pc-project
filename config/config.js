// https://umijs.org/config/
import os from "os";
// eslint-disable-next-line import/no-extraneous-dependencies
import slash from "slash2";
import pageRoutes from "./router.config";
import webpackPlugin from "./plugin.config";
import themeConfig from "./theme.config";

const plugins = [
    [
        "umi-plugin-react",
        {
            antd: true,
            dva: {
                hmr: true,
            },
            locale: {
                enable: true, // default false
                default: "zh-CN", // default zh-CN
                baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
            },
            dynamicImport: {
                loadingComponent: "./components/PageLoading/index",
                webpackChunkName: true,
            },
            pwa: {
                workboxPluginMode: "InjectManifest",
                workboxOptions: {
                    importWorkboxFrom: "local",
                },
            },
            ...(!process.env.TEST && os.platform() === "darwin"
                ? {
                    dll: {
                        include: ["dva", "dva/router", "dva/saga", "dva/fetch"],
                        exclude: ["@babel/runtime"],
                    },
                    hardSource: false,
                }
                : {}),
        },
    ],
];

// 针对 preview.pro.ant.design 的 GA 统计代码
// 业务上不需要这个
if (process.env.APP_TYPE === "site") {
    plugins.push([
        "umi-plugin-ga",
        {
            code: "UA-72788897-6",
        },
    ]);
}

export default {
    // add for transfer to umi
    plugins,
    define: {
        APP_TYPE: process.env.APP_TYPE || "",
    },
    treeShaking: true,
    targets: {
        ie: 10,
    },
    // 路由配置
    routes: pageRoutes,
    // Theme for antd
    // https://ant.design/docs/react/customize-theme-cn
    theme: themeConfig, // 配置主题
    externals: {
        "@antv/data-set": "DataSet",
    },
    // history: 'hash',
    hash: true,
    base: "/gyn/",
    publicPath: "//yaostatic.jd.com/yao_static/react/standard/",
    proxy: {
        "/api": {
            target: "http://yaogy.jd.com/",
            secure: false,
            changeOrigin: true,
        },
    },
    ignoreMomentLocale: true,
    lessLoaderOptions: {
        javascriptEnabled: true,
    },
    disableRedirectHoist: true,
    cssLoaderOptions: {
        modules: true,
        getLocalIdent: (context, localIdentName, localName) => {
            if (context.resourcePath.includes("node_modules") || context.resourcePath.includes("ant.design.pro.less") || context.resourcePath.includes("global.less")) {
                return localName;
            }
            const match = context.resourcePath.match(/src(.*)/);
            if (match && match[1]) {
                const antdProPath = match[1].replace(".less", "");
                const arr = slash(antdProPath)
                    .split("/")
                    .map(a => a.replace(/([A-Z])/g, "-$1"))
                    .map(a => a.toLowerCase());
                return `antd-pro${arr.join("-")}-${localName}`.replace(/--/g, "-");
            }
            return localName;
        },
    },
    manifest: {
        basePath: "/",
    },

    chainWebpack: webpackPlugin,
};
