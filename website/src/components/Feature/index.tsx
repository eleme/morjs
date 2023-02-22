import React from 'react';
import styles from './feature.module.css'

type FeatureItem = {
  title: string
  icon: string
  description: string
}

const FeatureList: FeatureItem[] = [
  {
    title: '可扩展',
    icon: 'https://gw.alipayobjects.com/zos/basement_prod/a1c647aa-a410-4024-8414-c9837709cb43/k7787itw_w126_h114.png',
    description:
      'MorJS 实现了完备的生命周期，并使其插件化，MorJS 内部功能也全由插件完成。此外还支持插件和插件集，以满足功能和垂直域的分层需求。'
  },
  {
    title: '开箱即用',
    icon: 'https://gw.alipayobjects.com/zos/basement_prod/b54b48c7-087a-4984-b150-bcecb40920de/k7787z07_w114_h120.png',
    description:
      'MorJS 内置了脚手架、构建、分析、多端编译等，仅需一个依赖即可上手开发。'
  },
  {
    title: '企业级',
    icon: 'https://gw.alipayobjects.com/zos/basement_prod/464cb990-6db8-4611-89af-7766e208b365/k77899wk_w108_h132.png',
    description: '经饿了么内部 100+ 项目等公司项目的验证，值得信赖。'
  },
  {
    title: '大量自研',
    icon: 'https://gw.alipayobjects.com/zos/basement_prod/201bea40-cf9d-4be2-a1d8-55bec136faf2/k7788a8s_w102_h120.png',
    description:
      '多端组件打包、文档工具、请求库、数据流、复杂小程序集成、小程序形态转换等，满足日常项目的周边需求。'
  },
  {
    title: '多端支持',
    icon: 'https://gw.alipayobjects.com/zos/basement_prod/67b771c5-4bdd-4384-80a4-978b85f91282/k7788ov2_w126_h126.png',
    description: '支持一键转换为各类小程序平台及 Web 应用, 节省双倍人力。'
  },
  {
    title: '面向未来',
    icon: 'https://gw.alipayobjects.com/zos/basement_prod/d078a5a9-1cb3-4352-9f05-505c2e98bc95/k7788v4b_w102_h126.png',
    description:
      '在满足需求的同时，我们也不会停止对新技术的探索。比如 多端扩充、Weex 支持（测试中）等。'
  }
]

function Feature(): JSX.Element {
  return (
    <div className={styles.feature}>
      {FeatureList.map((item, index) => (
        <div key={index} className={styles['feature-item']}>
          <img className={styles['item-icon']} src={item.icon} />
          <h3 className={styles['item-title']}>{item.title}</h3>
          <p className={styles['item-desc']}>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

export default Feature
