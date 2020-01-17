import React, { useState } from 'react'
import styles from './unwind.module.scss'
import Web3 from 'web3'

import {
  useDefaultAccount,
  useContractAddresses,
  useBalanceOf,
  useLockedBalance,
  useExpirationBlock,
  useOptionPrice
} from '../../hooks/web3'

import { ConfirmButton, InputTextLock } from '../../components'
import usePageview from '../../hooks/usePageview'
import BigNumber from 'bn.js'
import UndoStepper from '../../components/UndoStepper'

const Undo = () => {
  usePageview()
  const [usdcAmount, setUsdcAmount] = useState('')
  const [isStepperOpen, setIsStepperOpen] = useState(null)
  const senderAddress = useDefaultAccount()
  const { optionAddress } = useContractAddresses()
  const [optionLockedBalance, refreshOptionLockedBalance] = useLockedBalance()
  const [optionBalance, refreshOptionBalance] = useBalanceOf(optionAddress, senderAddress)
  const [expirationBlock, expirationBlockHuman] = useExpirationBlock()
  const tokenPrice = useOptionPrice(usdcAmount)

  const hasToBuy = BigNumber.isBN(optionBalance)
    ? optionBalance.lt(toBigNumber(usdcAmount))
    : false

  let amountToBuy = toBigNumber(0)

  if (hasToBuy) {
    amountToBuy = toBigNumber(usdcAmount).sub(optionBalance)
  }

  return (
    <div className={styles.sellercontainer}>
      {isStepperOpen && (
        <UndoStepper
          amount={toBigNumber(usdcAmount)}
          owned={optionBalance}
          onClose={() => {
            Promise.all([
              refreshOptionLockedBalance(),
              refreshOptionBalance()
            ]).then(() => {
              setIsStepperOpen(false)
            })
          }}
        />
      )}
      <div className={styles.questionBox}>
        <div className={styles.questiontext}>
          How many USDC do you want to recover?
        </div>
        <div className={styles.inputcontainer}>
          <InputTextLock
            placeholder='Enter amount of USDC'
            value={usdcAmount}
            onChange={setUsdcAmount}
            isUnlocked
            tooltipText={null}
            onMaxClick={() => setUsdcAmount(parseInt(optionLockedBalance))}
          />
        </div>
        <div className={styles.detailtext}>
          The collateral will be locked until block#
          <span className={styles.variabletext}>
            {' ' +
            expirationBlock +
            '(~' +
            expirationBlockHuman +
            ')'}
          </span>
        </div>
        <div className={styles.detailtext}>
          You can withdraw {optionLockedBalance} USDC
        </div>
        {hasToBuy && parseInt(optionLockedBalance) > 0 && tokenPrice && (
          <div className={styles.detailtext}>
            You'll have to buy {formatBigNumber(amountToBuy)} for at most {tokenPrice} USDC
          </div>
        )}
      </div>
      <div style={{ margin: '25px 0' }}>
        <ConfirmButton
          onClick={() => setIsStepperOpen(true)}
          disabled={submitIsDisabled(usdcAmount, optionLockedBalance, hasToBuy, tokenPrice)}
          size='large'
        >
          Recover USDC
        </ConfirmButton>
      </div>
    </div>
  )
}

export default Undo

function formatBigNumber (value) {
  if (value) {
    return Web3.utils.fromWei(value)
  }
}

function submitIsDisabled (value, max, hasToBuy, tokenPrice) {
  if (hasToBuy && !tokenPrice) return true

  if (typeof value === 'number') {
    return value > parseInt(max)
  }

  return true
}

function toBigNumber (value) {
  return new BigNumber((value * 1e18).toString())
}
