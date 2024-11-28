import React, { useContext, useEffect, useMemo } from 'react'
import { Layout, Menu, Skeleton } from 'antd'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CloseOutlined } from '@ant-design/icons'
import { actions } from '../../../Store'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { AuthContext } from '../../../Router/AuthRouteProvider'
import { getImage, UpperCase } from '../../../config/utils'
import {
  DiningSubMenuConfig,
  ReportSubMenuConfig,
  AllReportSubMenuConfig,
  ServiceRequestSubMenuConfig,
} from '../../../config/constants'
import { setAppVersion } from '../../../services/maintenance'
import {
  recurringTaskSchedulerPermissions,
  getCurrentListViewPermissions,
  getCurrentTashsheetPermissions,
} from '../../../services/user'

const { Sider } = Layout
const { SubMenu } = Menu

const SideMenu = () => {
  const history = useHistory()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const auth = useContext(AuthContext)
  const {
    appVersion,
    existingLevelsAllocatedFeedbackSettings,
    recurringPermissions,
  } = useSelector(state => state)
  const {
    hotelInfo,
    sideMenuSelectedKey,
    sideMenuOpenKeys,
    gettingTitleAndPermission,
    isHotelAdmin,
    changeSelectedKey,
    flatSideMenus,
    sideMenus,
    isSideMenuOpen,
    hideSubMenu,
    userInfo,
  } = auth
  const dispatch = useDispatch()
  const route = useRouteMatch()
  const { deptData } = userInfo

  useEffect(() => {
    const find = flatSideMenus?.find(nav => nav?.linkTo === route?.path)
    if (find) {
      dispatch(actions.setSideMenuSelectedKey(`${String(find?.index)}`))
    }
  }, [flatSideMenus, dispatch, route?.path])

  useEffect(() => {
    if (isHotelAdmin) {
      let hotelSubMenu = [
        ...DiningSubMenuConfig.map(d => d.linkTo),
        ...ServiceRequestSubMenuConfig.map(d => d.linkTo),
      ]
      if (!hotelSubMenu.includes(route?.path)) {
        dispatch(actions.setDefaultSideMenuOpenKeys())
      }
    }
  }, [route?.path, isHotelAdmin, dispatch])

  let dependencyArray = [isHotelAdmin, hotelInfo, sideMenus]
  if (isHotelAdmin) {
    dependencyArray = [...dependencyArray, translateTextI18N]
  }
  useEffect(() => {
    setAppVersion(dispatch)
  }, [dispatch])

  const reportDept = hotelInfo?.reportDept
  const enableRecurringTaskScheduler = hotelInfo?.enableRecurringTaskScheduler

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const [canRecurringScheduler, canListView, canTaskSheetManagementView] =
          await Promise.all([
            recurringTaskSchedulerPermissions({ roles: userInfo?.roles }),
            getCurrentListViewPermissions({ roles: userInfo?.roles }),
            getCurrentTashsheetPermissions({ roles: userInfo?.roles }),
          ])

        dispatch(
          actions.setRecurringPermissions({
            canRecurringScheduler,
            canListView,
            canTaskSheetManagementView,
          })
        )
      } catch (error) {
        console.error('Error fetching permissions:', error)
      }
    }

    fetchPermissions()
  }, [userInfo?.roles])

  const staffMenu = useMemo(() => {
    if (isHotelAdmin) {
      return (
        <>
          {reportDept ? (
            // The all report will be shown only our a customize user role
            <SubMenu
              key='sub33'
              id='sub33'
              onTitleClick={e => dispatch(actions.setSideMenuOpenKeys(e.key))}
              icon={<img src={getImage('images/Reports.svg')} />}
              title={translateTextI18N('All Hotels Reports')}
            >
              {AllReportSubMenuConfig.map(d => (
                <CustomMenu key={d.key} {...d} />
              ))}
            </SubMenu>
          ) : (
            // else the normal report will be shown
            <>
              <CustomMenu
                key='1'
                index='1'
                iconSrc='images/dashboard.svg'
                linkTo='/Dashboard'
                formattedId='Dashboard'
              />
              <Menu.Item
                key='2'
                id='2'
                index='2'
                icon={<img src={getImage('images/InplassInn.svg')}></img>}
                onClick={e => {
                  changeSelectedKey(e)
                  hideSubMenu()
                }}
              >
                <Link to='/HotelInfo' id='HotelInfo1'>
                  {hotelInfo?.hotelName
                    ? UpperCase(hotelInfo?.hotelName)
                    : null}
                </Link>
              </Menu.Item>
              <CustomMenu
                key='3'
                index='3'
                iconSrc='images/Departments.svg'
                linkTo='/Department'
                formattedId='Departments'
              />
              <CustomMenu
                key='4'
                index='4'
                iconSrc='images/GuestInfo.svg'
                linkTo='/GuestInfo'
                formattedId='Guest Info'
              />
              <SubMenu
                key='sub2'
                id='sub2'
                onTitleClick={e => dispatch(actions.setSideMenuOpenKeys(e.key))}
                icon={<img src={getImage('images/ServiceRequests.svg')}></img>}
                title={translateTextI18N('Service Requests')}
              >
                {ServiceRequestSubMenuConfig.map(d => (
                  <CustomMenu key={d.key} {...d} />
                ))}
              </SubMenu>

              <CustomMenu
                key='7'
                index='7'
                iconSrc='images/Reservations.svg'
                linkTo='/Reservations'
                formattedId='Reservations'
              />
              <SubMenu
                key='sub1'
                id='sub1'
                onTitleClick={e => dispatch(actions.setSideMenuOpenKeys(e.key))}
                icon={<img src={getImage('images/Dining.svg')}></img>}
                title={translateTextI18N('Dining')}
              >
                {DiningSubMenuConfig.map(d => (
                  <CustomMenu key={d.key} {...d} />
                ))}
              </SubMenu>
              <CustomMenu
                key='1001'
                index='1001'
                iconSrc='images/location.svg'
                linkTo='/locations'
                formattedId='Locations'
              />
              <CustomMenu
                key='98'
                index='98'
                iconSrc='images/titlepermissions.svg'
                linkTo='/TitleandPermissions'
                formattedId='Title & Permissions'
              />
              <CustomMenu
                key='13'
                index='13'
                iconSrc='images/Users.svg'
                linkTo='/Staff'
                formattedId='Staff'
              />
              {['prod', 'uat', 'qa', 'development', 'uat2'].includes(
                process.env.REACT_APP_ENV
              ) && (
                <SubMenu
                  key='sub3'
                  id='sub3'
                  onTitleClick={e =>
                    dispatch(actions.setSideMenuOpenKeys(e.key))
                  }
                  icon={<img src={getImage('images/Reports.svg')}></img>}
                  title={translateTextI18N('Reports')}
                >
                  {ReportSubMenuConfig.map(d => (
                    <CustomMenu key={d.key} {...d} />
                  ))}
                </SubMenu>
              )}
              <CustomMenu
                key='14'
                index='14'
                iconSrc='images/Promotions.svg'
                linkTo='/Promotions'
                formattedId='Promotions'
              />
              <CustomMenu
                key='144'
                index='144'
                iconSrc='images/Departments.svg'
                linkTo='/HouseKeepingServices'
                formattedId='HouseKeeping Services'
              />
              {enableRecurringTaskScheduler && (
                <SubMenu
                  key='sub44'
                  id='sub44'
                  onTitleClick={e =>
                    dispatch(actions.setSideMenuOpenKeys(e.key))
                  }
                  icon={
                    <img
                      src={getImage('images/Departments.svg')}
                      alt='task sheet icon'
                    ></img>
                  }
                  title={translateTextI18N('Task Sheet Management')}
                >
                  <CustomMenu
                    key='27'
                    index='27'
                    iconSrc='images/Departments.svg'
                    linkTo='/RoomView'
                    formattedId='Room View'
                  />
                  <CustomMenu
                    key='1446'
                    index='1446'
                    iconSrc='images/Departments.svg'
                    linkTo='/HouseKeepingTimeScheduler'
                    formattedId='List View'
                  />
                </SubMenu>
              )}

              {enableRecurringTaskScheduler && (
                <CustomMenu
                  key='1221'
                  index='1221'
                  iconSrc='images/Departments.svg'
                  linkTo='/RecurringTaskScheduler'
                  formattedId='Recurring Task Scheduler'
                />
              )}
              <CustomMenu
                key='15'
                index='15'
                iconSrc='images/PrivacyPolicy.svg'
                linkTo='/TermsConditionsPrivacyPolicy'
                formattedId='T&C and Privacy Policy'
              />
              <CustomMenu
                key='16'
                index='16'
                iconSrc='images/settingsicon.svg'
                linkTo='/Settings'
                formattedId='Settings'
              />
              <CustomMenu
                key='17'
                index='17'
                iconSrc='images/faq.png'
                linkTo='/faq'
                formattedId='FAQ'
              />
            </>
          )}
        </>
      )
    }
    let sideMenusTemp = sideMenus

    if (
      existingLevelsAllocatedFeedbackSettings?.levels?.includes(userInfo?.level)
    ) {
      const checkExist = sideMenusTemp.find(
        el => el.linkTo === '/FrontDeskGuest'
      )
      if (!checkExist) {
        dispatch(actions.setLevelBasedDisable(true))
        const obj = {
          key: 2,
          index: 2,
          iconSrc: 'images/checkinout.svg',
          linkTo: '/FrontDeskGuest',
          name: 'Guests',
        }
        sideMenusTemp = [{ ...obj }, ...sideMenusTemp]
      }
    }

    const hotelName = hotelInfo?.hotelName.trim()
    if (hotelName === 'Our Hotel & Resort Spa') {
      if (deptData?.key === 'front-desk') {
        const obj = {
          key: sideMenusTemp?.length + 1,
          index: sideMenusTemp?.length + 1,
          iconSrc: 'images/roomno.svg',
          linkTo: '/Rooms',
          name: 'PMS Rooms',
        }

        sideMenusTemp = [{ ...obj }, ...sideMenusTemp]
      }
    }

    const enableIva = hotelInfo?.enableIva
    const isAdminLevel = userInfo?.level

    if (enableIva) {
      if (isAdminLevel !== 0) {
        const obj = {
          key: 981,
          index: 981,
          iconSrc: 'images/ivawhite.png',
          linkTo: '/chatwithiva',
          name: 'Chat with IVA',
        }
        sideMenusTemp = [...sideMenusTemp, { ...obj }]
      }
      //list view show or not
      if (
        enableRecurringTaskScheduler &&
        recurringPermissions?.canListView &&
        !recurringPermissions?.canTaskSheetManagementView
      ) {
        const obj = {
          key: '1446',
          index: '1446',
          iconSrc: 'images/Departments.svg',
          linkTo: '/HouseKeepingTimeScheduler',
          name: 'List View',
        }
        sideMenusTemp = [...sideMenusTemp, { ...obj }]
      }

      //task sheet Management
      if (
        enableRecurringTaskScheduler &&
        recurringPermissions?.canTaskSheetManagementView &&
        !recurringPermissions?.canListView
      ) {
        const obj = {
          key: '27',
          index: '27',
          iconSrc: 'images/Departments.svg',
          linkTo: '/RoomView',
          name: 'Room View',
        }
        sideMenusTemp = [...sideMenusTemp, { ...obj }]
      }
      if (
        enableRecurringTaskScheduler &&
        recurringPermissions?.canTaskSheetManagementView &&
        recurringPermissions?.canListView
      ) {
        sideMenusTemp = [
          ...sideMenusTemp,
          {
            key: 'sub44',
            index: 'sub44',
            iconSrc: 'images/Departments.svg',
            name: 'Task Sheet Management',
            subMenu: [
              {
                key: '27',
                index: '27',
                iconSrc: 'images/Departments.svg',
                linkTo: '/RoomView',
                name: 'Room View',
              },
              {
                key: '1446',
                index: '1446',
                iconSrc: 'images/Departments.svg',
                linkTo: '/HouseKeepingTimeScheduler',
                name: 'List View',
              },
            ],
          },
        ]
      }
      //reccuringTaskScheduler
      if (
        enableRecurringTaskScheduler &&
        recurringPermissions?.canRecurringScheduler
      ) {
        const obj = {
          key: '1221',
          index: '1221',
          iconSrc: 'images/Departments.svg',
          linkTo: '/RecurringTaskScheduler',
          name: 'Recurring Task Scheduler',
        }
        sideMenusTemp = [...sideMenusTemp, { ...obj }]
      }
    }

    return sideMenusTemp.map(s => {
      let commonProps = {
        key: s.index,
        id: s.index,
        iconSrc: s.iconSrc,
        formattedId: s.name,
      }

      if (s.subMenu) {
        commonProps = { ...commonProps, subMenu: s.subMenu, openKey: s.index }
        return <CustomSubMenu {...commonProps} />
      }

      commonProps = { ...commonProps, linkTo: s.linkTo, index: s.index }
      return <CustomMenu {...commonProps} />
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyArray])

  function CustomMenu(data) {
    const { id, iconSrc, linkTo, formattedId, index, ...otherProps } = data

    return (
      <Menu.Item
        key={id}
        id={id}
        icon={<img src={getImage(iconSrc)}></img>}
        className='ant-menu-item'
        {...otherProps}
      >
        <Link
          to={'#'}
          onClick={e => {
            e.preventDefault()
            hideSubMenu()

            dispatch(actions.setSideMenuSelectedKey(String(index)))
            dispatch(actions.setCurrentroute(linkTo))
            history.push(linkTo)
          }}
        >
          {translateTextI18N(formattedId)}
        </Link>
      </Menu.Item>
    )
  }

  function CustomSubMenu({ id, iconSrc, formattedId, subMenu, ...otherProps }) {
    return (
      <SubMenu
        key={id}
        id={id}
        onTitleClick={e => {
          dispatch(actions.setSideMenuOpenKeys(String(e.key)))
        }}
        icon={<img src={getImage(iconSrc)}></img>}
        title={translateTextI18N(formattedId)}
        {...otherProps}
      >
        {subMenu.map(sub => (
          <CustomMenu
            key={`${sub.index}`}
            index={`${sub.index}`}
            id={`${sub.index}`}
            iconSrc={sub.iconSrc}
            linkTo={sub.linkTo}
            formattedId={sub.name}
            parentKey={id}
          />
        ))}
      </SubMenu>
    )
  }

  const CommonSideMenu = () => (
    <>
      <Sider>
        <Menu
          selectedKeys={sideMenuSelectedKey}
          openKeys={sideMenuOpenKeys}
          mode='inline'
          forceSubMenuRender={false}
        >
          {staffMenu}
        </Menu>
      </Sider>

      <div className='powered-wrp ' style={{ display: 'block' }}>
        <div>
          <h6>HOP by INPLASS Ver {appVersion}</h6>
        </div>
        <div style={{ display: 'flex' }}>
          <h6>Powered by</h6>
          <img src={getImage('images/inplassSmall.svg')}></img>
        </div>
      </div>
    </>
  )

  const webSideMenu = useMemo(() => {
    return (
      <section className={`sideMenu open`}>
        <CommonSideMenu />
      </section>
    )
  }, [isSideMenuOpen])

  const mobileSideMenu = useMemo(
    () => (
      <>
        {isSideMenuOpen && (
          <div
            className='sidemenu-overlay'
            onClick={() => {
              hideSubMenu()
            }}
          ></div>
        )}
        <section className={`sideMenu ${isSideMenuOpen ? 'open' : ''}`}>
          <div className='menuUserdetails'>
            <h3>
              <strong>{userInfo?.name}</strong>
            </h3>
          </div>
          <button
            className='menuclosebtn d-md-none'
            onClick={e => {
              e.preventDefault()
              hideSubMenu()
            }}
          >
            <CloseOutlined />
          </button>
          <CommonSideMenu />
        </section>
      </>
    ),

    [hideSubMenu, isSideMenuOpen, userInfo?.name]
  )

  if (gettingTitleAndPermission && hotelInfo?.hotelName && userInfo?.name)
    return <Skeleton />

  return window.screenX < 768 ? mobileSideMenu : webSideMenu
}

export default SideMenu
