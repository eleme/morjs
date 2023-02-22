import { FORMATE_MAP, NEED_DEFAULT_VALUE, PROPERTY } from './constants'

export const isContain = (format) => (param) => {
  return format.indexOf(param) > -1
}

export const onlyTime = (format) =>
  format === FORMATE_MAP[1] || format === FORMATE_MAP[5]

const isUndefined = (value) => typeof value === 'undefined'

const toFixed = (value) => (String(value).length <= 1 ? `0${value}` : value)

export const getListValue = (obj, index) => {
  if (Array.isArray(obj.list)) return parseInt(obj.list[index])
}

export const buildResult = ({ year, month, day, hour, minute, format }) => {
  const onlyHasTime = onlyTime(format)
  const contains = isContain(format)
  let result = ''

  if (onlyHasTime) {
    result += `${toFixed(hour)}:${toFixed(minute)}`
  } else {
    if (!isUndefined(year)) result += toFixed(year)
    if (!isUndefined(month)) result += `-${toFixed(month)}`
    if (!isUndefined(day)) result += `-${toFixed(day)}`
    if (!isUndefined(hour)) result += ` ${toFixed(hour)}`
    if (!isUndefined(minute)) result += `:${toFixed(minute)}`
  }

  if (contains('ss')) result += `:00`
  return result
}

const needDefault = (param) => param === NEED_DEFAULT_VALUE

export const generateList = (start, end, unit = '') => {
  const list = []

  for (let item = Number(start); item <= Number(end); item++) {
    list.push(item + unit)
  }

  return list
}

export const generateYears = ({ start, end, current }) => {
  let { year: startYear } = start
  let { year: endYear } = end
  const { year: currentYear } = current
  const GAP = 10

  if (!startYear && !endYear) return {}
  if (needDefault(startYear) && needDefault(endYear)) {
    startYear = currentYear - GAP
    endYear = currentYear + GAP
  } else if (needDefault(startYear))
    startYear = currentYear - (endYear - currentYear)
  else if (needDefault(endYear))
    endYear = currentYear + (currentYear - startYear)

  start.year = startYear
  end.year = endYear
  const index = currentYear - startYear

  return {
    list: generateList(startYear, endYear, '年'),
    currentIndex: index > 0 ? index : 0
  }
}

export const generateMonths = ({ start, end, current }) => {
  const INIT_START = 1,
    INIT_END = 12
  const { year: startYear, month: startMonth } = start
  const { year: endYear, month: endMonth } = end
  const { year: currentYear, month: currentMonth } = current
  let currentStart, currentEnd

  const validMonth = (month) => month >= INIT_START && month <= INIT_END

  if (!startMonth && !endMonth) return {}

  if (needDefault(startMonth)) {
    currentStart = INIT_START
    start.month = currentStart
  } else {
    if (startYear === currentYear && validMonth(startMonth))
      currentStart = startMonth
    else currentStart = INIT_START
  }

  if (needDefault(endMonth)) {
    currentEnd = INIT_END
    end.month = INIT_END
  } else {
    if (endYear === currentYear && validMonth(endMonth)) currentEnd = endMonth
    else currentEnd = INIT_END
  }

  const index = currentMonth - currentStart

  return {
    list: generateList(currentStart, currentEnd, '月'),
    currentIndex: index > 0 ? index : 0
  }
}

