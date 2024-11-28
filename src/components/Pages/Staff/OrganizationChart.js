import OrgTree from 'react-org-tree'
import { Modal } from 'antd'
import { useSelector } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'
import StaffHelper from './StaffHelper'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const horizontal = false
const collapsable = false
const expandAll = true

const OrganizationChart = ({ isHierarchyModal, handleCancel, staff }) => {
  const { staffList, titleAndPermission, userIdToInfo } = useSelector(
    state => state
  )
  const [orgHierarchy, setOrgHierarchy] = useState([])
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  useEffect(() => {
    filterUsers(staffList)
    // eslint-disable-next-line
  }, [staffList])

  const filterUsers = sortedUsers => {
    const data = StaffHelper.filterUsers(
      titleAndPermission,
      sortedUsers,
      {},
      translateTextI18N
    )
    if (data) {
      buildHierarchy(data.activeUserList)
    }
  }
  const buildHierarchy = activeUserList => {
    let managerToStaffList = {}

    for (const staffData of activeUserList) {
      let { managers } = staffData

      for (const [managerId] of Object.entries(managers || {})) {
        if (!managers?.[managerId]?.active) continue

        if (!managerToStaffList[managerId]) {
          managerToStaffList[managerId] = []
        }
        managerToStaffList[managerId].push(staffData)
      }
    }

    let hierarchyData = StaffHelper.bindHierarchy({
      userIdToInfo,
      managerToStaffList,
      staff,
    })
    setOrgHierarchy(hierarchyData)
  }

  return useMemo(() => {
    return (
      <>
        <Modal
          visible={isHierarchyModal}
          className='hierarchyModal cmnModal'
          footer={null}
          onCancel={handleCancel}
          centered
        >
          <div className='orgTree-wrp'>
            <OrgTree
              data={orgHierarchy}
              horizontal={horizontal}
              collapsable={collapsable}
              expandAll={expandAll}
            ></OrgTree>
          </div>
        </Modal>
      </>
    )
  }, [isHierarchyModal, handleCancel, orgHierarchy])
}

export default OrganizationChart
