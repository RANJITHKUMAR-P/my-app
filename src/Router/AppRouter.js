/* eslint-disable array-callback-return */
import React, { useEffect } from 'react'
import {
  Route,
  BrowserRouter,
  Switch,
  Redirect,
  useHistory,
} from 'react-router-dom'
import HotelAdminLayout from '../components/Common/Layout/HotelAdminLayout'
import PublicLayout from '../components/Common/Layout/PublicLayout'
import { GetCurrentUser, Logout } from '../services/user'
import { AuthPermission, routeConstant } from './routeConstant'
import StaffAdminLayout from './../components/Common/Layout/StaffAdminLayout'
import { actions } from '../Store'
import { useDispatch } from 'react-redux'
import WelcomeLoader from '../components/Common/WelcomeLoader/WelcomeLoader'
import NotFound from '../components/Pages/NotFound/NotFound'
import { HotelAdminRole } from '../config/constants'

function Admin({ component: Component, ...rest }) {
  return <Component {...rest} />
}

function Unauthorized({ userInfo, dispatch }) {
  useEffect(() => {
    document.title = 'Unauthorized'
    setTimeout(async () => {
      await Logout({ userInfo, dispatch })
    }, 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <NotFound message='You are not allowed to login to the web application' />
  )
}

export function RedirectToAdmin(props) {
  const { sideMenus, history } = props
  let url = ''
  if (sideMenus?.length > 0) {
    url = sideMenus[0]?.subMenu
      ? sideMenus[0]?.subMenu[0]?.linkTo
      : sideMenus[0]?.linkTo
    return history.push(url)
  }
}

export function RedirectToStaff(props) {
  const { sideMenus, currentRoute, dispatch } = props
  let url = currentRoute || '---'
  if (sideMenus?.length > 0) {
    let findCR = sideMenus?.findIndex(i => {
      if (i?.subMenu) {
        return i?.subMenu?.findIndex(j => j?.linkTo === currentRoute) >= 0
      }
      return i?.linkTo === currentRoute
    })
    if (findCR < 0) {
      url = sideMenus[0]?.subMenu
        ? sideMenus[0]?.subMenu[0]?.linkTo
        : sideMenus[0]?.linkTo
      dispatch(actions.setCurrentroute(url))
    }
    return <Redirect to={url} />
  }
}

function CommonRoute({ component: Component, ...rest }) {
  const history = useHistory()
  return (
    <Route
      {...rest.routeProps}
      render={({ ...restRouteProps }) => {
        const commonProps = { ...rest, ...restRouteProps }

        if (GetCurrentUser()) {
          if (!rest?.userInfo || !rest?.hotelInfo?.hotelName)
            return <WelcomeLoader msg='CommonRoute' allowUserListener={true} />

          if (rest?.unauthorized) {
            return <Unauthorized {...rest} />
          } else if (rest?.userInfo?.roles?.includes(HotelAdminRole)) {
            return <Redirect to={'/Dashboard'} />
          } else {
            if (!rest.gettingTitleAndPermission) {
              return rest?.sideMenus?.length > 0 ? (
                RedirectToStaff({ history, ...commonProps })
              ) : (
                <WelcomeLoader msg='NOT FOUND' />
              )
            } else {
              return (
                <WelcomeLoader msg='AppRouter 199' allowUserListener={true} />
              )
            }
          }
        }
        return (
          <PublicLayout {...commonProps}>
            <Component {...commonProps}></Component>
          </PublicLayout>
        )
      }}
    />
  )
}

function HotelAdminRoute({ component, ...rest }) {
  const history = useHistory()
  return (
    <Route
      {...rest.routeProps}
      render={({ ...restRouteProps }) => {
        const commonProps = { ...rest, ...restRouteProps }
        if (!GetCurrentUser()) {
          return <Redirect to={`/SignIn/${rest?.subDomain ?? ''}`} />
        }

        if (!rest?.userInfo?.roles || !rest?.hotelInfo?.hotelName)
          return (
            <WelcomeLoader msg='HotelAdminRoute' allowUserListener={true} />
          )

        if (!rest?.userInfo?.roles?.includes(HotelAdminRole)) {
          return (
            rest?.sideMenus?.length > 0 &&
            RedirectToStaff({ history, ...commonProps })
          )
        }

        return (
          <HotelAdminLayout {...commonProps}>
            <Admin component={component} {...commonProps}></Admin>
          </HotelAdminLayout>
        )
      }}
    />
  )
}

function StaffRoute({ component, ...rest }) {
  const RenderCustomRoute = props => {
    if (!GetCurrentUser()) {
      return <Redirect to={`/SignIn/${rest?.subDomain ?? ''}`} />
    }

    if (!rest?.userInfo?.roles || !rest?.hotelInfo?.hotelName)
      return <WelcomeLoader msg='HotelAdminRoute' allowUserListener={true} />

    if (rest?.userInfo?.roles?.includes(HotelAdminRole)) {
      return <Redirect to={'/Dashboard'} />
    }

    return (
      <StaffAdminLayout {...props}>
        <Admin component={component} {...props}></Admin>
      </StaffAdminLayout>
    )
  }
  return (
    <Route
      {...rest.routeProps}
      key={rest?.linkTo}
      path={rest?.linkTo}
      render={restProps => RenderCustomRoute({ ...restProps, ...rest })}
    />
  )
}

function setStaffRoute(route, idx, props) {
  const findData = props?.flatSideMenus?.find(item => {
    return route.path.includes(item.linkTo)
  })

  if (findData)
    return (
      <StaffRoute
        id={idx}
        key={route.path}
        {...props}
        {...route}
        linkTo={route.path}
      />
    )
}

function loadRouteConfig(props) {
  const { flatSideMenus, userInfo, isCustomDepartmentLogin } = props
  const userRoles = userInfo?.roles ?? []
  const isHotelAdminLoggedIn = userInfo?.roles?.includes(HotelAdminRole)
  let routeConfig = routeConstant
    .map((route, idx) => {
      const { path, isAuthenticated, permission, exact } = route
      let rProps = {
        ...{ ...props, ...route },
        routeProps: { exact, path, idx },
      }

      if (isAuthenticated) {
        if (
          userRoles?.length > 0 &&
          GetCurrentUser() &&
          permission !== undefined
        ) {
          if (
            permission?.includes(AuthPermission.STAFF) &&
            (!isHotelAdminLoggedIn || isCustomDepartmentLogin)
          ) {
            return (
              flatSideMenus?.length > 0 && setStaffRoute(route, idx, rProps)
            )
          } else if (
            permission?.includes(AuthPermission.HOTELADMIN) &&
            isHotelAdminLoggedIn
          ) {
            return <HotelAdminRoute key={path} {...rProps} />
          }
        }
      } else {
        return <CommonRoute key={path} {...rProps} />
      }
    })
    .filter(item => {
      return (item !== undefined || item !== null) && item
    })
  return routeConfig
}

const AppRouter = ({ context }) => {
  const dispatch = useDispatch()

  if (GetCurrentUser()?.uid && context.gettingTitleAndPermission) {
    return <WelcomeLoader msg='AppRouter 204' allowUserListener={true} />
  }

  return (
    <BrowserRouter>
      <Switch>{loadRouteConfig({ ...context, dispatch })}</Switch>
    </BrowserRouter>
  )
}

export default AppRouter
