import React, { useContext } from 'react'
import { Table, Button, DatePicker, Skeleton } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import SelectOption from '../../../Common/SelectOption/SelectOption'
import { ReportState } from '../model'
import { getImage } from '../../../../config/utils'
import moment from 'moment'
import { ReportState2 } from '../../AllHotelsReports/model'
import { useSelector } from 'react-redux'

export default function UsageReport() {
  const { hotelInfo } = useSelector(state => state)
  const reportDept = hotelInfo?.reportDept

  const fileName = 'Usage Report'
  const {
    dateFormatList,
    translateTextI18N,
    resetFilter,
    current,
    setCurrent,
    usageReportLoading,
    usageReport,
    groupBy,
    setGroupBy,
    defaultReportGroupingParameters,
    visibleCalender,
    picker,
    filteredStartDate,
    handlePaginationChange,
    setFilteredStartDate,
    filteredEndDate,
    setFilteredEndDate,
    serviceRequestColumns,
    pdfClicked,
    excelClicked,
    graphClicked,
    exportPdfLoading,
    exportGraphLoading,
    isManagementStaff,
    isHotelAdmin,
    userInfo,
  } = useContext(reportDept ? ReportState2 : ReportState)

  const renderTable = () => {
    const usageExist = Object.keys(usageReport).length
    let filteredDeptData = {}
    if (usageExist > 0) {
      if (!isManagementStaff && !isHotelAdmin) {
        const { deptData } = userInfo
        if (Object.keys(deptData).length > 0) {
          filteredDeptData[deptData?.name] = usageReport[deptData?.name]
        }
        return Object.keys(filteredDeptData)
          .sort()
          .map(item => {
            return (
              <div className='table-wrp' key={item} id={item}>
                <Table
                  columns={serviceRequestColumns}
                  dataSource={filteredDeptData[item]}
                  loading={usageReportLoading}
                  title={() => item}
                  pagination={{
                    pageSize: 10,
                    current: current,
                    onChange: page => {
                      setCurrent(Number(page))
                    },
                    total: filteredDeptData[item]?.length,
                  }}
                  rowKey={record => record.dateLong}
                />
              </div>
            )
          })
      } else {
        return Object.keys(usageReport)
          .sort()
          .map(item => {
            return (
              <div className='table-wrp' key={item} id={item}>
                <Table
                  columns={serviceRequestColumns}
                  dataSource={usageReport[item]}
                  loading={usageReportLoading}
                  title={() => item}
                  pagination={{
                    pageSize: 10,
                    current: current,
                    onChange: page => {
                      setCurrent(Number(page))
                    },
                    total: usageReport[item].length,
                  }}
                  rowKey={record => record.dateLong}
                />
              </div>
            )
          })
      }
    } else {
      return (
        <div className='table-wrp'>
          <Table
            pagination={false}
            dataSource={[]}
            columns={[]}
            locale={{ emptyText: 'No data found' }}
          />
        </div>
      )
    }
  }

  return (
    <div className='col-12 col-xl-12' id='rptUsage'>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='col-2'>
                <div className='cmnSelect-form' id='rptUsagegroupby'>
                  <SelectOption
                    value={groupBy}
                    change={setGroupBy}
                    list={defaultReportGroupingParameters}
                  ></SelectOption>
                </div>
              </div>
              {visibleCalender ? (
                <>
                  <div className='col-2'>
                    <div className='cmnSelect-form' id='rptSummarydateRange1'>
                      <DatePicker
                        picker={picker}
                        format={dateFormatList}
                        placeholder={translateTextI18N('Start Date')}
                        value={filteredStartDate}
                        onChange={e => {
                          let c = e
                          if (picker === 'month') {
                            c = moment(c).startOf('month')
                          }
                          handlePaginationChange(
                            setFilteredStartDate,
                            c,
                            'filteredStartDate'
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-2'>
                    <div className='cmnSelect-form' id='rptSummarydateRange2'>
                      <DatePicker
                        picker={picker}
                        format={dateFormatList}
                        placeholder={translateTextI18N('End Date')}
                        value={filteredEndDate}
                        onChange={e => {
                          let c = e
                          if (picker === 'month') {
                            c = moment(c).endOf('month')
                          }
                          handlePaginationChange(
                            setFilteredEndDate,
                            c,
                            'filteredEndDate'
                          )
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className='col-6 col-md-auto ' id='rptUsagereset'>
                <Button
                  title='Reset Filter'
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilter}
                >
                  <img src={getImage('images/clearicon.svg')} alt='reset'></img>
                </Button>
              </div>
              <div className='col-4 col-md-auto' id='rptUsageexcel'>
                <Button
                  className='cmnBtn'
                  icon={<FileExcelOutlined />}
                  onClick={() => {
                    excelClicked({ fileName, type: 6 })
                  }}
                  disabled={usageReportLoading}
                >
                  {translateTextI18N('Export Excel')}
                </Button>
              </div>
              <div className='col-4 col-md-auto' id='rptUsagepdf'>
                <Button
                  className='cmnBtn'
                  icon={<FilePdfOutlined />}
                  loading={exportPdfLoading}
                  disabled={usageReportLoading}
                  onClick={() => {
                    pdfClicked({ fileName, type: 6 })
                  }}
                >
                  {translateTextI18N('Export PDF')}
                </Button>
              </div>
              <div className='col-6 col-md-auto ' id='rptRequestResponseGraph'>
                <Button
                  className='cmnBtn'
                  icon={<FilePdfOutlined />}
                  loading={exportGraphLoading}
                  onClick={() => {
                    graphClicked({ fileName, type: 6 })
                  }}
                >
                  {translateTextI18N('Export Graph')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Skeleton loading={usageReportLoading} active>
        {renderTable()}
      </Skeleton>
    </div>
  )
}
