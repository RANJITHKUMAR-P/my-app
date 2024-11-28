import Chart from 'chart.js'
import { jsPDF } from 'jspdf'

// Function to generate random colors
// Function to generate a random vibrant color without repetition
const generateRandomColor = (() => {
  const generatedColors = new Set() // To keep track of generated colors

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'

    // Generate a random RGB color with high saturation and brightness
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }

    return color
  }

  const isVibrant = color => {
    // Convert hex color to HSL
    const hexToHsl = hex => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b
      })

      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      const r = parseInt(result[1], 16) / 255
      const g = parseInt(result[2], 16) / 255
      const b = parseInt(result[3], 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)

      let h,
        s,
        l = (max + min) / 2

      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }

        h /= 6
      }

      return { h, s, l }
    }

    // Check if the color is vibrant (high saturation and brightness)
    const { h, s, l } = hexToHsl(color)
    return s > 0.7 && l > 0.7 // Adjust saturation and brightness thresholds as needed
  }

  return () => {
    let color
    do {
      color = getRandomColor()
    } while (!isVibrant(color) || generatedColors.has(color))

    generatedColors.add(color) // Add the generated color to the set
    return color
  }
})()

// Function to calculate percentages
export const calculatePercentage = (value, total) => {
  return ((value / total) * 100).toFixed(2) + '%'
}

// Function to create chart canvas
export const createChartCanvas = (type, data, options) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const chart = new Chart(ctx, { type, data, options })
  return { canvas, chart }
}

// Function to generate a pie chart
export const generatePieChart = (
  title,
  labels,
  dataValues,
  backgroundColors,
  percentages
) => {
  const labelsWithPercentage = labels.map(
    (label, index) => `${label} (${percentages[index]})`
  )

  const pieData = {
    labels: labelsWithPercentage,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1,
      },
    ],
  }

  const pieChartOptions = {
    title: {
      display: true,
      text: title,
      fontSize: 40,
      padding: 100,
    },
    legend: {
      labels: {
        fontSize: 26,
      },
      position: 'right',
    },
    layout: {
      padding: {
        left: 50, // Adjust the left padding to create space for the chart
        right: 150, // Adjust the right padding to create space for the legend
      },
    },
  }

  return createChartCanvas('pie', pieData, pieChartOptions)
}

// Function to generate a bar chart
export const generateBarChart = (
  title,
  labels,
  dataValues,
  backgroundColors
) => {
  const barData = {
    labels: labels,
    datasets: [
      {
        label: dataValues,
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1,
      },
    ],
  }

  const barChartOptions = {
    title: {
      display: true,
      text: title,
      fontSize: 40,
      padding: 50,
    },
    legend: {
      labels: {
        fontSize: 26,
      },
      display: false,
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'No of Requests',
            fontSize: 23,
          },
          ticks: {
            beginAtZero: true,
            fontSize: 23,
          },
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Service Name',
            fontSize: 23,
          },
          ticks: {
            fontSize: 23,
          },
        },
      ],
    },
  }

  return createChartCanvas('bar', barData, barChartOptions)
}

// Function to generate a horizontal bar chart
export const generateHorizontalBarChart = (
  title,
  labels,
  dataValues,
  backgroundColors
) => {
  const horizontalBarChartData = {
    labels: labels,
    datasets: [
      {
        label: dataValues,
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1,
      },
    ],
  }

  const horizontalBarChartOptions = {
    title: {
      display: true,
      text: title,
      fontSize: 40,
      padding: 50,
    },
    legend: {
      labels: {
        fontSize: 26,
      },
      display: false,
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Number of Requests',
            fontSize: 23,
          },
          ticks: {
            fontSize: 23,
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Time Taken',
            fontSize: 23,
          },
          ticks: {
            fontSize: 23,
          },
        },
      ],
    },
  }

  return createChartCanvas(
    'horizontalBar',
    horizontalBarChartData,
    horizontalBarChartOptions
  )
}

