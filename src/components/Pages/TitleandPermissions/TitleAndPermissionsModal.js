import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Input, Select, Modal, Button, Checkbox, Form, Alert } from 'antd'

import {
  CustomDepartmentSideMenu,
  ManagementDeptObject,
  CancelRequest,
  ManagementDeptSideMenu,
  Option,
  secondsToShowAlert,
  recurringTaskScheduler,
  ListView,
  TaskSheetManagement,
  RoomView,
} from '../../../config/constants'
import {
  SaveTitlePermission,
  UsersLinkedToTitle,
} from '../../../services/titleAndPermissions'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import DepartmentOrServiceName from '../../Common/DepartmentOrServiceName/DepartmentOrServiceName'
import { Sort, Ternary } from '../../../config/utils'
import { InfoCircleOutlined } from '@ant-design/icons'

function GetSortedDepartments(departmentsNew) {
  return Sort([ManagementDeptObject, ...departmentsNew], 'name')
}

const LevelTooltip = (
  <ul className='level-tooltip'>
    <li>Level 0: IT Admin</li>
    <li>Level 1: Top Management</li>
    <li>Level 2: Administrative Level</li>
    <li>Level 3: Executive Level</li>
    <li>Level 4: Operational Level</li>
    <li>Level 5: Support Level</li>
  </ul>
)

const IsValidTitle = ({
  value,
  titleToEdit,
  titleAndPermission,
  selectedDepartmentId,
}) => {
  if (!value) return true

  let existingTitle = titleAndPermission
    .filter(t => t.departmentId === selectedDepartmentId)
    .map(t => t.title.toLowerCase())
  if (titleToEdit?.id) {
    existingTitle = existingTitle.filter(
      r => r !== titleToEdit.title.toLowerCase()
    )
  }

  return !existingTitle?.includes(value.trim().toLowerCase())
}

function LoadTitleModal(data) {
  const {
    isModalVisible,
    titleToEdit,
    setSelectedDepartmentId,
    setSelectedServiceId,
    getMenus,
    form,
    setMenuState,
    setTitle,
    departmentsNew,
    setMenus,
    setShowLoader,
    setTitleToEdit,
    setIsAdmin,
    setLevel,
  } = data
  if (isModalVisible) {
    if (titleToEdit.id) {
      setSelectedDepartmentId(titleToEdit.departmentId)
      setSelectedServiceId(titleToEdit.serviceId)

      let savedMenuState = []

      const [menuList] = getMenus(titleToEdit.departmentId)

      savedMenuState = menuList.reduce((acc, m) => {
        acc[m.id] = titleToEdit.menus?.includes(m.id)
        m?.subMenu?.forEach(
          s => (acc[s.index] = titleToEdit.menus?.includes(s.index.toString()))
        )
        return acc
      }, {})

      savedMenuState['0'] = Object.values(savedMenuState)
        .slice(1)
        .every(v => v === true)

      setMenuState(savedMenuState)
      setTitle(titleToEdit.title)
      setIsAdmin(titleToEdit.isAdmin)
      setLevel(titleToEdit.level)
      form.setFieldsValue({
        department: titleToEdit.departmentId,
        title: titleToEdit.title,
        service: titleToEdit.serviceId,
        level: titleToEdit.level,
      })
      return
    }
    const defaultDepartment = GetSortedDepartments(departmentsNew)[0].id
    setSelectedDepartmentId(defaultDepartment)
    form.setFieldsValue({ department: defaultDepartment })
  } else {
    form.resetFields()
    setIsAdmin(false)
    setMenus([])
    setSelectedDepartmentId('')
    setShowLoader(false)
    setTitleToEdit({})
  }
}

function setMenuAndServices({
  getMenus,
  selectedDepartmentId,
  servicesList,
  setMenus,
  setMenuState,
  setServices,
  titleToEdit,
}) {
  let [menuList, serviceData] = getMenus(selectedDepartmentId)

  if (menuList?.length && !menuList.find(m => m.name === 'All')) {
    menuList.unshift({ index: 0, id: '0', name: 'All' })
  }

  setMenus(menuList)

  servicesList.push(...serviceData)
  setServices(servicesList)

  if (titleToEdit?.departmentId !== selectedDepartmentId) {
    const newMenuState = menuList?.reduce((acc, curr) => {
      acc[curr.id] = false
      if (curr.subMenu) curr.subMenu?.map(s => (acc[s.index] = false))
      return acc
    }, {})
    setMenuState(newMenuState)
  }
}

