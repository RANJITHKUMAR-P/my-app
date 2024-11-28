import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useReducer,
  } from 'react'
  import { useSelector, useDispatch } from 'react-redux'
  import { useParams } from 'react-router-dom'
  import moment from 'moment'
  import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
  import {
    GetActionsHelper,
    GetFetchDataOptions,
    GetInitialState,
    reducer,
  } from '../../../config/archivePaginationHelper'
  import {
    AssignedToLabelValue,
    CompletedLabel,
    DeferredLabel,
    ManagementDeptObject,
    ResponseTimeLabelValue,
    VarianceLabelValue,
    changeRoomValue,
    departmentFilterLabel,
    departmentWithOutServiceObj,
    inProgressLabel,
    pendingLable,
    serviceFilterLabel,
    statusFilterLabel,
    upgradeRoomValue,
    variancesArr,
    activeInactiveStatusList,
    ReportGroupByValue,
    defaultReportGroupingParameters,
    SortBy,
    SortOrder,
  } from '../../../config/constants'
  import {
    getRequestReport,
    getRequestReportExport,
    getUsageReport,
  } from '../../../services/requests'
  import {
    GetDepartmentIdsToExcludeFromServiceRequest,
    Sort,
    advancedSorting,
    deepCloneObject,
    formatDateAndTime,
    getCommonColumns,
    getJobStartEndImageAndName,
    getStaffcolumns,
    getStatiticsColumns,
    isFilterValueSelected,
    timeTakenCalculation,
  } from '../../../config/utils'
  import { FetchDepartments } from '../../../services/department'
  import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'
  // import StaffHelper from './Components/StaffHelper2'
  import StaffHelper from '../Reports/Components/StaffHelper'
  import SelectOption from '../../Common/SelectOption/SelectOption'
  import { pdf } from '@react-pdf/renderer'
  import { saveAs } from 'file-saver'
  import ExportPdf from '../Reports/Components/HelperComponents/ExportPdf'
  import { ExportExcel } from '../Reports/Components/HelperComponents/ExportExcel'
  import {
    chartConfigurations,
    generateChart,
    mergeCanvases,
  } from '../../../services/Reports'
  
  
  const dateFormatList = ['DD-MMM-YYYY']
  const INIT_DATE = [
    moment().subtract(1, 'months').startOf('month'),
    moment().subtract(1, 'months').endOf('month'),
  ]
  
  const GetDepartmentList1 = ({
    departments,
    setLocalDepartments,
    departmentIdsToExclude,
  }) => {
    let departmentsList = [...departments]
    departmentsList = Sort(departmentsList, 'name')
    departmentsList.unshift({ id: '0', name: 'All' })
    setLocalDepartments(
      departmentsList.filter(d => !departmentIdsToExclude.includes(d.id))
    )
  }
  
  export const serviceStatusList = [
    { id: 'all', name: 'All' },
    { id: pendingLable, name: pendingLable },
    { id: inProgressLabel, name: inProgressLabel },
    { id: CompletedLabel, name: CompletedLabel },
    { id: DeferredLabel, name: DeferredLabel },
  ]
  
  export const ReportState2 = createContext()
  
  export const ReportStateProvider2 = props => {
    const dispatch = useDispatch()
    const [translateTextI18N] = useCustomI18NTranslatorHook()
    const params = useParams()
    const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
      useReducer(reducer, GetInitialState())
    const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
      GetActionsHelper(localDispatch)
    const [filteredName, setFilteredName] = useState('')
    const [hotelInfoFromSummaryReport, sethotelInfoFromSummaryReport] =
      useState(null)
  
    const updateFilteredName = (name, hotelNames) => {
      setFilteredName(name)
      sethotelInfoFromSummaryReport(hotelNames)
    }
    const {
      departmentsNew: departments,
      departmentAndServiceKeyToId,
      servicesNew,
      departmentAndServiceIdToInfo,
      // hotelInfo,
      staffListForLoggedManager,
      childIdToParentIds,
      staffHierarchyErrorLogs,
      isHotelAdmin,
      staffList,
      titleAndPermission,
    } = useSelector(state => state)
  
    const hotelInfo = {
      hotelId: hotelInfoFromSummaryReport?.hotelIdFromFirebase || '',
      // hotelId: 'd6zCaMxnPW77OAKjIcf3'
    }
  
    console.log(hotelInfo)
  
    const isManagementStaff =
      hotelInfo?.departmentId === ManagementDeptObject.id || false
    const repId = Number(params.reportId)
    const hotelId = hotelInfo?.hotelId
    const hotelName = hotelInfo?.hotelName
    const [localDepartmentList, setLocalDepartments] = useState([])
    const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
    const [filteredServices, setFilteredServices] = useState(serviceFilterLabel)
    const [filteredDept, setFilteredDept] = useState(departmentFilterLabel)
    const [departmentIdsToExclude, setDepartmentIdsToExclude] = useState([])
    const [showLoader, setShowLoader] = useState(false)
    const [reportName, setReportName] = useState('Request Summary')
    const [staffData, setStaffData] = useState([])
    const [filteredUser, setFilteredUser] = useState([])
    const [staff, setStaff] = useState(AssignedToLabelValue)
    const [varianceValue, setVarianceValue] = useState(0)
    const [variances, setVariances] = useState(VarianceLabelValue)
    const [filteredStartDate, setFilteredStartDate] = useState(null)
    const [filteredEndDate, setFilteredEndDate] = useState(null)
  
    const [exportPdfLoading, setExportPdfLoading] = useState(false)
    const [exportGraphLoading, setExportGraphLoading] = useState(false)
    const [exportExcelLoading, setExportExcelLoading] = useState(false)
    const [staffLoading, setStaffLoading] = useState(false)
    const [groupBy, setGroupBy] = useState(ReportGroupByValue)
    const [visibleCalender, setVisibleCalender] = useState(false)
    const [picker, setPicker] = useState('none')
    const [usageReport, setUsageReport] = useState({})
    const [usageReportLoading, setUsageReportLoading] = useState(false)
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [sortByVal, setSortByVal] = useState(SortBy)
    const [sortOrderVal, setSortOrderVal] = useState(SortOrder)
  
    const sortByArr = [
      {
        value: 'department',
        label: 'Department',
      },
      {
        value: 'requestedTime',
        label: 'Requested Date',
      },
    ]
  
    const sortOrderArr = [
      {
        value: 'asc',
        label: 'Ascending',
      },
      {
        value: 'desc',
        label: 'Descending',
      },
    ]
  
    useEffect(() => {
      if (repId === 1) {
        setReportName('Request Summary')
      } else if (repId === 2) {
        setReportName('Request Response')
      } else if (repId === 3) {
        setReportName('Request Status')
      } else if (repId === 4) {
        setReportName('Scheduled & Planned Task')
      } else if (repId === 5) {
        setReportName('Staff Report')
      } else if (repId === 6) {
        setReportName('Usage Report')
      }
      // eslint-disable-next-line
    }, [params.reportId])
  
    useEffect(() => {
      if (isFilterValueSelected(groupBy, ReportGroupByValue)) {
        setVisibleCalender(true)
        setFilteredStartDate(null)
        setFilteredEndDate(null)
        if (groupBy === 'date_range') {
          setPicker('none')
        } else if (groupBy === 'week_range') {
          setPicker('week')
        } else if (groupBy === 'month_range') {
          setPicker('month')
        }
      }
    }, [groupBy])
  
    const filterUsers = useCallback(async () => {
      if (staffList) {
        const formattedUser = await staffList.map((item, i) => ({
          id: item.id,
          name: item.name,
        }))
        const sortedUser = Sort(formattedUser, 'name')
        sortedUser.unshift({ id: 'all', name: 'All' })
        setFilteredUser(sortedUser)
      }
    }, [staffList])
  
    const FetchData = useCallback(
      async (
        filterData = {},
        archiveState = { data, page, fetchingData, snapshotDocs }
      ) => {
        const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)
        if (continueFetching) {
          const deptId =
            !isManagementStaff && !isHotelAdmin
              ? hotelInfo?.departmentId
              : filteredDept
          await getRequestReport({
            hotelId,
            SetFetching,
            SetData,
            page: archiveState.page,
            startAfter,
            fetchingData: archiveState.fetchingData,
            filteredDept: deptId,
            filteredServices,
            filteredStatus,
            filteredStartDate,
            staff,
            filteredEndDate,
            sortByVal,
            sortOrderVal,
            ...filterData,
          })
        }
      },
      // eslint-disable-next-line
      [
        SetData,
        SetFetching,
        data,
        fetchingData,
        filteredDept,
        filteredStartDate,
        filteredEndDate,
        filteredServices,
        filteredStatus,
        staff,
        hotelId,
        varianceValue,
        variances,
        page,
        snapshotDocs,
        sortByVal,
        sortOrderVal,
        hotelInfo,
      ]
    )
  
    async function getDataForRequestReport({ reportParams }) {
      const res = await getRequestReportExport({
        ...reportParams,
      })
      return res
    }
  
    const filterStaffUser = sortedUsers => {
      setStaffLoading(true)
      const data = StaffHelper.filterUsers(
        titleAndPermission,
        sortedUsers,
        {
          filteredDept,
          departmentFilterLabel,
          filteredStatus,
          statusFilterLabel,
        },
        translateTextI18N
      )
      if (data) {
        let curUser = data.currentfilteredUser
        if (curUser.length > 0) {
          const formattedUser = curUser.map((item, i) => ({
            ...item,
            managersString:
              item.managerNames && item.managerNames.length > 0
                ? item.managerNames.join(', ')
                : '',
          }))
          setStaffData(formattedUser)
        } else {
          setStaffData([])
        }
      } else {
        setStaffData([])
      }
      setStaffLoading(false)
    }
  
    const usageReportVal = useCallback(async () => {
      await getUsageReport({
        hotelId,
        setUsageReport,
        setUsageReportLoading,
        filteredStartDate,
        filteredEndDate,
        groupBy,
      })
    }, [hotelId, filteredStartDate, groupBy, filteredEndDate])
  
    useEffect(() => {
      return () => {
        resetFilter()
      }
      // eslint-disable-next-line
    }, [hotelId, params.reportId])
  
    useEffect(() => {
      usageReportVal()
    }, [usageReportVal])
  
    useEffect(() => {
      filterStaffUser(staffList)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffList])
  
    useEffect(() => {
      filterUsers()
    }, [filterUsers])
  
    useEffect(() => {
      FetchData({}, { data, page, fetchingData, snapshotDocs })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId, page])
  
    useEffect(() => {
      if (repId === 5) {
        //checking staff report
        let data = staffData
        if (isFilterValueSelected(filteredDept, departmentFilterLabel)) {
          if (data.length > 0) {
            data = data.filter(item => item.departmentId === filteredDept)
            setStaffData(data)
          }
        } else {
          filterStaffUser(staffList)
        }
        if (isFilterValueSelected(filteredStatus, statusFilterLabel)) {
          if (data.length > 0) {
            data = data.filter(item => item.status === filteredStatus)
            setStaffData(data)
          }
        } else {
          filterStaffUser(staffList)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredDept, filteredStatus])
  
    useEffect(() => {
      setDepartmentIdsToExclude(
        GetDepartmentIdsToExcludeFromServiceRequest(departmentAndServiceKeyToId)
      )
    }, [departmentAndServiceKeyToId])
  
    useEffect(() => {
      FetchDepartments(hotelId, departments, dispatch)
    }, [hotelId, departments, dispatch])
  
    useEffect(() => {
      GetDepartmentList1({
        departments,
        setLocalDepartments,
        departmentIdsToExclude,
      })
    }, [departmentIdsToExclude, departments])
  
    const serviceList = useMemo(() => {
      let tempServices = []
      let addChangeUpgrade = false
      if (
        isFilterValueSelected(filteredDept, departmentFilterLabel) &&
        filteredDept !== ManagementDeptObject.id
      ) {
        tempServices = deepCloneObject(servicesNew?.[filteredDept]) || []
  
        addChangeUpgrade =
          departmentAndServiceIdToInfo[filteredDept].name ===
          DepartmentAndServiceKeys.frontDesk.name
      } else {
        tempServices = deepCloneObject(Object.values(servicesNew).flat())
        addChangeUpgrade = true
      }
  
      if (addChangeUpgrade) {
        let fdservice = [changeRoomValue, upgradeRoomValue]
        fdservice.forEach(s => {
          tempServices.push({
            name: s,
            id: s,
          })
        })
      }
  
      if (hotelInfo?.departmentId) {
        tempServices =
          deepCloneObject(servicesNew?.[hotelInfo?.departmentId]) || []
      }
  
      tempServices = [...new Set(tempServices?.map(s => s.name))].map(name => ({
        name,
        value: name,
        id: name,
      }))
  
      tempServices = [...tempServices, departmentWithOutServiceObj]
  
      tempServices = Sort(tempServices, 'name')
  
      tempServices.unshift({ id: 'all', value: 'all', name: 'All' })
      return tempServices
      // eslint-disable-next-line
    }, [departmentAndServiceIdToInfo, filteredDept, servicesNew])
  
    function requestFromGenerator(row) {
      let title = ''
      const { isGuestRequest, fromDepartmentName } = row
      if (isGuestRequest) {
        if (fromDepartmentName) {
          title = fromDepartmentName
        } else {
          title = 'Guest'
        }
      } else {
        title = fromDepartmentName
      }
      return title
    }
  
    function requestedByGenerator(row) {
      let title = ''
      const { isGuestRequest, createdByName, guest } = row
      if (isGuestRequest) {
        title = createdByName ?? guest
      } else {
        title = createdByName
      }
      return title
    }
  
    function roomNumberFormatting(row) {
      let title = ''
      const { isGuestRequest, locationName, roomNumber } = row
      if (isGuestRequest) {
        title = roomNumber
      } else {
        title = locationName
      }
      return title
    }
  
    const resetFilter = useCallback(() => {
      const deptId =
        !isManagementStaff && !isHotelAdmin
          ? hotelInfo?.departmentId
          : filteredDept
  
      // Update the state with null values
      setFilteredStartDate(null)
      setFilteredEndDate(null)
  
      // Reset other filter values
      setFilteredDept(deptId)
      setFilteredServices(serviceFilterLabel)
      setFilteredStatus(statusFilterLabel)
      setStaff(AssignedToLabelValue)
      setVariances(ResponseTimeLabelValue)
      setSortByVal(SortBy)
      setSortOrderVal(SortOrder)
      setVarianceValue(0)
      setGroupBy(ReportGroupByValue)
      setVisibleCalender(false)
      setPicker('none')
  
      // Reset the data
      ResetData()
  
      // Fetch data with the new filter values
      FetchData(
        {
          filteredDept: deptId,
          filteredServices: serviceFilterLabel,
          filteredStatus: statusFilterLabel,
          filteredStartDate: null,
          filteredEndDate: null,
        },
        { ...GetInitialState() }
      )
    }, [FetchData, ResetData])
  
    function responseTimeCalculation(row) {
      let result = 0 + ' Hours ' + 0 + ' Minutes'
  
      const { startTime, requestedTime } = row
      const { seconds: start } = startTime
      const { seconds: requested } = requestedTime
      const startTimeStamp = start * 1000
      const requestedTimeStamp = requested * 1000
      let diffTimeStamp = startTimeStamp - requestedTimeStamp
  
      if (diffTimeStamp > 0) {
        let hoursDifference = Math.floor(diffTimeStamp / 1000 / 60 / 60)
  
        diffTimeStamp -= hoursDifference * 1000 * 60 * 60
        let minutesDifference = Math.floor(diffTimeStamp / 1000 / 60)
        result = hoursDifference + ' Hours ' + minutesDifference + ' Minutes'
      }
      return result
    }
  
    const requestFromColumn = {
      title: translateTextI18N('Request From'),
      dataIndex: '',
      width: 100,
      render: (text, row) => requestFromGenerator(row),
    }
  
    const requestedByColumn = {
      title: translateTextI18N('Requested By'),
      dataIndex: '',
      width: 100,
      render: (text, row) => requestedByGenerator(row),
    }
  
    let serviceRequestColumns = useMemo(() => {
      const {
        assignStaffCol,
        deptCol,
        guestCol,
        requestedTimeCol,
        roomNumLocCol,
        serviceCol,
        statusCol,
      } = getCommonColumns({
        translateTextI18N,
        hideAssignButton: true,
        dispatch,
      })
  
      let tmpCol = []
      guestCol.width = 100
  
      const deptColSorted = {
        ...deptCol,
        sorter: (a, b) => a.department.localeCompare(b.department),
      }
  
      const requestedTimeColSorted = {
        ...requestedTimeCol,
        sorter: (a, b) => a.requestedTime - b.requestedTime,
      }
      if (repId === 1) {
        tmpCol = [
          deptColSorted,
          serviceCol,
          guestCol,
          requestedTimeColSorted,
          requestFromColumn,
          requestedByColumn,
          roomNumLocCol,
          assignStaffCol,
          ...getJobStartEndImageAndName({ translateTextI18N }),
          ...getStatiticsColumns({ translateTextI18N }),
        ]
        const exculdeFields = [
          'jobStartByName',
          'jobEndByName',
          'beforeStartUploadImages',
          'afterCompleteUploadImages',
        ]
        tmpCol = tmpCol.filter(i => !exculdeFields.includes(i.dataIndex))
      } else if (repId === 2) {
        const responseTimeColumn = {
          title: translateTextI18N('Response Time'),
          dataIndex: 'responseTime',
          width: 100,
          render: (text, row) =>
            row.requestedTime && row?.startTime
              ? responseTimeCalculation(row)
              : '--',
        }
        tmpCol = [
          deptColSorted,
          serviceCol,
          guestCol,
          requestedTimeColSorted,
          requestFromColumn,
          requestedByColumn,
          roomNumLocCol,
          assignStaffCol,
          ...getJobStartEndImageAndName({ translateTextI18N }),
          ...getStatiticsColumns({ translateTextI18N }),
          responseTimeColumn,
        ]
  
        const exculdeFields = [
          'jobStartByName',
          'jobEndByName',
          'beforeStartUploadImages',
          'afterCompleteUploadImages',
          'completedTime',
          'requiredTime',
          'escalationTime',
          'variance',
          'timeTaken',
        ]
        tmpCol = tmpCol.filter(i => !exculdeFields.includes(i.dataIndex))
      } else if (repId === 3 || repId === 4) {
        const statusColumnUpdated = {
          ...statusCol,
          render: (text, row) => row.status,
        }
        tmpCol = [
          deptColSorted,
          serviceCol,
          guestCol,
          requestedTimeColSorted,
          requestFromColumn,
          requestedByColumn,
          roomNumLocCol,
          assignStaffCol,
          statusColumnUpdated,
        ]
      } else if (repId === 5) {
        tmpCol = [...getStaffcolumns({ translateTextI18N })]
      } else if (repId === 6) {
        tmpCol = [
          {
            title: translateTextI18N('Date'),
            dataIndex: 'dateShort',
            width: 300,
          },
          {
            title: translateTextI18N('Request Received'),
            dataIndex: 'totalRequestCount',
          },
          {
            title: translateTextI18N('Request Completed'),
            dataIndex: 'totalCompletedCount',
          },
          {
            title: translateTextI18N('Request Raised'),
            dataIndex: 'totalRaisedCount',
          },
        ]
      }
  
      return tmpCol
      // eslint-disable-next-line
    }, [
      FetchData,
      ResetData,
      UpdateData,
      childIdToParentIds,
      data,
      dispatch,
      filteredStatus,
      hotelId,
      page,
      staffHierarchyErrorLogs,
      staffListForLoggedManager,
      translateTextI18N,
      hotelInfo,
      params.reportId,
    ])
  
    const handlePaginationChange = useCallback(
      (setFunc, value, filterPropName, optionalFilter) => {
        setFunc(value)
        ResetData()
        FetchData(
          { [filterPropName]: value, ...optionalFilter },
          { ...GetInitialState() }
        )
      },
      [FetchData, ResetData]
    )
  
    const selectBefore = (
      <SelectOption
        value={variances}
        change={setVariances}
        list={variancesArr}
      ></SelectOption>
    )
  
    const onChangeVariance = value => {
      setVarianceValue(value)
    }
  
    const exportPdf = ({ fileName, column, data }) => {
      let newData = data
      if (!isManagementStaff && !isHotelAdmin) {
        const { deptData } = hotelInfo
        newData = data.filter(item => item.department === deptData?.name)
      }
      const profileData = {
        reportTitle: `${hotelName}-${fileName}`,
        hotelInfo: hotelInfo,
      }
      const blob = pdf(
        <ExportPdf column={column} data={newData} profileData={profileData} />
      ).toBlob()
      blob.then(res => {
        saveAs(res, `${profileData.reportTitle}`.pdf)
        setExportPdfLoading(false)
      })
    }
  
    const exportExcel = ({ fileName, type, data }) => {
      exportExcelGenerator({ fileName, type, data })
        .then(() => {
          console.log('Excel exported successfully.')
        })
        .catch(error => {
          console.error('Excel export failed:', error)
        })
    }
  
    const exportExcelGenerator = ({ fileName, type, data }) => {
      let customHeadings = []
      let newData = data
      if (!isManagementStaff && !isHotelAdmin) {
        const { deptData } = hotelInfo
        newData = data.filter(item => item.department === deptData?.name)
      }
      if (type === 1) {
        customHeadings = newData.map((item, i) => ({
          '#': i + 1,
          'Department': item.department,
          'Service Name': item.service,
          'Room / Location': roomNumberFormatting(item),
          'Requested Time': formatDateAndTime(item.requestedTime),
          'Request From': requestFromGenerator(item),
          'Reuested By': requestedByGenerator(item),
          'Assigned To': item.assignedToName,
          'Start Time': formatDateAndTime(item?.startTime),
          'Completed Time': formatDateAndTime(item?.completedTime),
          'Allocated Time': item?.requiredTime,
          'Time Taken': timeTakenCalculation(item),
          'Variance': item?.statistics?.newVarianceStr ?? '--',
        }))
      } else if (type === 2) {
        customHeadings = newData.map((item, i) => ({
          '#': i + 1,
          'Department': item.department,
          'Service Name': item.service,
          'Room / Location': roomNumberFormatting(item),
          'Requested Time': formatDateAndTime(item.requestedTime),
          'Request From': requestFromGenerator(item),
          'Reuested By': requestedByGenerator(item),
          'Assigned To': item.assignedToName,
          'Start Time': formatDateAndTime(item?.startTime),
          'Response Time':
            item.requestedTime && item?.startTime
              ? responseTimeCalculation(item)
              : '--',
        }))
      } else if (type === 3 || type === 4) {
        customHeadings = newData.map((item, i) => ({
          '#': i + 1,
          'Department': item.department,
          'Service Name': item.service,
          'Room / Location': roomNumberFormatting(item),
          'Requested Time': formatDateAndTime(item.requestedTime),
          'Request From': requestFromGenerator(item),
          'Reuested By': requestedByGenerator(item),
          'Assigned To': item.assignedToName,
          'Status': item?.status,
        }))
      } else if (type === 5) {
        customHeadings = newData.map((item, i) => ({
          '#': i + 1,
          'Name': item.name,
          'Title': item.title,
          'Department': item.department,
          'Manager':
            item?.managerNames && item?.managerNames?.length > 0
              ? item?.managerNames.join(', ')
              : null,
          'Email': item.email,
          'Contact No': item.contactNumber,
        }))
      } else if (type === 6) {
        customHeadings = newData.map((item, i) => ({
          '#': i + 1,
          'Department': item.department,
          'Date': item.dateShort,
          'Request Received': item.totalRequestCount,
          'Request Completed': item.totalCompletedCount,
          'Request Raised': item.totalRaisedCount,
        }))
      }
      return new Promise((resolve, reject) => {
        ExportExcel({
          data: customHeadings,
          fileName: `${hotelName}-${fileName}`,
        })
          .then(() => {
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  
    const pdfClicked = async ({ fileName, type }) => {
      if (type === 5) {
        //Staff Report
        exportPdf({ fileName, column: serviceRequestColumns, data: staffData })
      } else if (type === 6) {
        //Usage Report
        setExportPdfLoading(true)
        let repData = formatUsage(usageReport)
        let newCol = serviceRequestColumns
        newCol.unshift({
          title: translateTextI18N('Department'),
          dataIndex: 'department',
        })
        repData = advancedSorting(repData)
        exportPdf({ fileName, column: newCol, data: repData })
      } else {
        let reportParams = {
          hotelId,
          SetFetching: setExportPdfLoading,
          filteredDept,
          filteredServices,
          filteredStatus,
          filteredStartDate,
          filteredEndDate,
          staff,
          varianceValue,
          variances,
          sortByVal,
          sortOrderVal,
        }
        const res = await getDataForRequestReport({ reportParams })
        exportPdf({ fileName, column: serviceRequestColumns, data: res })
      }
    }
  
    const fetchGraphReportsData = async () => {
      let reportParams = {
        hotelId,
        SetFetching: setExportGraphLoading,
        filteredDept,
        filteredServices,
        filteredStatus,
        filteredStartDate,
        filteredEndDate,
        staff,
        varianceValue,
        variances,
        sortByVal,
        sortOrderVal,
      }
  
      // Fetch and return data asynchronously for Graph report
      return await getDataForRequestReport({ reportParams })
    }
  
    const graphClicked = async ({ fileName, type }) => {
      try {
        let data
        if (type === 6) {
          // Usage Report
          setExportGraphLoading(true)
          let repData = formatUsage(usageReport)
          repData = advancedSorting(repData)
          if (!isManagementStaff && !isHotelAdmin) {
            const { deptData } = hotelInfo
            repData = repData.filter(item => item.department === deptData?.name)
          }
          data = repData
        } else {
          data = await fetchGraphReportsData()
        }
  
        // Check if data is present, if not, assign an empty array
        if (!data) {
          data = []
        }
  
        await exportGraph({ fileName, type, data })
  
        if (type === 6) {
          setExportGraphLoading(false)
        }
      } catch (error) {
        // Handle errors appropriately
        console.error('An error occurred:', error)
        // You can set error state or show an error message to the user
      }
    }
  
    const exportGraph = async ({ fileName, type, data }) => {
      data = data || {}
      const config = chartConfigurations(data)[type]
      if (!config) return
      const {
        reportTitle,
        generateChartData,
        chartTitles,
        chartContent,
        chartTypes,
      } = config
      const chartCanvases = []
      try {
        if (type === 3 || type === 6) {
          const { chartData } = await generateChartData(data)
          const departmentNames = Object.keys(chartData)
          for (let index = 0; index < departmentNames.length; index++) {
            const departmentName = departmentNames[index]
            const { labels, dataValues, percentages, backgroundColors } =
              chartData[departmentName]
            const canvas = generateChart(
              'pie', // Since it's always a pie chart
              departmentName,
              labels,
              dataValues,
              backgroundColors,
              percentages
            )
            if (canvas) {
              await new Promise(resolve => {
                canvas.canvas.style.position = 'absolute'
                canvas.canvas.style.left = '-9999px'
                canvas.canvas.style.top = '-9999px'
                document.body.appendChild(canvas.canvas)
                canvas.chart.render()
                canvas.chart.options.animation.onComplete = resolve
              })
              chartCanvases.push({ canvas, title: departmentName })
            }
          }
        } else if (type === 4) {
          const { chartData } = await generateChartData(data)
  
          // Extract the object at index 0 of chartData
          const departmentObject = chartData[0]
  
          // Iterate over the keys (department names) of the departmentObject
          for (const departmentName of Object.keys(departmentObject)) {
            // Extract data for the current department
            const departmentData = departmentObject[departmentName]
            const departmentLabels = departmentData.labels
            const departmentDataValues = departmentData.dataValues
            const departmentBackgroundColors = departmentData.backgroundColors
  
            // Generate the chart for the department
            const canvas = generateChart(
              'bar',
              departmentName,
              departmentLabels,
              departmentDataValues,
              departmentBackgroundColors,
              []
            )
  
            // Append the canvas to the DOM and render the chart
            if (canvas) {
              await new Promise(resolve => {
                canvas.canvas.style.position = 'absolute'
                canvas.canvas.style.left = '-9999px'
                canvas.canvas.style.top = '-9999px'
                document.body.appendChild(canvas.canvas)
                canvas.chart.render()
                chartCanvases.push({ canvas, title: departmentName })
                canvas.chart.options.animation.onComplete = resolve
              })
            }
          }
        } else {
          let hasPieChart = false
          for (let i = 0; i < chartTypes.length; i++) {
            const { chartData } = await generateChartData(data)
            const { labels, dataValues, percentages, backgroundColors } =
              chartData[i]
            if (
              (chartTypes[i] === 'pie' || chartTypes[i] === 'horizontalBar') &&
              labels.length > 1
            ) {
              if (chartTypes[i] === 'pie') {
                hasPieChart = true
              }
              const canvas = generateChart(
                chartTypes[i],
                chartTitles[i],
                labels,
                dataValues,
                backgroundColors,
                percentages
              )
  
              if (canvas) {
                await new Promise(resolve => {
                  canvas.canvas.style.position = 'absolute'
                  canvas.canvas.style.left = '-9999px'
                  canvas.canvas.style.top = '-9999px'
                  document.body.appendChild(canvas.canvas)
                  canvas.chart.render()
                  chartCanvases.push({ canvas, title: chartTitles[i] })
                  canvas.chart.options.animation.onComplete = resolve
                })
              }
            } else if (chartTypes[i] === 'bar') {
              // Generate multiple bar charts for each department
              Object.keys(chartData[i]).forEach(async department => {
                const departmentData = chartData[i][department]
                const departmentLabels = departmentData.labels
                const departmentDataValues = departmentData.dataValues
                const departmentBackgroundColors = departmentData.backgroundColors
  
                const canvas = generateChart(
                  'bar',
                  department,
                  departmentLabels,
                  departmentDataValues,
                  departmentBackgroundColors,
                  []
                )
                if (canvas) {
                  await new Promise(resolve => {
                    canvas.canvas.style.position = 'absolute'
                    canvas.canvas.style.left = '-9999px'
                    canvas.canvas.style.top = '-9999px'
                    document.body.appendChild(canvas.canvas)
                    canvas.chart.render()
                    chartCanvases.push({ canvas, title: department })
                    canvas.chart.options.animation.onComplete = resolve
                  })
                }
              })
            }
          }
          // This code is just a ontime fixe it needs to be removed when the chart content code is better written.
          if (!hasPieChart) {
            chartContent[0] = chartContent[1]
            chartContent.splice(1, 1)
          }
        }
  
        // Remove the canvas element from the document body
  
        chartCanvases.forEach(({ canvas }) => {
          if (canvas.chart.canvas) {
            document.body.removeChild(canvas.chart.canvas)
          }
        })
  
        // Check if filteredStartDate and filteredEndDate are present
        if (filteredStartDate && filteredEndDate) {
          const dateRangeString = `${filteredStartDate.format(
            'DD/MMM/YYYY'
          )} To ${filteredEndDate.format('DD/MMM/YYYY')}`
  
          // Call mergeCanvases with filteredStartDate and filteredEndDate
          await mergeCanvases(
            chartCanvases,
            reportTitle,
            chartContent,
            fileName,
            dateRangeString
          )
        } else {
          // Call mergeCanvases without filteredStartDate and filteredEndDate
          await mergeCanvases(
            chartCanvases,
            reportTitle,
            chartContent,
            fileName,
            null
          )
        }
      } catch (error) {
        console.error('Error exporting graph:', error)
      }
    }
  
    const excelClicked = async ({ fileName, type }) => {
      if (type === 5) {
        exportExcel({ fileName, type, data: staffData })
      } else if (type === 6) {
        let repData = formatUsage(usageReport)
        repData = advancedSorting(repData)
        exportExcel({ fileName, type, data: repData })
      } else {
        let reportParams = {
          hotelId,
          SetFetching: setExportExcelLoading,
          filteredDept,
          filteredServices,
          filteredStatus,
          filteredStartDate,
          filteredEndDate,
          staff,
          varianceValue,
          variances,
          sortByVal,
          sortOrderVal,
        }
        const data = await getDataForRequestReport({ reportParams })
        exportExcel({ fileName, type, data })
      }
    }
  
    function formatUsage(data) {
      let res = []
      Object.keys(data).forEach(item => {
        data[item].forEach(element => {
          res.push({
            ...element,
            department: item,
          })
        })
      })
  
      res = Sort(res, 'department')
      return res
    }
  
    function openFilterModal() {
      setFilterModalOpen(!filterModalOpen)
    }
  
    function closeFilterModal() {
      setFilterModalOpen(!filterModalOpen)
    }
  
    async function filterSubmit() {
      const deptId =
        !isManagementStaff && !isHotelAdmin
          ? hotelInfo?.departmentId
          : filteredDept
      FetchData({
        filteredDept: deptId,
        filteredServices,
        filteredStatus,
        filteredStartDate,
        staff,
        filteredEndDate,
        sortByVal,
        sortOrderVal,
      })
      closeFilterModal()
    }
  
    return (
      <ReportState2.Provider
        value={{
          ...{
            serviceRequestColumns,
            reportName,
            dateFormatList,
            isHotelAdmin,
            translateTextI18N,
            localDepartmentList,
            filteredDept,
            setFilteredDept,
            handlePaginationChange,
            serviceStatusList,
            staff,
            setStaff,
            filteredUser,
            selectBefore,
            onChangeVariance,
            varianceValue,
            setVarianceValue,
            variances,
            setVariances,
            resetFilter,
            data,
            page,
            fetchingData,
            showLoader,
            GoPrev,
            GoNext,
            filteredServices,
            setFilteredServices,
            serviceList,
            filteredStatus,
            setFilteredStatus,
            filterUsers,
            filteredStartDate,
            setFilteredStartDate,
            filteredEndDate,
            setFilteredEndDate,
            pdfClicked,
            graphClicked,
            excelClicked,
            exportPdfLoading,
            exportExcelLoading,
            exportGraphLoading,
            staffData,
            activeInactiveStatusList,
            staffLoading,
            groupBy,
            visibleCalender,
            defaultReportGroupingParameters,
            usageReport,
            picker,
            setGroupBy,
            usageReportLoading,
            setShowLoader,
            isManagementStaff,
            hotelInfo,
            filterModalOpen,
            setFilterModalOpen,
            openFilterModal,
            closeFilterModal,
            sortByVal,
            setSortByVal,
            sortOrderVal,
            setSortOrderVal,
            sortByArr,
            sortOrderArr,
            filterSubmit,
            INIT_DATE,
            updateFilteredName,
            hotelInfoFromSummaryReport,
            FetchData,
          },
        }}
      >
        {props.children}
      </ReportState2.Provider>
    )
  }