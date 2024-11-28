import React from 'react'
import { closeCommonModal } from '../../../services/requests'
import { commonModalType } from '../../../config/constants'
import { useDispatch, useSelector } from 'react-redux'
import AddComment from '../Comments/AddComment'
import ViewBill from '../../Pages/HouseKeepingServices/ViewBill'
import AddEditOverAllFeedbackQuestion from '../../Pages/HotelInfo/HotelOverAllQuestions/AddEditOverAllFeedbackQuestion'
import AssignTask from '../AssignTask/AssignTask'
import ConfirmDelete from '../ConfirmDelete/ConfirmDelete'
import StaffSuccessModal from '../../Pages/Staff/StaffSuccessModal'
import StatusChangeNotAllowed from '../Comments/StatusChangeNotAllowed'
import ViewComments from '../Comments/ViewComments'
import ViewModal from '../ViewModal'
import ViewStaffHierarchyLog from './../ViewStaffHierarchyLog/index'
import ViewGuestFeedbackModal from '../ViewGuestFeedbackModal'
import ViewAddComments from '../Comments/ViewAddComments'
import YouCannotCancel from '../Comments/YouCannotCancel'

function CommonModal() {
  const dispatch = useDispatch()
  const { commonModalData } = useSelector(state => state)

  const modalConfig = {
    [commonModalType.AddComment]: <AddComment />,
    [commonModalType.EditComment]: <AddComment />,
    [commonModalType.ViewComment]: <ViewComments />,
    [commonModalType.ViewBill]: <ViewBill />, 
    [commonModalType.StatusChangeNotAllowed]: <StatusChangeNotAllowed />,
    [commonModalType.YouCannotCancel]: <YouCannotCancel />,
    [commonModalType.AssignRequest]: <AssignTask />,
    [commonModalType.ViewAddComment]: <ViewAddComments />,
    [commonModalType.ResponseModal]: commonModalData?.data?.response && (
      <StaffSuccessModal
        getSuccessModalMessage={() => commonModalData?.data?.response?.message}
        showSuccessModal={commonModalData.status}
        setShowSuccessModal={() => {
          closeCommonModal(dispatch)
        }}
        resStatus={commonModalData?.data?.response.status}
      />
    ),
    [commonModalType.ViewStaffHierarchy]: <ViewStaffHierarchyLog />,
    [commonModalType.ViewModal]: <ViewModal />,
    [commonModalType.AddEditOverAllFeedbackQuestionModal]: (
      <AddEditOverAllFeedbackQuestion />
    ),
    [commonModalType.ConfirmDelete]: <ConfirmDelete />,
    [commonModalType.ViewHotelFeedback]: <ViewGuestFeedbackModal />,
  }

  if (commonModalData?.status)
    return modalConfig?.[commonModalData.type] || <></>

  return <></>
}

export default CommonModal
