import BigNumber from 'bn.js'
import { toast } from 'react-toastify'

export const toUint256 = value =>
  new BigNumber(value).mul(new BigNumber((1e6).toString())).toString()

export const toastCall = (type, action, err) => {
  const error = err && err.message ? err.message : err
  if (type === 'success') {
    toast.success(action + ' successful', {
      position: toast.POSITION.BOTTOM_CENTER
    })
  } else {
    toast.error(action + ' error: ' + error, {
      position: toast.POSITION.BOTTOM_CENTER
    })
  }
}

export const humanDateByBlock = (startBlock, endBlock) => {
  const diffBetweenBlocksInMilliseconds = (endBlock - startBlock) * 15 * 1000

  const now = new Date().valueOf()
  const futureDate = now + diffBetweenBlocksInMilliseconds

  const day = new Date(futureDate).getUTCDate()
  const month = new Date(futureDate).getUTCMonth()
  return `${monthToString(month)}, ${day}`
}

const monthToString = monthNumber => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ]

  if (monthNumber >= 0 && monthNumber <= 11) {
    return months[monthNumber]
  }

  return '-'
}