// Function to create chart canvas for Gantt chart
export const generateGanttChart = (
  title,
  labels,
  requestedFroms,
  statuses,
  backgroundColors
) => {
  // Define chart data
  const ganttData = {
    labels: labels,
    datasets: [
      {
        label: 'Requested From',
        data: requestedFroms,
        backgroundColor: backgroundColors[0],
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Status',
        data: statuses,
        backgroundColor: backgroundColors[1],
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  }

  // Define chart options
  const ganttOptions = {
    title: {
      display: true,
      text: title,
      fontSize: 40,
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  }

  return createChartCanvas('bar', ganttData, ganttOptions)
}

export const generateChart = (
  type,
  title,
  labels,
  dataValues,
  backgroundColors,
  percentages
) => {
  let canvas
  switch (type) {
    case 'pie':
      canvas = generatePieChart(
        title,
        labels,
        dataValues,
        backgroundColors,
        percentages
      )
      break
    case 'bar':
      canvas = generateBarChart(title, labels, dataValues, backgroundColors)
      break
    case 'horizontalBar':
      canvas = generateHorizontalBarChart(
        title,
        labels,
        dataValues,
        backgroundColors
      )
      break
    default:
      console.error('Unsupported chart type')
      canvas = null
  }
  return canvas
}

export const mergeCanvases = async (
  chartCanvases,
  reportTitle,
  chartContent,
  fileName,
  dateRangeString
) => {
  const pdf = new jsPDF()

  const docWidth = pdf.internal.pageSize.getWidth()
  const docHeight = pdf.internal.pageSize.getHeight()

  let currentHeight = 30
  let titleWithDate = reportTitle
  if (dateRangeString) {
    titleWithDate = `${reportTitle} (${dateRangeString})`
  }
  // Center-align the report title
  const titleWidth =
    (pdf.getStringUnitWidth(titleWithDate) * pdf.internal.getFontSize()) /
    pdf.internal.scaleFactor
  const titleX = (docWidth - titleWidth) / 2
  pdf.setFontSize(16) // Set font size for the title
  pdf.text(titleWithDate, titleX, currentHeight) // Position the title in the center

  chartCanvases.forEach(({ canvas, title }, index) => {
    if (index > 0 && currentHeight + 150 > docHeight) {
      pdf.addPage()
      currentHeight = 30
    }

    if (chartContent[index]) {
      const content = chartContent[index]
      let contentLines = pdf.splitTextToSize(content, 180) // Split content into lines with a maximum width
      let lineHeight = 5 // Initial line height

      // Calculate the total height required for the content
      let totalContentHeight = contentLines.length * lineHeight

      // Calculate a new font size to fit the content within the available space
      const maxFontSize = 12 // Maximum font size
      const minFontSize = 8 // Minimum font size
      let fontSize = maxFontSize
      const maxContentHeight = docHeight - currentHeight - 150 // Maximum height for content
      const contentWidth = 180 // Width of the content area

      while (fontSize >= minFontSize) {
        pdf.setFontSize(fontSize)
        lineHeight = fontSize * 0.7 // Adjust line height based on font size
        contentLines = pdf.splitTextToSize(content, contentWidth)
        totalContentHeight = contentLines.length * lineHeight

        if (totalContentHeight <= maxContentHeight) {
          break
        }

        fontSize-- // Reduce font size until content fits
      }

      // Render the content lines
      contentLines.forEach((line, i) => {
        pdf.text(line, 10, currentHeight + 30 + i * lineHeight)
      })

      currentHeight += totalContentHeight + 20 // Adjusted height for spacing between content and chart
    }

    pdf.addImage(
      canvas.chart.toBase64Image(), // Use Chart.js chart object to generate image data URL
      'PNG',
      10,
      currentHeight + 30, // Adjusted height to leave space for title and content
      180,
      90
    )

    currentHeight += 150 // Adjusted height for spacing between charts
  })

  pdf.save(`${fileName}.pdf`)
}

export const chartConfigurations = data => ({
  1: {
    reportTitle: 'Request Summary Graphical Report',
    chartTitles: [
      'Distribution of Requests Received by All Departments',
      'Top Services in Department',
      'Extra time taken by staff to complete job Request',
    ],
    chartContent: [
      'Distribution of Requests received by each Departments. This pie chart illustrates the proportion of requests received by each department, providing insights into departmental workload distribution.',
      'Top 5 Services Handled by each Department. This bar chart showcases the most frequently requested services across all departments, helping identify high-demand services.',
      // 'Extra Time Taken to Complete Requests. This horizontal bar chart displays the extra time taken to fulfill each request, aiding in understanding request processing efficiency.',
    ],
    chartTypes: ['pie', 'bar', 'horizontalBar'],
    generateChartData: async data => {
      const pieChartData = await generateDepartmentGraphicalSummaryReport(data)
      const barChartData = await generateReportSummaryServiceVsDepartment(data)
      Object.keys(barChartData).forEach(departmentName => {
        const { labels, dataValues, backgroundColors } =
          barChartData[departmentName]

        barChartData[departmentName] = {
          labels,
          dataValues,
          backgroundColors,
        }
      })
      const horizontalChartData = await generateRequestTimeSummary(data)

      return {
        chartData: [pieChartData, barChartData, horizontalChartData],
      }
    },
  },
  2: {
    reportTitle: 'Request Response Graphical Report ',
    chartTitles: ['All Departments Data'],
    chartContent: [
      'Distribution of Response Time taken by staff to start a job request. The visualisation provides insights into the efficiency of response times across different request durations, helping to identify areas for improvement and optimise response strategies.',
    ],

    chartTypes: ['horizontalBar'],
    generateChartData: async data => {
      const horizontalBarChartData = await generateRequestResponseChart(data)

      return {
        chartData: [horizontalBarChartData],
      }
    },
  },
  3: {
    reportTitle: 'Request Status Graphical Report',
    chartTitles: ['Distribution of Requests by Status'],
    chartContent: [
      'Distribution of job requests by Status. This pie chart illustrates the proportion of requests based on their status in each department, providing insights into the distribution of request status across departments.',
    ],
    chartTypes: ['pie'],
    generateChartData: async data => {
      const departmentStatusData = await generateRequestStatus(data)
      const chartData = {}

      // Iterate through each department
      Object.keys(departmentStatusData).forEach(departmentName => {
        const { labels, dataValues, backgroundColors, percentages } =
          departmentStatusData[departmentName]

        chartData[departmentName] = {
          labels,
          dataValues,
          backgroundColors,
          percentages,
        }
      })

      return { chartData }
    },
  },
  4: {
    reportTitle: 'Scheduled Task Graphical Report',
    chartTitles: [
      'Distribution of Scheduled and planned Requests in Gantt chart',
    ],
    chartContent: [
      'Distribution of Scheduled and planned Requests. This bar chart showcases the most frequently requested services across all departments, helping identify high-demand services.',
    ],
    chartTypes: ['bar'],
    generateChartData: async data => {
      const departmentTasksData =
        await generateReportSummaryServiceVsDepartment(data)

      Object.keys(departmentTasksData).forEach(departmentName => {
        const { labels, dataValues, backgroundColors } =
          departmentTasksData[departmentName]

        departmentTasksData[departmentName] = {
          labels,
          dataValues,
          backgroundColors,
        }
      })

      return {
        chartData: [departmentTasksData],
      }
    },
  },

  6: {
    reportTitle: 'Request Usage Graphical Report',
    chartTitles: ['Distribution of Requests by Usage'],
    chartContent: [
      'Distribution of Requests by Usage. This pie chart illustrates the proportion of requests based on their Usage in each department, providing insights into the distribution of request Usage across departments.',
    ],
    chartTypes: ['pie'],
    generateChartData: async data => {
      const departmentStatusData = await generateRequestUsage(data)
      const chartData = {}

      // Iterate through each department
      Object.keys(departmentStatusData).forEach(departmentName => {
        const { labels, dataValues, backgroundColors, percentages } =
          departmentStatusData[departmentName]

        chartData[departmentName] = {
          labels,
          dataValues,
          backgroundColors,
          percentages,
        }
      })
      return { chartData }
    },
  },
})

export const generateDepartmentGraphicalSummaryReport = async res => {
  try {
    const departmentCounts = {}
    let totalRequests = 0

    // Check if the response is an array
    if (!Array.isArray(res)) {
      throw new Error('Response data is not in the expected format')
    }

    // Count the number of requests per department
    res.forEach(request => {
      const department = request.department
      departmentCounts[department] = (departmentCounts[department] || 0) + 1
      totalRequests++
    })

    // Sort departments based on the number of requests they handle
    const sortedDepartments = Object.keys(departmentCounts).sort(
      (a, b) => departmentCounts[b] - departmentCounts[a]
    )

    // Get top departments (e.g., top 5)
    const topDepartments = sortedDepartments.slice(0, 5) // Adjust the number of top departments as needed

    // Extract data for top departments
    const topDepartmentCounts = {}
    topDepartments.forEach(department => {
      topDepartmentCounts[department] = departmentCounts[department]
    })

    // Prepare data for pie chart
    const labels = Object.keys(topDepartmentCounts)
    const dataValues = Object.values(topDepartmentCounts)
    const backgroundColors = labels.map(() => generateRandomColor())
    const percentages = dataValues.map(count =>
      calculatePercentage(count, totalRequests)
    )

    return { labels, dataValues, backgroundColors, percentages }
  } catch (error) {
    console.error('Error fetching or processing data:', error)
    return null // Or handle the error appropriately
  }
}

const generateReportSummaryServiceVsDepartment = async requests => {
  try {
    const topServicesPerDepartment = {}

    // Iterate over the array of requests
    requests.forEach(request => {
      const department = request.department
      const service = request.service

      // Check if the department is already in the topServicesPerDepartment object
      if (!topServicesPerDepartment[department]) {
        // If not, add it with an empty object to store service counts
        topServicesPerDepartment[department] = {}
      }

      // Increment the count for the service within the department
      topServicesPerDepartment[department][service] =
        (topServicesPerDepartment[department][service] || 0) + 1
    })

    // Prepare data for bar charts for each department
    const departmentData = {}
    Object.entries(topServicesPerDepartment).forEach(
      ([department, servicesCount]) => {
        const sortedServices = Object.keys(servicesCount).sort(
          (a, b) => servicesCount[b] - servicesCount[a]
        )

        // Extract top 5 services for the department
        const labels = Array.from(
          { length: 5 },
          (_, index) => sortedServices[index] || ''
        )
        const dataValues = labels.map(service => servicesCount[service] || 0)
        const backgroundColors = Array.from({ length: 5 }, () =>
          generateRandomColor()
        )

        departmentData[department] = {
          labels,
          dataValues,
          backgroundColors,
        }
      }
    )

    return departmentData
  } catch (error) {
    console.error('Error fetching or processing data:', error)
    return null // Or handle the error appropriately
  }
}
export const generateRequestTimeSummary = async requests => {
  const varianceIntervals = {
    '0-5 mins': 0,
    '5-10 mins': 0,
    '10-15 mins': 0,
    '15-20 mins': 0,
    '20-25 mins': 0,
    '25-30 mins': 0,
    '30+ mins': 0,
  }

  // Iterate over the array of requests
  requests.forEach(request => {
    const { statistics } = request

    if (
      statistics &&
      statistics.newVarianceStr !== undefined &&
      statistics.newVarianceStr !== ''
    ) {
      // Splitting newVarianceStr into hours and minutes
      const [hours, minutes] = statistics.newVarianceStr.split(':').map(Number)

      // Calculate the total variance in minutes
      const totalMinutes = hours * 60 + minutes

      // Categorize the variance into intervals of 5 minutes
      const interval = Math.floor(totalMinutes / 5) * 5 // Round down to the nearest 5-minute interval

      if (interval < 30) {
        varianceIntervals[`${interval}-${interval + 5} mins`]++ // Update the count based on the interval
      } else {
        varianceIntervals['30+ mins']++ // If over 30 minutes, update the count for the '30+ mins' interval
      }
    }
  })

  // Prepare data for the horizontal bar chart
  const labels = Object.keys(varianceIntervals)
  const dataValues = Object.values(varianceIntervals)
  const backgroundColors = labels.map(() => generateRandomColor())

  return { labels, dataValues, backgroundColors }
}

export const generateRequestStatus = async requests => {
  try {
    const departmentStatusCounts = {} // Object to store status counts for each department

    // Iterate through each request
    requests.forEach(request => {
      const departmentName = request.department
      const requestStatus = request.status

      // Initialize status count object for the department if it doesn't exist
      if (!departmentStatusCounts[departmentName]) {
        departmentStatusCounts[departmentName] = {}
      }

      // Increment status count for the department
      departmentStatusCounts[departmentName][requestStatus] =
        (departmentStatusCounts[departmentName][requestStatus] || 0) + 1
    })

    // Prepare data for pie charts for each department
    const departmentData = {}
    Object.keys(departmentStatusCounts).forEach(departmentName => {
      const statusCount = departmentStatusCounts[departmentName]
      const totalCount = Object.values(statusCount).reduce(
        (acc, val) => acc + val,
        0
      )

      const labels = Object.keys(statusCount)
      const dataValues = labels.map(status => statusCount[status])
      const backgroundColors = labels.map(() => generateRandomColor())
      const percentages = dataValues.map(count =>
        calculatePercentage(count, totalCount)
      )

      departmentData[departmentName] = {
        labels,
        dataValues,
        backgroundColors,
        percentages,
      }
    })

    return departmentData
  } catch (error) {
    console.error('Error fetching or processing data:', error)
    return null // Or handle the error appropriately
  }
}

export const generateRequestResponseChart = async requests => {
  const timeIntervals = {
    '0-5 mins': 0,
    '5-10 mins': 0,
    '10-15 mins': 0,
    '15-20 mins': 0,
    '20-25 mins': 0,
    '25-30 mins': 0,
    '30+ mins': 0,
  }

  let totalRequests = 0

  // Iterate over the array of requests
  requests.forEach(request => {
    const { createdAt, startTime } = request

    if (createdAt && createdAt.seconds && startTime && startTime.seconds) {
      const startTimestamp =
        startTime.seconds * 1000 + startTime.nanoseconds / 1000000
      const createdAtTimestamp =
        createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000
      const elapsedTimeMilliseconds = startTimestamp - createdAtTimestamp
      const elapsedTimeMinutes = Math.floor(
        elapsedTimeMilliseconds / (1000 * 60)
      )

      const interval = Math.floor(elapsedTimeMinutes / 5) * 5

      if (interval < 30) {
        timeIntervals[`${interval}-${interval + 5} mins`]++
      } else {
        timeIntervals['30+ mins']++
      }
      totalRequests++
    }
  })

  // Prepare data for the horizontal bar chart
  const labels = Object.keys(timeIntervals)
  const dataValues = Object.values(timeIntervals)
  const backgroundColors = labels.map(() => generateRandomColor())

  return { labels, dataValues, backgroundColors }
}

export const generateRequestUsage = async requests => {
  try {
    const departmentData = {}

    // Iterate through each request
    requests.forEach(request => {
      const departmentName = request.department

      // Initialize department data if not already exists
      if (!departmentData[departmentName]) {
        departmentData[departmentName] = {
          requestCount: 0,
          raisedCount: 0,
          completedCount: 0,
        }
      }

      // Add counts if available
      departmentData[departmentName].requestCount +=
        request.totalRequestCount || 0
      departmentData[departmentName].raisedCount +=
        request.totalRaisedCount || 0
      departmentData[departmentName].completedCount +=
        request.totalCompletedCount || 0
    })

    // Prepare data for pie charts for each department
    const departmentPieData = {}
    Object.keys(departmentData).forEach(departmentName => {
      const { requestCount, raisedCount, completedCount } =
        departmentData[departmentName]

      departmentPieData[departmentName] = {
        labels: [
          'Requests Count',
          'Raised Request Count',
          'Completed Request Count',
        ],
        dataValues: [requestCount, raisedCount, completedCount],
        backgroundColors: [
          generateRandomColor(),
          generateRandomColor(),
          generateRandomColor(),
        ],
        percentages: [requestCount, raisedCount, completedCount],
      }
    })

    return departmentPieData
  } catch (error) {
    console.error('Error fetching or processing data:', error)
    return null // Or handle the error appropriately
  }
}

const generateScheduledTasksData = async requests => {
  try {
    const departmentTasks = {} // Object to store tasks for each department

    // Iterate through each task
    requests.forEach(request => {
      const departmentName = request.department

      // Initialize tasks array for the department if it doesn't exist
      if (!departmentTasks[departmentName]) {
        departmentTasks[departmentName] = []
      }

      // Push task to the tasks array for the department
      const date = new Date(request.requestedDate.seconds * 1000)
      const month = date.getMonth() // Month index (0-11)

      // Determine background color based on status
      let backgroundColor
      switch (request.status) {
        case 'completed':
          backgroundColor = 'green' // Completed tasks
          break
        case 'in progress':
          backgroundColor = 'yellow' // Tasks in progress
          break
        case 'pending':
          backgroundColor = 'red' // Pending tasks
          break
        default:
          backgroundColor = 'gray' // Default color for other statuses
      }

      const task = {
        serviceName: request.service,
        month: month,
        status: request.status,
        backgroundColor: backgroundColor, // Background color based on status
      }

      departmentTasks[departmentName].push(task)
    })

    // Prepare data for the graph for each department
    const departmentData = {}
    Object.keys(departmentTasks).forEach(departmentName => {
      const tasks = departmentTasks[departmentName]
      const taskMap = {} // Map to store tasks for each month

      tasks.forEach(task => {
        const key = task.month // Unique key for each month
        if (!taskMap[key]) {
          taskMap[key] = []
        }
        taskMap[key].push(task)
      })

      const graphData = []
      Object.keys(taskMap).forEach(key => {
        const tasksInMonth = taskMap[key]
        const month = parseInt(key) + 1 // Month index is zero-based

        const taskData = tasksInMonth.map(task => ({
          serviceName: task.serviceName,
          month: month,
          status: task.status,
          backgroundColor: task.backgroundColor,
        }))

        graphData.push({
          month: month,
          tasks: taskData,
        })
      })

      departmentData[departmentName] = graphData
    })

    return departmentData
  } catch (error) {
    console.error('Error fetching or processing data:', error)
    return null // Or handle the error appropriately
  }
}