function UpdateByDepartmentId({
  selectedDepartmentId,
  getMenus,
  setMenus,
  titleToEdit,
  setMenuState,
  setServices,
  form,
  setLevel,
}) {
  let servicesList = []
  if (selectedDepartmentId) {
    const isManagement = selectedDepartmentId === ManagementDeptObject.id
    const tempLevel = titleToEdit?.level || ''
    const sLevel = Ternary(isManagement, 1, tempLevel)
    form.setFieldsValue({ level: sLevel })
    setLevel(sLevel)

    setMenuAndServices({
      getMenus,
      selectedDepartmentId,
      servicesList,
      setMenus,
      setMenuState,
      setServices,
      titleToEdit,
    })
    return
  }
  setServices([])
  setMenus([])
}

const GetIdColumn = isSubMenu => (isSubMenu ? 'index' : 'id')
const setParentTrue = (parentId, subMenu, oldState) => {
  if (parentId && subMenu.some(s => oldState[s.index] === true)) {
    oldState[parentId] = true
  }
  return oldState
}

function CheckMenuState(data) {
  const { m, setMenuState, menuState, checked, isSubMenu, menus } = data
  const idColumn = GetIdColumn(isSubMenu)
  if (m[idColumn] === '0') {
    const newMenuState = Object.keys(menuState).reduce((acc, currId) => {
      acc[currId] = checked
      return acc
    }, {})
    setMenuState(newMenuState)
  } else {
    const oldState = { ...menuState }
    oldState[m[idColumn]] = checked

    // parent checked changed
    if (!isSubMenu) {
      const parentMenu = menus.find(m1 => m1.id === m.id)
      if (parentMenu.subMenu) {
        parentMenu.subMenu.forEach(s => (oldState[s.index] = checked))
      }
    }

    // sub menu click
    if (isSubMenu) {
      let parentId = ''
      let subMenu = []
      menus.forEach(m1 => {
        const subMenuAvailable = m1.subMenu?.some(s => s.index === m.index)
        if (subMenuAvailable) {
          parentId = m1.id
          subMenu = m1.subMenu
        }
      })
      if (parentId && subMenu.every(s => oldState[s.index] === checked)) {
        oldState[parentId] = checked
      }
      setParentTrue(parentId, subMenu, oldState)
    }

    // set checked value for "All"
    oldState['0'] = Object.entries(oldState)
      .map(([key, value]) => (key === '0' ? true : value))
      .every(v => v === true)

    setMenuState(oldState)
  }
}

function getSelectedMenuIds(menuState, menus) {
  let selectedMenuIds = []
  const menuStateKeys = Object.entries(menuState)
    .filter(([key, value]) => value && key !== '0')
    .map(([key, _]) => key)
  menus.forEach(m => {
    if (menuStateKeys?.includes(m.id)) selectedMenuIds.push(m.id)
    m?.subMenu?.forEach(s => {
      if (menuStateKeys?.includes(String(s?.index)))
        selectedMenuIds.push(String(s.index))
    })
  })
  return selectedMenuIds
}

