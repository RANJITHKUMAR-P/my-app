import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  checkCyclicRecursion,
  getIdToInfo,
  getImage,
  SelectDrops,
  Sort,
  Ternary,
} from '../../../config/utils'
import { closeCommonModal, viewResponseModal } from '../../../services/requests'
import { assignRequestToStaff } from '../../../services/user'
import { ManagementDeptObject, normalValue } from '../../../config/constants'

import { Button, Form, Modal, Steps, Tag } from 'antd'
const { Step } = Steps

function AssignTask() {
  const [staffHierarchyErrorLogs, setStaffHierarchyErrorLogs] = useState({})
  const dispatch = useDispatch()
  const {
    commonModalData,
    isHotelAdmin,
    staffList,
    staffListForLoggedManager,
    userInfo,
  } = useSelector(state => state)
  const isManagementStaff =
    userInfo?.departmentId === ManagementDeptObject.id || false
  const [selectedStaff, setSelectedStaff] = useState({
    id: '',
    name: '',
  })
  const { data, status } = commonModalData

  const reqData = data.data
  const {
    departmentId,
    department,
    service,
    requestType,
    createdByName = '',
    roomNumber,
    isGuestRequest,
  } = reqData
  const [loader, setLoader] = useState(false)

  async function assignTask() {
    setLoader(true)
    const updatedReqData = {
      status: 'Pending',
      assignedToId: selectedStaff.id,
      assignedToName: Ternary(
        selectedStaff.name === 'Assign To MySelf',
        userInfo.name,
        selectedStaff.name
      ),
      assignedById: userInfo.id || userInfo.userId,
      assignedByName: userInfo.name,
      updatedAt: new Date(),
    }
    const { success, message } = await assignRequestToStaff(
      reqData,
      updatedReqData
    )

    if (success) {
      closeCommonModal(dispatch)
    }

    setTimeout(() => {
      viewResponseModal({
        dispatch,
        data: { status: success, message },
      })
    }, 10)
    setLoader(false)
  }

  function setUserListingData() {
    let userIdToInfo = {}
    let userIdToManagers = {}
    let managersToStaff = {}
    for (const objUser of staffListForLoggedManager) {
      const { userId, managerIds } = objUser
      userIdToInfo[userId] = objUser
      userIdToManagers[userId] = managerIds
    }

    for (const managers of Object.values(userIdToManagers)) {
      buildManagerToStaff(managers)
    }

    function buildManagerToStaff(managers) {
      for (const mId of managers) {
        let childrens = Object.values(userIdToInfo)
          .filter(i => i?.managerIds?.includes(mId))
          .map(i => i.userId)

        managersToStaff[mId] = childrens
      }
    }

    return { userIdToInfo, userIdToManagers, managersToStaff }
  }

  function setStaffListHierarchyWise() {
    let { userIdToInfo } = setUserListingData()
    let error
    let hierarchy = []
    function recursion(root) {
      let childrens = Object.values(userIdToInfo).filter(i =>
        i?.managerIds?.includes(root)
      )

      if (!childrens.length) return hierarchy

      for (const objUser of childrens) {
        const { userId } = objUser
        hierarchy.push(objUser)
        recursion(userId)
      }

      return hierarchy
    }

    recursion(userInfo.userId)
    return { hierarchy, error }
  }

  const staffListMemo = useMemo(() => {
    let tmpStaff = staffListForLoggedManager.filter(i =>
      i?.managerIds?.includes(userInfo.userId)
    )
    if (isHotelAdmin || isManagementStaff) {
      // Hotel Admin assign the request  which is related to the same dept staff  only
      tmpStaff = staffList?.filter(s => s.departmentId === departmentId)
    }

    const { userIdToInfo, managerIdToStaffIds } = getIdToInfo(tmpStaff)

    const isCyclicGraph = checkCyclicRecursion({
      managerIdToStaffIds,
      userIdToInfo,
    })

    if (isCyclicGraph.errorLog.length) {
      setStaffHierarchyErrorLogs(isCyclicGraph)
    } else {
      setStaffHierarchyErrorLogs({})
    }

    for (const staff of setStaffListHierarchyWise().hierarchy) {
      const find = tmpStaff.find(s => s.userId === staff.userId)
      if (find) continue
      tmpStaff.push(staff)
    }

    tmpStaff = tmpStaff.map(s => ({ name: s.name, value: s.userId }))
    tmpStaff = Sort(tmpStaff, 'name')

    if (!isHotelAdmin && !isManagementStaff) {
      // If Dept Staff logged in then Self Assgin will be included in the stafflist
      const selfAssignId = userInfo.id || userInfo.userId
      tmpStaff.unshift({ value: selfAssignId, name: 'Assign To MySelf' })
    }

    return tmpStaff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffListForLoggedManager, staffList])

  return (
    <Modal
      className='cmnModal assignModal'
      title='Assign Task'
      open={status}
      visible={status}
      footer={null}
      onCancel={function () {
        closeCommonModal(dispatch)
      }}
    >
      <ul className='list-unstyled'>
        <li>
          <figure>
            <img src={getImage('images/assign-icon2.svg')} alt=''></img>
          </figure>
          <h4>
            Department <em>{department}</em>
          </h4>
        </li>
        <li>
          <figure>
            <img src={getImage('images/assign-icon1.svg')} alt=''></img>
          </figure>
          <h4>
            Request <em>{service}</em>
          </h4>
          <Tag
            color={Ternary(
              requestType.toLowerCase() === normalValue.toLowerCase(),
              '#059e4d',
              '#f44336'
            )}
          >
            {requestType}
          </Tag>
        </li>
        {isGuestRequest && (
          <li>
            <figure>
              <img src={getImage('images/roomno.svg')} alt=''></img>
            </figure>
            <h4>
              Room Number <em>{roomNumber}</em>
            </h4>
          </li>
        )}
        {!isGuestRequest && (
          <li>
            <figure>
              <img src={getImage('images/reportedby.svg')} alt=''></img>
            </figure>
            <h4>
              Reported By <em>{createdByName}</em>
            </h4>
          </li>
        )}
      </ul>

      <Form layout='vertical' onFinish={assignTask} validateTrigger>
        <div className='form-group cmn-input'>
          <Form.Item label='Select Assignee' required>
            <SelectDrops
              list={staffListMemo}
              nameKey='name'
              valueKey='value'
              value={selectedStaff.id}
              onChange={function (...args) {
                let { value, children } = args[1]
                setSelectedStaff({ id: value, name: children })
              }}
              showSearch={true}
            />
          </Form.Item>
          {staffHierarchyErrorLogs?.errorLog?.length && (
            <>
              <h6 className='error-heading'>
                Error - Please contact admin team
              </h6>
              {staffHierarchyErrorLogs.errorLog.map(item => (
                <div className='customSteps' key={item}>
                  <Steps progressDot direction='vertical'>
                    <Step title={<h6 className='error-text'>{item}</h6>} />
                  </Steps>
                </div>
              ))}
            </>
          )}
        </div>

        <div className='modalFooter mt-4'>
          <Button
            className='grayBtn'
            onClick={function (e) {
              e.preventDefault()
              closeCommonModal(dispatch)
            }}
            disabled={loader}
          >
            Cancel
          </Button>
          <Button
            htmlType='submit'
            className='blueBtn ml-3 ml-lg-4'
            disabled={!selectedStaff.id || !selectedStaff.name || loader}
          >
            Assign
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AssignTask
