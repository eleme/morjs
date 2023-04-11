import React from 'react'
import styles from './feature.module.css'

type FeatureItem = {
  title: string
  icon: string
  description: string
}

const FeatureList: FeatureItem[] = [
  {
    title: '可扩展',
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01BbQlkV1hTNBKxf8DO_!!6000000004278-0-tps-256-256.jpg',
    description:
      'MorJS 实现了完备的生命周期，并使其插件化，MorJS 内部功能也全由插件完成。此外还支持插件和插件集，以满足功能和垂直域的分层需求。'
  },
  {
    title: '开箱即用',
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN015mdGXl1S7e9yUmvbJ_!!6000000002200-0-tps-260-256.jpg',
    description:
      'MorJS 内置了脚手架、构建、分析、多端编译等，仅需一个依赖即可上手开发。'
  },
  {
    title: '企业级',
    icon: 'https://img.alicdn.com/imgextra/i3/O1CN01bVt5A71wU1zRDRnbK_!!6000000006310-0-tps-260-256.jpg',
    description: '经饿了么内部 100+ 公司项目的验证，值得信赖。'
  },
  {
    title: '大量自研',
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN019mjFBS1yTgvfC80sW_!!6000000006580-0-tps-256-256.jpg',
    description:
      '多端组件打包、文档工具、请求库、数据流、复杂小程序集成、小程序形态转换等，满足日常项目的周边需求。'
  },
  {
    title: '多端支持',
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01PWl26a24Ib1pE3Pzn_!!6000000007368-0-tps-260-256.jpg',
    description: '支持一键转换为各类小程序平台及 Web 应用, 节省双倍人力。'
  },
  {
    title: '面向未来',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN012gfk5g1RdQ1CddDfN_!!6000000002134-0-tps-260-256.jpg',
    description:
      '在满足需求的同时，我们也不会停止对新技术的探索。比如 多端扩充、高性能渲染方案 等。'
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