async function saveTitlePermsisionFunc(data) {
  const {
    setShowLoader,
    setSaveTitleError,
    menus,
    menuState,
    hotelId,
    selectedDepartmentId,
    title,
    selectedServiceId,
    titleToEdit,
    setSaveTitleSuccessMessage,
    toggleModalVisibility,
    showSaveTitleError,
    isAdmin,
    level,
    departmentAndServiceIdToInfo,
    staffList,
    managerToStaffList,
  } = data
  try {
    setShowLoader(true)
    setSaveTitleError('')

    const selectedMenuIds = getSelectedMenuIds(menuState, menus)

    if (titleToEdit.id) {
      const staffWithCurrentTitle = staffList.filter(
        s => s.roles[0] === titleToEdit.id
      )

      // if this level is assigned to manager then it should be <= subordinate's level
      const subordinates = []
      staffWithCurrentTitle.forEach(s => {
        subordinates.push(...(managerToStaffList[s.id] || []))
      })
      if (subordinates.length) {
        const minSubordinateLevel = Math.min(...subordinates.map(s => s.level))
        // here "level" is manager's level
        if (level > minSubordinateLevel) {
          showSaveTitleError(
            `There are subordinates under this title with level ${minSubordinateLevel}`
          )
          setShowLoader(false)
          return
        }
      }

      // if this level is assigned to subordinate then it should be >= manager's level
      let managerList = staffWithCurrentTitle
        .map(s => Object.keys(s.managers || {}))
        .flat()
        .filter(m => m)

      managerList = [...new Set(managerList)]
        .map(mId => staffList.find(s => s.id === mId))
        .filter(m => m?.id)

      if (managerList.length) {
        const maxManagerLevel = Math.max(...managerList.map(m => m.level))
        // here "level" is subordinate's level
        if (level < maxManagerLevel) {
          showSaveTitleError(
            `Level should not be greater than manager's level. There are managers under this title with level ${maxManagerLevel}`
          )
          setShowLoader(false)
          return
        }
      }
    }

    const { success, message } = await SaveTitlePermission({
      id: titleToEdit.id,
      hotelId,
      departmentId: selectedDepartmentId,
      title,
      serviceId: selectedServiceId,
      menus: selectedMenuIds,
      isAdmin,
      level,
      department: departmentAndServiceIdToInfo[selectedDepartmentId].name,
    })

    if (success) {
      setSaveTitleSuccessMessage(
        `Title & Permissions ${
          titleToEdit.id ? 'edited' : 'added'
        } successfully`
      )
      setShowLoader(false)
      toggleModalVisibility()

      return
    }
    setShowLoader(false)
    showSaveTitleError(message)
  } catch (error) {
    setShowLoader(false)
    showSaveTitleError(
      error.message || 'Something went wrong! Please try again!'
    )
  }
}

