// 解决TS无法识别CSS/LESS/SCSS模块的报错，全局声明，项目通用
// 直接声明 CSS 文件为合法模块，无需额外配置
declare module '*.css';
//后面两行没用上哈-待学习less 和 scss
declare module '*.less';
declare module '*.scss';