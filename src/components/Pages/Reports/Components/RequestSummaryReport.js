import React, { useContext } from 'react'
import { Button } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { ReportState } from '../model'
import { getImage } from '../../../../config/utils'
import CustomAntdTable from '../../../Common/CustomAntdTable'

export default function RequestSummaryReport() {
  const {
    serviceRequestColumns,
    translateTextI18N,
    resetFilter,
    data,
    page,
    fetchingData,
    showLoader,
    GoPrev,
    GoNext,
    pdfClicked,
    graphClicked,
    excelClicked,
    exportPdfLoading,
    exportExcelLoading,
    exportGraphLoading,
    openFilterModal,
  } = useContext(ReportState)

  const fileName = 'Request Summary Report'

  return (
    <div className='col-12 col-xl-12' id='rptSummary'>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='col-6 col-md-auto' id='rptSummaryexcel'>
                <Button
                  className='cmnBtn'
                  icon={<FileExcelOutlined />}
                  loading={exportExcelLoading}
                  onClick={() => {
                    excelClicked({ fileName, type: 1 })
                  }}
                >
                  {translateTextI18N('Export Excel')}
                </Button>
              </div>
              <div className='col-6 col-md-auto' id='rptSummarypdf'>
                <Button
                  className='cmnBtn'
                  icon={<FilePdfOutlined />}
                  loading={exportPdfLoading}
                  onClick={() => {
                    pdfClicked({ fileName, type: 1 })
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
                    graphClicked({ fileName, type: 1 })
                  }}
                >
                  {translateTextI18N('Export Graph')}
                </Button>
              </div>
              <div className='col-6 col-md-auto ' id='rptSummaryFilter'>
                <Button
                  title='Filter Report'
                  type='primary'
                  className='adduserbtn'
                  onClick={openFilterModal}
                >
                  <img src={getImage('images/filter.svg')} alt='filter'></img>
                </Button>
              </div>
              <div className='col-6 col-md-auto ' id='rptSummaryreset'>
                <Button
                  title='Reset Filter'
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilter}
                >
                  <img src={getImage('images/clearicon.svg')} alt='reset'></img>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='table-wrp' id='rptSummarytable'>
        <CustomAntdTable
          columns={serviceRequestColumns}
          dataSource={data[page]}
          loading={fetchingData || showLoader}
          previous={GoPrev}
          next={GoNext}
          disableNext={fetchingData || (data[page + 1]?.length ?? 0) === 0}
          disablePrev={fetchingData || page === 1}
        />
      </div>
    </div>
  )
}
