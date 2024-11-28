import { isFilterValueSelected } from '../../../../config/utils'

export default class StaffHelper {
  static filterUsers = (
    titleAndPermission,
    sortedUsers,
    {
      filteredName,
      filteredDept,
      departmentFilterLabel,
      filteredStatus,
      statusFilterLabel,
      filteredManager,
      managerFilterLabel,
    },
    translateTextI18N
  ) => {
    if (!titleAndPermission.length) return
    let activeUsers = [...sortedUsers].map(u => {
      const titleId = u.roles[0]
      const title = titleAndPermission.find(obj => obj.id === titleId)?.title
      return {
        ...u,
        title: translateTextI18N(title),
        department: translateTextI18N(u.department),
      }
    })
    let currentfilteredUser = [...activeUsers]

    if (filteredName && filteredName !== '')
      currentfilteredUser = currentfilteredUser.filter(user =>
        user.name.toLowerCase().includes(filteredName.toLowerCase())
      )
    if (isFilterValueSelected(filteredDept, departmentFilterLabel))
      currentfilteredUser = currentfilteredUser.filter(
        user => user.departmentId === filteredDept
      )
    if (isFilterValueSelected(filteredStatus, statusFilterLabel))
      currentfilteredUser = currentfilteredUser.filter(
        user => user.status === filteredStatus
      )

    if (isFilterValueSelected(filteredManager, managerFilterLabel))
      currentfilteredUser = currentfilteredUser.filter(
        user =>
          user?.managers &&
          Object.values(user.managers)
            .map(i => i.name.toLowerCase())
            .includes(filteredManager.toLowerCase())
      )
    const activeUserList = activeUsers.filter(user => user.status === 'active')
    return {
      activeUser: activeUsers.length,
      activeUserList,
      currentfilteredUser,
    }
  }
}
