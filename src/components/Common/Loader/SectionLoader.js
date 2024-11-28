import { Spin } from 'antd'
import React from 'react'

const SectionLoader = ({ loading, message }) => {
  
  return loading ? (
    <div className='section-loader'>
      <Spin tip={message}></Spin>
    </div>
  ) : null
}

export default SectionLoader
