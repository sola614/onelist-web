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
    const date = timeFormat(time, 'YYYY-MM-DD')
    const nowDate = timeFormat(new Date(), 'YYYY-MM-DD')
    flag = date === nowDate
  }
  return flag
}
export function handleVideoYear(time) {
  return time ? timeFormat(time, 'YYYY') : ''
}