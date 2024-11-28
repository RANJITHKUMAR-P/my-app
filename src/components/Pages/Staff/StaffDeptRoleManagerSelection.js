import React, { useRef } from 'react'
import { Form, Select } from 'antd'
import { useSelector } from 'react-redux'

import {
  defaultManagerProps,
  ManagementDeptObject,
  MaximumAllowedManager,
  Option,
} from '../../../config/constants'
import DepartmentOrServiceName from '../../Common/DepartmentOrServiceName/DepartmentOrServiceName'
import {
  deepCloneObject,
  defaultFilterOption,
  getActiveManagers,
  Sort,
} from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { deleteManager } from '../../../services/user'

function getExistingManagerData({ selectedManager, editUser, managers }) {
  let stateManagers = deepCloneObject(managers)

  stateManagers[selectedManager.userId] = {
    id: selectedManager.userId,
    name: selectedManager.name,
    active: true,
    ...defaultManagerProps,
  }

  let oldManagers = editUser?.managers
  let selectedManagerOldData = oldManagers?.[selectedManager.userId]

  if (selectedManagerOldData) {
    stateManagers[selectedManager.userId] = {
      ...stateManagers[selectedManager.userId],
      ...selectedManagerOldData,
    }

    function getInactiveManagerData(oldData) {
      const { subOf } = oldData
      for (const mId of subOf) {
        const childOldData = oldManagers[mId]
        stateManagers[mId] = { ...childOldData }
        getInactiveManagerData(childOldData)
      }
    }

    getInactiveManagerData(selectedManagerOldData)
  }

  return stateManagers
}

function StaffDeptRoleManagerSelection({
  department,
  departments,
  editingUserProfile,
  editUser,
  form,
  GetStaffListOptions,
  isManager,
  role,
  setCreateUserError,
  setDepartment,
  setRole,
  setSelectedTitleAndPermissionData,
  titles,
  userId,
  managers,
  setManagers,
}) {
  const managerRef = useRef()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const { userIdToInfo } = useSelector(state => state)

  const getPopupContainer = ({ parentNode }) => parentNode

  function setManagerError(error = '') {
    form.setFields([{ name: 'Manager', errors: [error] }])
  }

  function clearManagerError() {
    setTimeout(() => setManagerError(), 3000)
  }

  function onManagerSelect(...args) {
    const id = args[0]
    const selectedManager = userIdToInfo[id]

    let error = ''
    if (userIdToInfo[id]?.managers?.[editUser?.id]) {
      error = `Staff cannot be manager of manager`
    }

    const { managerIds } = getActiveManagers(managers)
    if (managerIds?.length >= +MaximumAllowedManager) {
      error = `Maximum 4 managers are allowed`
    }

    if (error) {
      form.setFieldsValue({ Manager: managerIds })
      setManagerError(error)
      clearManagerError()
      managerRef.current.blur()
      return
    }

    const newManagers = getExistingManagerData({
      selectedManager,
      editUser,
      managers,
    })

    setManagers(newManagers)
  }

  function onManagerDeselect(...args) {
    const selectedId = args[0]
    if (!selectedId) return

    let tempManagers = JSON.parse(JSON.stringify(managers))
    tempManagers = deleteManager({
      oldManagerInfo: userIdToInfo[selectedId],
      replacementManagerId: '',
      subordinatesManagers: tempManagers,
    })
    setManagers(tempManagers)
  }

  function onDepartmentChange(selectedDepartment) {
    if (editingUserProfile && isManager(userId)) {
      setCreateUserError(
        'You cannot change department as there are multiple person working under the user'
      )
      form.setFieldsValue({ Department: department })
      return
    }
    setDepartment(selectedDepartment)
    setRole('')
    setManagers({})
    form.setFieldsValue({ Role: null, Manager: [] })
  }

  function onRoleChange(selectedRole) {
    if (editingUserProfile && isManager(userId)) {
      setCreateUserError(
        'You cannot change title as there are multiple person working under the user'
      )
      form.setFieldsValue({ Role: role })
      return
    }

    setSelectedTitleAndPermissionData(
      titles.find(({ id }) => id === selectedRole)
    )
    setRole(selectedRole)
  }

  const getManagerValidationRules = () => {
    return [
      {
        required: department !== ManagementDeptObject.id,
        message: translateTextI18N('Please select Manager'),
      },
      () => ({
        validator(_, selectedManagers) {
          if (!editingUserProfile || !selectedManagers.length) {
            return Promise.resolve()
          }
          return Promise.resolve()
        },
      }),
    ]
  }

  return (
    <>
      <div className='col-12 col-md-6'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Department')}
            name='Department'
            rules={[
              {
                required: true,
                message: translateTextI18N('Please select department'),
              },
            ]}
          >
            <Select
              value={translateTextI18N(department)}
              onChange={onDepartmentChange}
              getPopupContainer={getPopupContainer}
            >
              {Sort(
                [
                  ManagementDeptObject,
                  ...(editingUserProfile
                    ? departments
                    : departments.filter(d => d.active)),
                ],
                'name'
              ).map((dept, idx) => (
                <Option value={dept.id} key={dept.id} id={idx}>
                  <DepartmentOrServiceName data={dept} />
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
      <div className='col-12 col-md-6'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Title')}
            name='Role'
            value={role}
            rules={[
              {
                required: true,
                message: translateTextI18N('Please select title'),
              },
            ]}
          >
            <Select
              onChange={onRoleChange}
              getPopupContainer={getPopupContainer}
            >
              {titles.map(obj => (
                <Option value={obj.id} key={obj.id}>
                  {translateTextI18N(obj.title)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
      <div className='col-12 col-md-6'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Manager')}
            name='Manager'
            rules={getManagerValidationRules()}
            validateTrigger={['onSelect', 'onDeselect']}
          >
            <Select
              id='Manager'
              value={getActiveManagers(managers).managerIds}
              onSelect={onManagerSelect}
              onDeselect={onManagerDeselect}
              getPopupContainer={getPopupContainer}
              mode='multiple'
              ref={managerRef}
              filterOption={defaultFilterOption}
            >
              {GetStaffListOptions()}
            </Select>
          </Form.Item>
        </div>
      </div>
    </>
  )
}

export default StaffDeptRoleManagerSelection
