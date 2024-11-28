import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { PDF_FORMAT } from '../../../../../config/constants'

const ExportPdf = ({ column, data, profileData }) => {
  const formatTimestamp = timestamp => {
    if (!timestamp) return ''
    if (timestamp.seconds) {
      return format(new Date(timestamp.seconds * 1000), 'dd/MM/yy, hh:mm a')
    }
    return timestamp
  }

  const calculateTimeTaken = (startTime, completedTime) => {
    if (!startTime || !completedTime) return ''
    const start = startTime.seconds * 1000
    const end = completedTime.seconds * 1000
    const diffInMinutes = Math.floor((end - start) / (1000 * 60))
    return `${Math.floor(diffInMinutes / 60)}:${(diffInMinutes % 60)
      .toString()
      .padStart(2, '0')}`
  }

  const calculateVariance = (requiredTime, timeTaken) => {
    if (!requiredTime || !timeTaken) return ''
    const [reqHours, reqMinutes] = requiredTime.split(':').map(Number)
    const [takenHours, takenMinutes] = timeTaken.split(':').map(Number)
    const reqTotalMins = reqHours * 60 + reqMinutes
    const takenTotalMins = takenHours * 60 + takenMinutes
    return takenTotalMins - reqTotalMins
  }

  // to format data to show in the table
  const formatTableData = row => {
    return column.map(col => {
      switch (col.dataIndex) {
        case 'department':
          return row.department || ''
        case 'service':
          return row.service || ''
        case 'guest':
          return row.guest || ''
        case 'requestedTime':
          return formatTimestamp(row.requestedTime)
        case '': // Request From and Requested By columns
          if (col.title === 'Request From') return row.from || ''
          if (col.title === 'Requested By') return row.createdByName || ''
          return ''
        case 'location':
          return row.isGuestRequest ? row.roomNumber : row.locationName || ''
        case 'assignedToName':
          return row.assignedToName || ''
        case 'startTime':
          return formatTimestamp(row.createdAt)
        case 'completedTime':
          return formatTimestamp(row.completedTime)
        case 'requiredTime':
          return row.requiredTime || ''
        case 'timeTaken':
          return calculateTimeTaken(row.createdAt, row.completedTime)
        case 'variance':
          const timeTaken = calculateTimeTaken(row.createdAt, row.completedTime)
          return calculateVariance(row.requiredTime, timeTaken)
        default:
          return ''
      }
    })
  }

  // function to generate pdf
  const generatePdf = () => {
    const doc = new jsPDF(
      PDF_FORMAT.ORIENTATION,
      PDF_FORMAT.UNIT,
      PDF_FORMAT.PAGE_FORMAT
    )
    const margin = PDF_FORMAT.PAGE_MARGIN
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Add hotel logo in pdf
    if (profileData?.hotelInfo?.hotelLogo) {
      const image = new Image()
      image.src = profileData.hotelInfo.hotelLogo
      image.onload = () => {
        doc.addImage(image, 'JPEG', margin, margin, 50, 50)
      }
    }

    // Hotel Name
    doc.setFontSize(12)
    doc.setFont(PDF_FORMAT.FONT, 'bold')
    doc.setTextColor(...PDF_FORMAT.DARK_GREY) // Using spread operator for array values
    doc.text(
      profileData?.hotelInfo?.hotelName?.toUpperCase() || '',
      margin + 60,
      margin + 27
    )

    // Hotel Address
    doc.setFontSize(11)
    doc.setFont(PDF_FORMAT.FONT, 'normal')
    doc.text(profileData?.hotelInfo?.address || '', margin + 60, margin + 42)

    // Report Title
    doc.setFontSize(10)
    doc.text(profileData?.reportTitle || '', pageWidth / 2, margin + 80, {
      align: 'center',
    })

    // Table Structure and its colors
    autoTable(doc, {
      startY: margin + 100,
      head: [column.map(col => col.title)],
      body: data.map(row => formatTableData(row)),
      styles: {
        fontSize: 7,
        cellPadding: 5,
        lineWidth: 0,
      },
      headStyles: {
        fillColor: PDF_FORMAT.TABLE_HEADER,
        textColor: PDF_FORMAT.TABLE_HEADER_TEXT,
        fontSize: 8,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: PDF_FORMAT.TABLE_ALT_ROW,
      },
      bodyStyles: {
        fillColor: PDF_FORMAT.TABLE_ROW,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
      },
      margin: {
        top: margin,
        right: margin,
        bottom: margin + 30,
        left: margin,
      },
      tableWidth: 'auto',
    })

    // Page numbers
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(...PDF_FORMAT.LIGHT_GREY) // Using spread operator for array values
      doc.text(`${i} / ${pageCount}`, pageWidth / 2, pageHeight - 30, {
        align: 'center',
      })
    }

    return doc
  }

  return generatePdf()
}

export default ExportPdf
