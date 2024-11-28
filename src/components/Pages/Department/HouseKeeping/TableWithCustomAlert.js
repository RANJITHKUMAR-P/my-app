import React from 'react'
import { Table } from 'antd'

import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import { TranslateColumnHeader } from '../../../../config/utils'
import { PaginationOptions } from '../../../../config/constants'

const TableWithCustomAlert = ({
  successMessageType = '',
  successMessage = '',
  columns = [],
  requests = [],
  showLoader,
}) => {
  return (
    <>
      <div className='row ml-1 mb-2' id='frontDeskAlerts1'>
        <CustomAlert
          visible={successMessage}
          message={successMessage}
          type={successMessageType}
          showIcon={true}
          classNames='mb-3'
        />
      </div>
      <div className='table-wrp'>
        <Table
          columns={TranslateColumnHeader(columns)}
          dataSource={requests}
          pagination={PaginationOptions}
          scroll={{ y: 385 }}
          loading={showLoader}
          rowKey='id'
        />
      </div>
    </>
  )
}

export default TableWithCustomAlert
