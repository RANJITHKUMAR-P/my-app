import React, { useContext, useEffect, useState } from 'react'
import { Button, Select } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { getImage } from '../../../../config/utils'
import CustomAntdTable from '../../../Common/CustomAntdTable'
import { db } from '../../../../config/firebase'
import { Collections } from '../../../../config/constants'
import { ReportState2 } from '../model'

const { Option } = Select

export default function RequestSummaryReport2() {
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
    updateFilteredName,
    FetchData,
  } = useContext(ReportState2)

  const [filteredName, setFilteredName] = useState(localStorage.getItem('filteredName') || '')
  const [allHotelNames, setAllHotelNames] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getAndDisplayHotelInfo = async () => {
      try {
        const hotelsSnapshot = await db.collection(Collections.HOTELS).get()

        if (hotelsSnapshot.empty) {
          console.log('No hotels found')
          return
        }

        const hotelNames = []
        hotelsSnapshot.forEach(doc => {
          const hotel = { id: doc.id, ...doc.data() }
          hotelNames.push(hotel.hotelName)
        })

        setAllHotelNames(hotelNames)
      } catch (error) {
        console.error('Error fetching hotel information:', error)
      }
    }

    getAndDisplayHotelInfo()
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('filteredName')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const handleSelectChange = async value => {
    setLoading(true)
    setFilteredName(value)
    try {
      const hotelInfo = await fetchHotelData(value)
      updateFilteredName(value, hotelInfo)
      await FetchData({ hotelId: hotelInfo.hotelIdFromFirebase })
      localStorage.setItem('filteredName', value)
    } catch (error) {
      console.error('Error handling select change:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHotelData = async value => {
    try {
      const hotelSnapshot = await db
        .collection(Collections.HOTELS)
        .where('hotelName', '==', value)
        .get()

      if (hotelSnapshot.empty) {
        console.log('No matching hotel found')
        return null
      }

      let hotelInfo
      hotelSnapshot.forEach(doc => {
        hotelInfo = doc.data()
        hotelInfo.hotelIdFromFirebase = doc.id
      })

      return hotelInfo
    } catch (error) {
      console.error('Error fetching hotel information:', error)
      throw error
    }
  }

  const fileName = 'Request Summary Report'

  return (
    <div className='col-12 col-xl-12' id='rptSummary'>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='searchboxReport'>
                <Select
                  showSearch
                  bordered
                  placeholder={'Select a Hotel'}
                  value={filteredName || undefined}
                  onChange={handleSelectChange}
                  style={{ width: 350, borderRadius: '10px' }} // Add borderRadius here
                >
                  {allHotelNames.map((name, index) => (
                    <Option key={index} value={name}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </div>
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
                  <img src={getImage('images/filter.svg')} alt='filter' />
                </Button>
              </div>
              <div className='col-6 col-md-auto ' id='rptSummaryreset'>
                <Button
                  title='Reset Filter'
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilter}
                >
                  <img src={getImage('images/clearicon.svg')} alt='reset' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className='table-wrp' id='rptSummarytable'>
          <CustomAntdTable
            columns={serviceRequestColumns}
            loading={fetchingData || showLoader}
            previous={GoPrev}
            next={GoNext}
            disableNext={fetchingData || (data[page + 1]?.length ?? 0) === 0}
            disablePrev={fetchingData || page === 1}
          />
        </div>
      ) : (
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
      )}
    </div>
  )
}
