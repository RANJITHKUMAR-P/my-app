import { defaultPageSize } from './constants'

const actionTypes = {
  setData: 'setData',
  setFetching: 'setFetching',
  setGoNext: 'setGoNext',
  setGoPrev: 'setGoPrev',
  setPage: 'setPage',
  Reset: 'Reset',
  UpdateData: 'UpdateData',
}

const initialState = {
  data: {},
  page: 1,
  snapshotDocs: [],
  fetchingData: false,
}

export const GetInitialState = () => ({
  ...initialState,
  data: {},
  snapshotDocs: [],
})

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.setData: {
      let { requests, snapshotDocs } = action.payload
      const page = state.page
      const newState = { ...state }
      if (page === 1) {
        newState.data[page] = requests.slice(0, defaultPageSize)
        newState.snapshotDocs[page] = snapshotDocs[defaultPageSize - 1]

        newState.data[page + 1] = requests.slice(defaultPageSize)
        newState.snapshotDocs[page + 1] = snapshotDocs[defaultPageSize * 2 - 1]
      } else {
        newState.data[page + 1] = requests
        newState.snapshotDocs[page + 1] = snapshotDocs[defaultPageSize - 1]
      }
      newState.fetchingData = false
      return newState
    }
    case actionTypes.setFetching: {
      const newState = { ...state }
      newState.fetchingData = action.payload
      return newState
    }
    case actionTypes.setGoNext: {
      const newState = { ...state }
      newState.page = state.page + 1
      return newState
    }
    case actionTypes.setGoPrev: {
      const newState = { ...state }
      if (newState.page > 1) {
        newState.page -= 1
      }
      return newState
    }
    case actionTypes.setPage: {
      const newState = { ...state }
      newState.page = action.payload
      return newState
    }
    case actionTypes.Reset: {
      return GetInitialState()
    }
    case actionTypes.UpdateData: {
      // for updating status
      const newState = { ...state }
      return { ...newState, data: action.payload }
    }
    default: {
      return state
    }
  }
}

export const GetActionsHelper = dispatch => ({
  ResetData: () => dispatch({ type: actionTypes.Reset }),
  GoNext: () => dispatch({ type: actionTypes.setGoNext }),
  GoPrev: () => dispatch({ type: actionTypes.setGoPrev }),
  SetFetching: fetching =>
    dispatch({ type: actionTypes.setFetching, payload: fetching }),
  SetData: ({ requests, snapshotDocs }) =>
    dispatch({
      type: actionTypes.setData,
      payload: { requests, snapshotDocs },
    }),
  UpdateData: data => dispatch({ type: actionTypes.UpdateData, payload: data }),
})

export const GetFetchDataOptions = archiveState => {
  const nextPageData =
    (archiveState.data[archiveState.page + 1]?.length ?? 0) > 0
  const fisrtPageDataNotAvailable = (archiveState.data[1]?.length ?? 0) === 0
  let startAfter = null
  let continueFetching = true
  if ((archiveState.page === 1 && fisrtPageDataNotAvailable) || !nextPageData) {
    if (archiveState.page > 1) {
      startAfter = archiveState.snapshotDocs[archiveState.page]
      if (!startAfter) {
        continueFetching = false
      }
    }
  }
  return { startAfter, continueFetching }
}

export const commonTableProps = ({
  GoPrev,
  GoNext,
  fetchingData,
  data,
  page,
}) => ({
  previous: GoPrev,
  next: GoNext,
  disableNext: fetchingData || (data[page + 1]?.length ?? 0) === 0,
  disablePrev: fetchingData || page === 1,
})
