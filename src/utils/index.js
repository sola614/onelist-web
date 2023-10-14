export function timeFormat(time, format) {
  var date = new Date(time)
  var y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate(),
    h = date.getHours(),
    mm = date.getMinutes(),
    s = date.getSeconds()
  if (format.indexOf('hh') > -1) {
    h = h >= 10 ? h : '0' + h
  }
  if (format.indexOf('mm') > -1) {
    mm = mm >= 10 ? mm : '0' + mm
  }
  if (format.indexOf('ss') > -1) {
    s = s >= 10 ? s : '0' + s
  }
  return format
    .replace(/YYYY/, y)
    .replace(/MM/, m)
    .replace(/DD/, d)
    .replace(/hh/, h)
    .replace(/h/, h)
    .replace(/mm/, mm)
    .replace(/m/, mm)
    .replace(/ss/, s)
    .replace(/s/, s)
}
export function handleShowNewBadge(time) {
  let flag = false

  if (time) {
    // 更新24小时内都算新
    const time2 = new Date(time).getTime()
    const nowTime = new Date().getTime()
    flag = time2 + 24 * 60 * 60 * 1000 > nowTime
  }
  return flag
}
export function handleVideoYear(time) {
  return time ? timeFormat(time, 'YYYY') : ''
}

export function handleGetCreditsById(id, gallery_type = 'tv') {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer XXX'
    }
  };

  return fetch(`https://api.themoviedb.org/3/${gallery_type}/${id}/credits?language=zh-CN`, options)
    .then(response => response.json())
}
