export const filteredByInDate = async (inDate, value) => {
  let inDates = []
  try {
    inDate.forEach(element => {
      if (element.checkedInTime != null) {
        const [, month, day, year] = String(
          element.checkedInTime.toDate()
        ).split(' ')
        let checkedInDates = `${day}-${month}-${year}`
        if (checkedInDates === value) {
          inDates.push(element)
        }
      }
    })
  } catch (error) {
    console.log({ error })
  }
  return inDates
}

export const filteredByOutDate = async (outDate, value) => {
  let outDates = []
  try {
    outDate.forEach(element => {
      if (element.checkedOutTime != null) {
        const [, month, day, year] = String(
          element.checkedOutTime.toDate()
        ).split(' ')
        let checkedOutDates = `${day}-${month}-${year}`
        if (checkedOutDates === value) {
          outDates.push(element)
        }
      }
    })
  } catch (error) {
    console.log({ error })
  }
  return outDates
}
