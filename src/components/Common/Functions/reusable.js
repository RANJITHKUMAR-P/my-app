export let getParameterByName = function (fName) {
  const url_string = window.location.href
  const url = new URL(url_string)
  return url.searchParams.get(fName) || ''
}

export let getQueryParams = name => {
  let queryParams = {}

  window.location.search
    ?.replace('?', '')
    ?.split('&')
    ?.forEach(item => {
      let keyValuePair = item.split('=')
      let key = keyValuePair[0]
      let value = keyValuePair[1]
      queryParams[key] = value
    })

  return name ? queryParams?.[name] ?? "" : queryParams
}
