/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useMemo } from 'react'
import { Table, Button } from 'antd'

import CustomAlert from '../CustomAlert/CustomAlert'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function CustomAntdTable(props) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const TableFooter = useMemo(() => {
    return (
      <>
        <div className='mt-3 pb-3 pr-1 text-right'>
          <Button
            type='primary'
            className='table-prev mr-3'
            onClick={e => {
              e.preventDefault()
              props?.previous()
            }}
            disabled={props?.disablePrev}
          >
            {translateTextI18N('Previous')}
          </Button>
          <Button
            type='primary'
            className='table-next'
            onClick={e => {
              e.preventDefault()
              props?.next()
            }}
            disabled={props?.disableNext}
          >
            {translateTextI18N('Next')}
          </Button>
        </div>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  const {
    columns,
    dataSource,
    loading,
    message = '',
    messageType = 'success',
  } = props

  return (
    <>
      <div className='row ml-1 mb-2' id='frontDeskAlerts1'>
        <CustomAlert
          visible={message}
          message={message}
          type={messageType || 'success'}
          showIcon={true}
          classNames='mb-3'
        />
      </div>
      <div className='table-wrp'>
        <Table
          columns={columns}
          dataSource={dataSource}
          scroll={{ y: 480 }}
          loading={loading}
          rowKey='id'
          pagination={false}
          className='customAntdTable'
        />

        {TableFooter}
      </div>
    </>
  )
}

CustomAntdTable.defaultProps = {
  columns: [],
  dataSource: [],
  scroll: {}, //{ y: 400 },
  loading: false,
  pagination: false,
  previous: () => {
    console.log('Add Previous Function')
  },
  next: () => {
    console.log('Add Previous Function')
  },
  disableNext: null,
  disablePrev: null,
}

export default CustomAntdTable
