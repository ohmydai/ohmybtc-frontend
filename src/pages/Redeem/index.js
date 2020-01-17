import React, { useState, useEffect } from 'react'
import styles from './redeem.module.scss'
import ReactGA from 'react-ga'

import {
  useWeb3,
  ALLOW_MAX,
  useDefaultAccount,
  toBigNumber,
  getNetworkVersion
} from '../../hooks/web3'

import { tooltipDAI } from '../../constants/texts'
import { OPTIONABI, DAIABI, ERC20ABI } from '../../abi'
import { toastCall } from '../../utils/utils'
import { ConfirmButton, InputTextLock, Loading } from '../../components'
import getAddresObject from '../../constants/addresses'

const Redeem = () => {
  const [daiAmount, setDaiAmount] = useState('')
  const [amountUSDCAvaiable, setAmountUSDCAvaiable] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const senderAddress = useDefaultAccount()
  const web3 = useWeb3()
  const network = getNetworkVersion()
  const { optionAddress, daiAddress, factoryAddress } = getAddresObject(network)
  const [isDaiAllowed, setIsDaiAllowed] = useState(null)

  useEffect(() => {
    async function checkAllowance () {
      try {
        const daiContract = new web3.eth.Contract(ERC20ABI, daiAddress)

        const allowValue = await daiContract.methods
          .allowance(senderAddress, optionAddress)
          .call()

        const isNotEqualToZero = !toBigNumber(allowValue).eq(toBigNumber(0))
        setIsDaiAllowed(isNotEqualToZero)
      } catch (err) {
        toastCall('error', 'USDC Allow check', err)
      }
    }
    if (web3 && senderAddress && network) {
      checkAllowance()
    }
  }, [web3, senderAddress, network, factoryAddress, daiAddress, optionAddress])

  // analytics
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])

  useEffect(() => {
    if (web3 && optionAddress) {
      const getStrikePrice = async () => {
        const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)

        try {
          const _strikePrice = await optionContract.methods
            .strikePrice()
            .call()
          const treatedStrikePrice = _strikePrice / 1e6
          const _amountUSDCAvaiable = daiAmount / treatedStrikePrice
          setAmountUSDCAvaiable(_amountUSDCAvaiable)
        } catch (err) {
          toastCall('error', 'Get Token Price', err)
        }
      }
      getStrikePrice()
    }
  }, [web3, optionAddress, daiAmount])

  const redeemToken = () => {
    setIsLoading(true)

    const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)
    // const newAmount = toUint2562(daiAmount);

    return optionContract.methods
      .exchange(daiAmount)
      .send({ from: senderAddress })
      .then(tx => {
        toastCall('success', 'Exchange/Execute')
      })
      .catch(err => {
        toastCall('error', 'Exchange/Execute', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const approveDAI = () => {
    setIsLoading(true)

    const daiContract = new web3.eth.Contract(DAIABI, daiAddress)

    return daiContract.methods
      .approve(optionAddress, ALLOW_MAX)
      .send({ from: senderAddress })
      .then(e => {
        toastCall('success', 'Allow DAI')
        setIsDaiAllowed(true)
      })
      .catch(err => {
        toastCall('error', 'Approve DAI', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className={styles.container}>
      <div className={styles.questionBox}>
        <div className={styles.questiontext}>
          How much DAI do you<br />want to exchange for USDC?
        </div>
        <div className={styles.inputcontainer}>
          <InputTextLock
            placeholder='Enter amount of DAI'
            value={daiAmount}
            onChange={setDaiAmount}
            isUnlocked={isDaiAllowed}
            onUnlock={approveDAI}
            tooltipText={isDaiAllowed ? null : tooltipDAI}
          />
        </div>
        <div className={styles.detailtext}>
          You will receive{' '}
          <span className={styles.variabletext}>
            {daiAmount === undefined
              ? 0 + ' USDC'
              : amountUSDCAvaiable + ' USDC'}
          </span>{' '}
          in exchange
        </div>
      </div>
      <div>
        {isLoading ? (
          <Loading />
        ) : (
          <ConfirmButton onClick={redeemToken} disabled={!isDaiAllowed} size='large'>
            EXECUTE
          </ConfirmButton>
        )}
      </div>
    </div>
  )
}

export default Redeem
