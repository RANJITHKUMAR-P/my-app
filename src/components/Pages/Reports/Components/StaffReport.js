import React, { useContext } from 'react'
import { Table, Select, Button } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { Option, serviceFilterLabel } from '../../../../config/constants'
import { ReportState } from '../model'
import { getImage } from '../../../../config/utils'

export default function StaffReport() {
  const fileName = 'Staff User List'
  const {
    serviceRequestColumns,
    translateTextI18N,
    setFilteredDept,
    filteredStatus,
    setFilteredStatus,
    resetFilter,
    staffLoading,
    staffData,
    isHotelAdmin,
    activeInactiveStatusList,
    filteredDept,
    handlePaginationChange,
    localDepartmentList,
    pdfClicked,
    excelClicked,
    isManagementStaff,
  } = useContext(ReportState)

  return (
    <div className='col-12 col-xl-12' id='rptStaff'>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              {isHotelAdmin || isManagementStaff ? (
                <div className='col-2'>
                  <div className='cmnSelect-form' id='rptStafffilteredDeptName'>
                    <Select
                      value={translateTextI18N(filteredDept)}
                      id={'filteredDept'}
                      onChange={e => {
                        handlePaginationChange(
                          setFilteredDept,
                          e,
                          'filteredDept',
                          {
                            filteredServices: serviceFilterLabel,
                          }
                        )
                      }}
                    >
                      {localDepartmentList.length &&
                        localDepartmentList.map((dept, idx) => (
                          <Option value={dept.id} key={dept.name} id={idx}>
                            {translateTextI18N(dept.name)}
                          </Option>
                        ))}
                    </Select>
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div className='col-2'>
                <div className='cmnSelect-form' id='drpStatus'>
                  <Select
                    value={translateTextI18N(filteredStatus)}
                    onChange={e => setFilteredStatus(e)}
                  >
                    {activeInactiveStatusList.map(st => (
                      <Option value={st.id} key={st.id}>
                        {translateTextI18N(st.name)}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className='col-6 col-md-auto ' id='rptStaffreset'>
                <Button
                  title='Reset Filter'
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilter}
                >
                  <img src={getImage('images/clearicon.svg')} alt='reset'></img>
                </Button>
              </div>
              <div className='col-4 col-md-auto' id='rptStaffexcel'>
                <Button
                  className='cmnBtn'
                  icon={<FileExcelOutlined />}
                  onClick={() => {
                    excelClicked({ fileName, type: 5 })
                  }}
                >
                  {translateTextI18N('Export Excel')}
                </Button>
              </div>
              <div className='col-4 col-md-auto' id='rptStaffpdf'>
                <Button
                  className='cmnBtn'
                  icon={<FilePdfOutlined />}
                  onClick={() => {
                    pdfClicked({ fileName, type: 5 })
                  }}
                >
                  {translateTextI18N('Export PDF')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='table-wrp' id='rptStafftable'>
        <Table
          columns={serviceRequestColumns}
          dataSource={staffData}
          loading={staffLoading}
          pagination={{
            pageSize: 10,
            total: staffData.length,
          }}
          rowKey='id'
        />
      </div>
    </div>
  )
}