const TitleAndPermissionsModal = ({
  hotelId,
  departmentsNew,
  isModalVisible,
  toggleModalVisibility,
  defaultMenus,
  setSaveTitleSuccessMessage,
  titleToEdit,
  setTitleToEdit,
  titleAndPermission,
  servicesNew,
}) => {
  const {
    departmentAndServiceIdToInfo,
    staffList,
    managerToStaffList,
    staffLoading,
    themecolor,
  } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [showLoader, setShowLoader] = useState(false)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [services, setServices] = useState([])
  const [menus, setMenus] = useState([])
  const [menuState, setMenuState] = useState({})
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [saveTitleError, setSaveTitleError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userAssociatedWithTitle, setUserAssociatedWithTitle] = useState(false)

  const [form] = Form.useForm()

  const { hotelInfo } = useSelector(state => state)

  const enableRecurringTaskScheduler = hotelInfo?.enableRecurringTaskScheduler
  console.log(enableRecurringTaskScheduler, 'RC hotelInfdo')

  useEffect(() => {
    LoadTitleModal({
      isModalVisible,
      titleToEdit,
      setSelectedDepartmentId,
      setSelectedServiceId,
      getMenus,
      form,
      setMenuState,
      setTitle,
      departmentsNew,
      setMenus,
      setShowLoader,
      setTitleToEdit,
      setIsAdmin,
      setLevel,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  async function findUserAssociation() {
    if (titleToEdit.id) {
      const _usersAvailableUnderTitle = await UsersLinkedToTitle(
        titleToEdit.id,
        staffList
      )
      setUserAssociatedWithTitle(_usersAvailableUnderTitle)
    } else {
      setUserAssociatedWithTitle(false)
    }
  }

  useEffect(() => {
    findUserAssociation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleToEdit, staffList])

  const showSaveTitleError = errorMessag => {
    setSaveTitleError(errorMessag)
    setTimeout(() => setSaveTitleError(''), secondsToShowAlert)
  }

  const getMenus = deptId => {
    let servicesList = []
    let menuList = [...CustomDepartmentSideMenu]

    if (deptId === ManagementDeptObject.id) {
      menuList = ManagementDeptSideMenu

      if (enableRecurringTaskScheduler) {
        menuList = [
          ...menuList,
          ...recurringTaskScheduler,
          {
            iconSrc: 'images/add-file.svg',
            index: '53',
            id: '53',
            linkTo: '',
            name: 'Task Sheet Management',
            refDefaultDepartmentId: '',
            subMenu: [...RoomView, ...ListView],
          },
        ]
      }
    } else {
      const selectedDepartment = departmentsNew?.find(d => d.id === deptId)
      if (selectedDepartment) {
        servicesList = [...(servicesNew[selectedDepartment.id] || [])].filter(
          s => s.active
        )

        menuList = defaultMenus.filter(
          d => d.refDefaultDepartmentId === selectedDepartment.refDefaultId
        )

        if (!selectedDepartment?.default) {
          menuList = [...menuList, ...CustomDepartmentSideMenu]
        }
      }

      menuList = [...menuList, ...CancelRequest]

      // Conditionally include other menu items based on enableRecurringTaskScheduler
      if (enableRecurringTaskScheduler) {
        menuList = [
          ...menuList,
          ...recurringTaskScheduler,
          {
            iconSrc: 'images/add-file.svg',
            index: '53',
            id: '53',
            linkTo: '',
            name: 'Task Sheet Management',
            refDefaultDepartmentId: '',
            subMenu: [
              //
              ...RoomView,
              ...ListView,
            ],
          },
        ]
      }
    }

    return [menuList, servicesList]
  }

  useEffect(() => {
    UpdateByDepartmentId({
      selectedDepartmentId,
      getMenus,
      setMenus,
      titleToEdit,
      setMenuState,
      setServices,
      form,
      setLevel,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId])

  const saveTitle = async () => {
    await saveTitlePermsisionFunc({
      setShowLoader,
      setSaveTitleError,
      menus,
      menuState,
      hotelId,
      selectedDepartmentId,
      title,
      selectedServiceId,
      titleToEdit,
      setSaveTitleSuccessMessage,
      toggleModalVisibility,
      showSaveTitleError,
      isAdmin,
      level,
      departmentAndServiceIdToInfo,
      staffList,
      managerToStaffList,
    })
  }

  function checkMenu(e, m, isSubMenu) {
    const { checked } = e.target
    CheckMenuState({ m, setMenuState, menuState, checked, isSubMenu, menus })
  }

  const handleTitleChange = (e, isOnBlur) => {
    let value = e.target.value
    if (isOnBlur) value = value.trim()
    setTitle(value)
    form.setFieldsValue({ title: value })
  }

  const handleLevelChange = e => {
    if (!e.target.value) {
      setLevel('')
      form.setFieldsValue({ level: '' })
      return
    }

    let value = +e.target.value

    if (value > 0) {
      setLevel(value)
      form.setFieldsValue({ level: value })
    } else {
      form.setFieldsValue({ level })
    }
  }

  return (
    <Modal
      title={translateTextI18N(`${titleToEdit.id ? 'Edit' : 'Add New'} Title`)}
      visible={isModalVisible}
      onOk={toggleModalVisibility}
      onCancel={toggleModalVisibility}
      className='addtitleModal cmnModal'
      footer={null}
      maskClosable={false}
    >
      <Form
        layout='vertical'
        initialValues={{
          service: 'Default',
        }}
        form={form}
        onFinish={saveTitle}
        validateTrigger
      >
        <div className='row'>
          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                required
                label={translateTextI18N('Department')}
                name='department'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please select department'),
                  },
                ]}
              >
                <Select
                  disabled={userAssociatedWithTitle}
                  value={selectedDepartmentId}
                  placeholder={translateTextI18N('Select department')}
                  onChange={d => {
                    setSelectedDepartmentId(d)
                    setSelectedServiceId('')
                    setIsAdmin(false)
                    form.setFieldsValue({ service: null })
                  }}
                  getPopupContainer={triggerNode => {
                    return triggerNode.parentNode
                  }}
                >
                  {GetSortedDepartments(departmentsNew).map(d => (
                    <Option value={d.id} key={d.id}>
                      <DepartmentOrServiceName data={d} />
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='form-group cmn-input'>
              <Form.Item
                required
                label={translateTextI18N('Title')}
                name='title'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter title'),
                  },
                  () => ({
                    validator(_, value) {
                      if (
                        IsValidTitle({
                          value: value?.toLowerCase(),
                          titleToEdit,
                          titleAndPermission,
                          selectedDepartmentId,
                        })
                      ) {
                        return Promise.resolve()
                      }
                      return Promise.reject(
                        new Error(`Title type already exists`)
                      )
                    },
                  }),
                ]}
              >
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={e => handleTitleChange(e, true)}
                />
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='form-group cmn-input'>
              <Form.Item label={translateTextI18N('Service')} name='service'>
                <Select
                  value={selectedServiceId}
                  placeholder={translateTextI18N('Default')}
                  onChange={s => setSelectedServiceId(s)}
                  getPopupContainer={triggerNode => {
                    return triggerNode.parentNode
                  }}
                >
                  {services.map(s => (
                    <Option value={s.id} key={s.id}>
                      {translateTextI18N(s.name)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                required
                label='Level'
                name='level'
                tooltip={{
                  title: LevelTooltip,
                  icon: (
                    <InfoCircleOutlined
                      style={{ marginTop: '-5px', cursor: 'default' }}
                    />
                  ),
                  placement: 'right',
                  color: themecolor,
                }}
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter level'),
                  },
                  () => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve()
                      }
                      if (
                        +value === 1 &&
                        selectedDepartmentId !== ManagementDeptObject.id
                      ) {
                        return Promise.reject(
                          new Error(
                            translateTextI18N(
                              `Level 1 is reserved for Management Department`
                            )
                          )
                        )
                      } else {
                        return Promise.resolve()
                      }
                    },
                  }),
                ]}
              >
                <Input
                  value={level}
                  onChange={e => handleLevelChange(e)}
                  disabled={selectedDepartmentId === ManagementDeptObject.id}
                />
              </Form.Item>
              <div className='uploadbtn-wrp' style={{ marginTop: '-8px' }}>
                <p>
                  {translateTextI18N(
                    'Hierarchy level should be in ascending order'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className='col-12'>
            <div className='form-group cmn-input alignedCheckbox'>
              <Form.Item name='remember' valuePropName='unchecked'>
                <Checkbox
                  checked={isAdmin}
                  onChange={e => setIsAdmin(e.target.checked)}
                  style={{ alignItems: 'baseline' }}
                >
                  {translateTextI18N('Notifications')}
                </Checkbox>
              </Form.Item>
            </div>
          </div>

          <div className='col-12'>
            <Form.Item
              required
              label={translateTextI18N('Permissions')}
              name='menus'
              rules={[
                () => ({
                  validator() {
                    if (Object.values(menuState).some(v => v)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error(translateTextI18N(`Please select permissions`))
                    )
                  },
                }),
              ]}
            >
              <ul className='list-unstyled selectboxList'>
                {menus.map(m => {
                  return (
                    <li
                      key={m.id}
                      className={m.name.toLowerCase() === 'all' ? 'active' : ''}
                    >
                      {translateTextI18N(m.name)}
                      <Checkbox
                        checked={menuState[m.id]}
                        value={m.id}
                        onChange={e => checkMenu(e, m, false)}
                      ></Checkbox>
                      {m?.subMenu ? (
                        <ul className='list-unstyled selectboxList'>
                          {m?.subMenu.map(s => (
                            <li
                              key={s.id}
                              className={
                                s.name.toLowerCase() === 'all' ? 'active' : ''
                              }
                            >
                              {translateTextI18N(s.name)}
                              <Checkbox
                                checked={menuState[s.index]}
                                value={s.id}
                                onChange={e => {
                                  e.stopPropagation()
                                  checkMenu(e, s, true)
                                }}
                              ></Checkbox>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </Form.Item>
          </div>
        </div>

        {saveTitleError && (
          <Alert id='alrt' message={saveTitleError} type='error' showIcon />
        )}

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={toggleModalVisibility}
          >
            {translateTextI18N('Cancel')}
          </Button>
          <Button
            disabled={staffLoading && titleToEdit.id}
            className='blueBtn ml-4'
            key='submit'
            htmlType='submit'
            loading={showLoader}
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default TitleAndPermissionsModal
