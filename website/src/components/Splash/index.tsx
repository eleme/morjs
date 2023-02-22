import React from 'react';
// eslint-disable-next-line node/no-missing-import
import Link from '@docusaurus/Link'
import styles from './splash.module.css'

function Splash(): JSX.Element {
  const splash =
    'https://img.alicdn.com/imgextra/i4/O1CN01S3jBZO23ZFoVGXZHp_!!6000000007269-2-tps-1300-1052.png'

  return (
    <header className={styles.splashBg}>
      <div className={styles.splash}>
        <div className={styles['title-container']}>
          <h1 className={styles['splash-title']}>MorJS 小程序多端研发框架</h1>
          <p className={styles['splash-subtitle']}>
            以多端编译为基础，配以面向全生命周期的插件体系，覆盖从源码到产物的每个阶段，支持各类功能扩展和业务需求。
          </p>
          <Link
            className={styles['splash-btn']}
            to="/guides/introduction/getting-started"
          >
            快速上手
          </Link>
        </div>
        <div className={styles['image-container']}>
          <img className={styles['splash-img']} src={splash} />
        </div>
      </div>
    </header>
  )
}

export default Splash