export const getDays = (year, month) => {
  year = parseInt(year)
  month = parseInt(month)

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const FebDays = isLeapYear ? 29 : 28
  const monthDays = [-1, 31, FebDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  return monthDays[Number(month)]
}

export const generateDays = ({ start, end, current }) => {
  const INIT_DAY = 1
  const { year: startYear, month: startMonth, day: startDay } = start
  const { year: endYear, month: endMonth, day: endDay } = end
  const { year: currentYear, month: currentMonth, day: currentDay } = current
  const currentMonthDays = getDays(currentYear, currentMonth)
  let currentStart, currentEnd

  const validDay = (day) => day >= INIT_DAY && day <= currentMonthDays

  if (!startDay && !endDay) return {}
  if (needDefault(startDay)) {
    currentStart = INIT_DAY
    start.day = INIT_DAY
  } else {
    if (
      currentYear === startYear &&
      currentMonth === startMonth &&
      validDay(startDay)
    )
      currentStart = startDay
    else currentStart = INIT_DAY
  }

  if (needDefault(endDay)) {
    currentEnd = currentMonthDays
    end.day = currentMonthDays
  } else {
    if (
      currentYear === endYear &&
      currentMonth === endMonth &&
      validDay(endDay)
    )
      currentEnd = endDay
    else currentEnd = currentMonthDays
  }

  const index = currentDay - currentStart
  return {
    list: generateList(currentStart, currentEnd, '日'),
    currentIndex: index > 0 ? index : 0
  }
}

export const generateHours = ({ start, end, current }) => {
  const INIT_START = 0,
    INIT_END = 23
  const {
    year: startYear,
    month: startMonth,
    day: startDay,
    hour: startHour
  } = start
  const { year: endYear, month: endMonth, day: endDay, hour: endHour } = end
  const {
    year: currentYear,
    month: currentMonth,
    day: currentDay,
    hour: currentHour
  } = current
  const validHour = (hour) => hour >= INIT_START && hour <= INIT_END
  let currentStart, currentEnd

  if (!startHour && !endHour) return {}

  if (needDefault(startHour)) {
    currentStart = INIT_START
    start.hour = INIT_START
  } else {
    if (
      (startYear &&
        endYear &&
        currentYear === startYear &&
        currentMonth === startMonth &&
        currentDay === startDay &&
        validHour(startHour)) ||
      (!startYear && !endYear)
    ) {
      currentStart = startHour
    } else currentStart = INIT_START
  }

  if (needDefault(endHour)) {
    currentEnd = INIT_END
    end.hour = INIT_END
  } else {
    if (
      (validHour(endHour) &&
        startYear &&
        endYear &&
        currentYear === endYear &&
        currentMonth === endMonth &&
        currentDay === endDay) ||
      (!startYear && !endYear)
    ) {
      currentEnd = endHour
    } else currentEnd = INIT_END
  }

  const index = currentHour - currentStart

  return {
    list: generateList(currentStart, currentEnd, '时'),
    currentIndex: index > 0 ? index : 0
  }
}

export const generateMinutes = ({ start, end, current }) => {
  const INIT_START = 0,
    INIT_END = 59
  const {
    year: startYear,
    month: startMonth,
    day: startDay,
    hour: startHour,
    minute: startMinute
  } = start
  const {
    year: endYear,
    month: endMonth,
    day: endDay,
    hour: endHour,
    minute: endMinute
  } = end
  const {
    year: currentYear,
    month: currentMonth,
    day: currentDay,
    hour: currentHour,
    minute: currentMinute
  } = current

  const validMinute = (minute) => minute >= INIT_START && minute <= INIT_END
  let currentStart, currentEnd

  if (!startMinute && !endMinute) return {}
  if (needDefault(startMinute)) {
    currentStart = INIT_START
    start.minute = INIT_START
  } else {
    if (
      validMinute(startMinute) &&
      currentHour === startHour &&
      ((startYear &&
        endYear &&
        currentYear === startYear &&
        currentMonth === startMonth &&
        currentDay === startDay) ||
        (!startYear && !endYear))
    ) {
      currentStart = startMinute
    } else {
      currentStart = INIT_START
    }
  }

  if (needDefault(endMinute)) {
    currentEnd = INIT_END
    end.minute = INIT_END
  } else {
    if (
      validMinute(endMinute) &&
      currentHour === endHour &&
      ((startYear &&
        endYear &&
        currentYear === endYear &&
        currentMonth === endMonth &&
        currentDay === endDay) ||
        (!startYear && !endYear))
    ) {
      currentEnd = endMinute
    } else {
      currentEnd = INIT_END
    }
  }

  const index = currentMinute - currentStart
  return {
    list: generateList(currentStart, currentEnd, '分'),
    currentIndex: index > 0 ? index : 0
  }
}

const parse = (param: string, regex: RegExp) => {
  try {
    const matchResult = param.match(regex)
    return matchResult && Number(matchResult[1])
  } catch (e) {
    console.log(`日期格式化错误：${e}`)
  }
}

const parseYear = (param = '') => {
  return parse(param, new RegExp('^(\\d{4})')) || NEED_DEFAULT_VALUE
}

const parseMonth = (param = '') => {
  return parse(param, new RegExp('-(\\d{1,2})')) || NEED_DEFAULT_VALUE
}

const parseDay = (param = '') => {
  return parse(param, new RegExp('-(\\d{1,2})(\\s|$)+')) || NEED_DEFAULT_VALUE
}

const parseHour = (param = '') => {
  return parse(param, new RegExp('(\\d{1,2})($|:)')) || NEED_DEFAULT_VALUE
}

const parseMinute = (param = '') => {
  return parse(param, new RegExp(':(\\d{1,2})($|:)')) || NEED_DEFAULT_VALUE
}

const parseDate = (contains) => (date) => {
  const dateResult = {}
  if (contains('yyyy')) dateResult[PROPERTY.YEAR] = parseYear(date)
  if (contains('MM')) dateResult[PROPERTY.MONTH] = parseMonth(date)
  if (contains('dd')) dateResult[PROPERTY.DAY] = parseDay(date)
  if (contains('HH')) dateResult[PROPERTY.HOUR] = parseHour(date)
  if (contains('mm')) dateResult[PROPERTY.MINUTE] = parseMinute(date)

  return dateResult
}

const defaultCurrent = (current) => {
  const nowDate = new Date()
  const {
    year = nowDate.getFullYear(),
    month = nowDate.getMonth() + 1,
    day = nowDate.getDate(),
    hour = nowDate.getHours(),
    minute = nowDate.getMinutes()
  } = current

  return {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute)
  }
}

export const getList = ({ currentDate, startDate, endDate, format }) => {
  const contains = isContain(format)
  const parse = parseDate(contains)

  const current: any = defaultCurrent(parse(currentDate))
  const start: any = parse(startDate)
  const end: any = parse(endDate)

  let years = generateYears({ start, end, current })
  let months = generateMonths({ start, end, current })
  let days = generateDays({ start, end, current })
  let hours = generateHours({ start, end, current })
  let minutes = generateMinutes({ start, end, current })

  return () => {
    const getYears = (index) => {
      if (!isUndefined(index)) current.year = parseInt(years.list[index])

      return (years = generateYears({ start, end, current }))
    }

    const getMonths = (index) => {
      if (!isUndefined(index)) current.month = parseInt(months.list[index])

      return (months = generateMonths({ start, end, current }))
    }

    const getDays = (index) => {
      if (!isUndefined(index)) current.day = parseInt(days.list[index])

      return (days = generateDays({ start, end, current }))
    }

    const getHours = (index) => {
      if (!isUndefined(index)) current.hour = parseInt(hours.list[index])

      return (hours = generateHours({ start, end, current }))
    }

    const getMinutes = (index) => {
      if (!isUndefined(index)) current.minute = parseInt(minutes.list[index])

      return (minutes = generateMinutes({ start, end, current }))
    }

    return {
      years,
      getYears,
      months,
      getMonths,
      days,
      getDays,
      hours,
      getHours,
      minutes,
      getMinutes
    }
  }
}
