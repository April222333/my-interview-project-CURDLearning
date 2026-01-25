
import React, { Component, ComponentType } from 'react';

//定义空白页面组件的Props类型
interface BlankPageProps {} 


class BlankPage extends Component<BlankPageProps> {
  static propTypes = {};

  render() {
    return <div>BlankPage</div>;
  }
}

export default BlankPage as ComponentType<BlankPageProps>;