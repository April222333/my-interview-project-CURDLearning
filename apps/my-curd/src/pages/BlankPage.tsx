import PropTypes from 'prop-types';
import React, { Component, ComponentType } from 'react';

// 方案1：显式定义组件 props 类型（推荐，更规范）
interface BlankPageProps {} // 空 props 也显式定义

// 让类组件继承带 props 类型的 Component，同时导出时标注类型
class BlankPage extends Component<BlankPageProps> {
  static propTypes = {};

  render() {
    return <div>BlankPage</div>;
  }
}

// 显式标注默认导出的类型为 React 组件类型
export default BlankPage as ComponentType<BlankPageProps>;