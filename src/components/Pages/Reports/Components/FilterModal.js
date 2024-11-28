import React, { useContext } from 'react'
import { Select, Modal, Button, Form, DatePicker } from 'antd'
import { Option, serviceFilterLabel } from '../../../../config/constants'
import SelectOption from '../../../Common/SelectOption/SelectOption'
import { ReportState } from '../model'
import { useSelector } from 'react-redux'
import { ReportState2 } from '../../AllHotelsReports/model'

export default function FilterModal() {
  const { hotelInfo } = useSelector(state => state)
  const reportDept = hotelInfo?.reportDept

  const {
    setFilteredStartDate,
    setFilteredEndDate,
    filteredStartDate,
    filteredEndDate,
    dateFormatList,
    isHotelAdmin,
    translateTextI18N,
    filteredDept,
    localDepartmentList,
    serviceStatusList,
    setFilteredDept,
    filteredServices,
    setFilteredServices,
    serviceList,
    filteredStatus,
    setFilteredStatus,
    staff,
    setStaff,
    filteredUser,
    showLoader,
    isManagementStaff,
    filterModalOpen,
    setFilterModalOpen,
    closeFilterModal,
    sortByVal,
    setSortByVal,
    sortOrderVal,
    locationVal,
    setSortOrderVal,
    setLocationVal,
    filteredLocations,
    sortByArr,
    sortOrderArr,
    filterSubmit,
  } = useContext(reportDept ? ReportState2 : ReportState)

  function cancelModal() {
    setFilterModalOpen(!filterModalOpen)
  }

  return (
    <Modal
      title={translateTextI18N('Filter Report')}
      visible={filterModalOpen}
      onCancel={closeFilterModal}
      className='cmnModal'
      footer={null}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={filterSubmit}>
        <div className='row'>
          <div className='col-12 col-xl-12'>
            <div className='tablefilter-wrp'>
              <div className='form-row'>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSummarydateRange1'>
                    <DatePicker
                      format={dateFormatList}
                      placeholder={translateTextI18N('Start Date')}
                      value={filteredStartDate}
                      onChange={e => setFilteredStartDate(e)}
                    />
                  </div>
                </div>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSummarydateRange2'>
                    <DatePicker
                      format={dateFormatList}
                      placeholder={translateTextI18N('End Date')}
                      value={filteredEndDate}
                      onChange={e => setFilteredEndDate(e)}
                    />
                  </div>
                </div>
                {isHotelAdmin || isManagementStaff ? (
                  <div className='col-4 col-md'>
                    <div
                      className='cmnSelect-form'
                      id='rptSummaryfilteredDeptName'
                    >
                      <Select 
                        value={translateTextI18N(filteredDept)}
                        id={'filteredDept'}
                        onChange={e => {
                          setFilteredServices(serviceFilterLabel)
                          setFilteredDept(e)
                        }}
                        showSearch
                        placeholder='Select a service' // Optional placeholder
                        filterOption={
                          (input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase()) // Filter options based on input
                        }
                        optionFilterProp='children' // Ensure search works based on the option text
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

                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSummaryserviceList'>
                    <div className='serviceListcss'>
                      <Select
                        value={translateTextI18N(filteredServices)}
                        id='filteredServices'
                        onChange={e => setFilteredServices(e)}
                        showSearch // Enable search functionality
                        placeholder='Select a service' // Optional placeholder
                        filterOption={
                          (input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase()) // Filter options based on input
                        }
                        optionFilterProp='children' // Ensure search works based on the option text
                      >
                        {serviceList.length &&
                          serviceList.map((service, idx) => (
                            <Option
                              value={service.id}
                              key={service.name}
                              id={idx}
                            >
                              {translateTextI18N(service.name)}
                            </Option>
                          ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12 col-xl-12'>
            <div className='tablefilter-wrp'>
              <div className='form-row'>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSummaryfilteredStatus'>
                    <Select
                      value={translateTextI18N(filteredStatus)}
                      onChange={e => {
                        setFilteredStatus(e)
                      }}
                    >
                      {serviceStatusList.map(p => (
                        <Option value={p.id} key={p.id} id={p.id}>
                          {translateTextI18N(p.name)}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSummarystaff'>
                    <Select
                      value={translateTextI18N(staff)}
                      onChange={e => setStaff(e)}
                    >
                      {filteredUser.map(user => (
                        <Option value={user.name} key={user.id} id={user.id}>
                          {translateTextI18N(user.name)}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSortBy'>
                    <Select
                      value={translateTextI18N(sortByVal)}
                      onChange={(e, ...args) => {
                        setSortByVal(e)
                      }}
                    >
                      {sortByArr.map(p => (
                        <Option value={p.value} key={p.value} id={p.value}>
                          {translateTextI18N(p.label)}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptSortOrder'>
                    <Select
                      value={translateTextI18N(sortOrderVal)}
                      onChange={(e, ...args) => {
                        setSortOrderVal(e)
                      }}
                    >
                      {sortOrderArr.map(p => (
                        <Option value={p.value} key={p.value} id={p.value}>
                          {translateTextI18N(p.label)}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form' id='rptLocations'>
                    <Select
                      showSearch
                      value={translateTextI18N(locationVal)}
                      onChange={e => {
                        setLocationVal(e)
                      }}
                    >
                      {filteredLocations
                        .map(locationName => (
                          <Option key={locationName} value={locationName}>
                            {translateTextI18N(locationName)}
                          </Option>
                        ))
                        .sort((a, b) => {
                          const valA = translateTextI18N(a.props.value)
                          const valB = translateTextI18N(b.props.value)

                          // Check if both values start with numbers
                          const numA = parseFloat(valA)
                          const numB = parseFloat(valB)

                          if (!isNaN(numA) && !isNaN(numB)) {
                            return numA - numB // Sort numbers in ascending order
                          }

                          // If one value is a number and other isn't, number comes first
                          if (!isNaN(numA)) return -1
                          if (!isNaN(numB)) return 1

                          // If neither are numbers, sort alphabetically
                          return valA.localeCompare(valB)
                        })}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button
            id='btnGray'
            className='grayBtn'
            key='back'
            onClick={cancelModal}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            htmlType='submit'
            loading={showLoader}
            id='btnSubmit'
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
