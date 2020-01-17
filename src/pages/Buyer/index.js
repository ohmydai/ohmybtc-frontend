import React, { useState, useEffect } from 'react'
import styles from './buyer.module.scss'
import ReactGA from 'react-ga'

import {
  useWeb3,
  ALLOW_MAX,
  useDefaultAccount,
  getNetworkVersion,
  toBigNumber
} from '../../hooks/web3'

import { FACTORYABI, ERC20ABI, OPTIONABI, EXCHANGEABI } from '../../abi'
import { tooltipUSDC } from '../../constants/texts'

import { toastCall } from '../../utils/utils'

import { ConfirmButton, InputTextLock, Loading } from '../../components'
import getAddresObject from '../../constants/addresses'

const Buyer = () => {
  const [daiAmount, setDaiAmount] = useState('')
  const [optionPrice, setOptionPrice] = useState('-')
  const [optionPricePrecision, setOptionPricePrecision] = useState('-')
  const [isLoading, setIsLoading] = useState(false)
  const senderAddress = useDefaultAccount()
  const web3 = useWeb3()
  const network = getNetworkVersion()
  const { optionAddress, usdcAddress, factoryAddress } = getAddresObject(network)
  const [isUSDCAllowed, setIsUSDCAllowed] = useState(null)

  useEffect(() => {
    async function checkAllowanceUniswap () {
      try {
        const usdcContract = new web3.eth.Contract(ERC20ABI, usdcAddress)
        const factoryContract = new web3.eth.Contract(
          FACTORYABI,
          factoryAddress
        )
        const exchangeAddressUSDC = await factoryContract.methods
          .getExchange(usdcAddress)
          .call()

        const allowValue = await usdcContract.methods
          .allowance(senderAddress, exchangeAddressUSDC)
          .call()

        const isNotEqualToZero = !toBigNumber(allowValue).eq(toBigNumber(0))
        setIsUSDCAllowed(isNotEqualToZero)
      } catch (err) {
        toastCall('error', 'USDC Allow check', err)
      }
    }
    if (web3 && senderAddress && network) {
      checkAllowanceUniswap()
    }
  }, [web3, senderAddress, network, factoryAddress, usdcAddress])

  useEffect(() => {
    async function checkUniswap () {
      try {
        const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)
        const factoryContract = new web3.eth.Contract(
          FACTORYABI,
          factoryAddress
        )
        const usdcContract = new web3.eth.Contract(ERC20ABI, usdcAddress)

        const exchangeAddressUSDC = await factoryContract.methods
          .getExchange(usdcAddress)
          .call()

        const exchangeAddressOHTOKEN = await factoryContract.methods
          .getExchange(optionAddress)
          .call()

        const usdcDecimals = await usdcContract.methods.decimals().call()
        const ohtokenDecimals = await optionContract.methods.decimals().call()

        // Need to convert to the same number of decimals
        const diffOfDecimalsUSDC = 18 - usdcDecimals
        const diffOfDecimalsOHTOKEN = 18 - ohtokenDecimals

        // TokenA (USDC) to ETH conversion
        const inputAmountA = daiAmount // actually here usdcAmount == ohToken amount minted
        const inputReserve = await usdcContract.methods
          .balanceOf(exchangeAddressUSDC)
          .call()

        const inputReserveA = diffOfDecimalsUSDC
          ? inputReserve * Math.pow(10, diffOfDecimalsUSDC)
          : inputReserve // needs to have the same decimals

        const outputReserveA = await web3.eth.getBalance(
          exchangeAddressUSDC
        )

        const numeratorA = inputAmountA * outputReserveA * 997 // remove liquidity pool fee
        const denominatorA = inputReserveA * 1000 + inputAmountA * 997
        const outputAmountA = numeratorA / denominatorA
        // ETH to TokenB (USDC) conversion
        const inputAmountB = outputAmountA
        const inputReserveB = await web3.eth.getBalance(exchangeAddressOHTOKEN)
        const outputReserve = await optionContract.methods
          .balanceOf(exchangeAddressOHTOKEN)
          .call()

        const outputReserveB = diffOfDecimalsOHTOKEN
          ? outputReserve * Math.pow(10, diffOfDecimalsOHTOKEN)
          : outputReserve // needs to have the same decimals

        const numeratorB = inputAmountB * outputReserveB * 997
        const denominatorB = inputReserveB * 1000 + inputAmountB * 997
        const outputAmountB = numeratorB / denominatorB

        const rate = inputAmountA / outputAmountB

        console.log('rate', rate)
        let editedOutputB = (Math.round(rate * 100) / 100) * daiAmount
        editedOutputB = editedOutputB && daiAmount ? editedOutputB : '-'

        setOptionPrice(editedOutputB)
        setOptionPricePrecision(rate)
      } catch (err) {
        toastCall('error', 'Checking Uniswap Price', err)
      }
    }
    if (web3 && senderAddress && usdcAddress) {
      checkUniswap()
    }
  }, [web3, senderAddress, daiAmount, usdcAddress, optionAddress, factoryAddress])

  const buyOrder = async () => {
    setIsLoading(true)

    const factoryContract = new web3.eth.Contract(FACTORYABI, factoryAddress)
    const exchangeUSDCAddress = await factoryContract.methods.getExchange(usdcAddress).call()
    const exchangeUSDCContract = new web3.eth.Contract(EXCHANGEABI, exchangeUSDCAddress)

    const DEADLINE_FROM_NOW = 60 * 15
    const deadline = Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW
    const minETH = 1000000
    const minToken = 100000 // slippage

    const newAmount1 = (optionPricePrecision * daiAmount * 1.02).toFixed(6)
    const newAmount2 = newAmount1 * 1e6

    try {
      await exchangeUSDCContract.methods
        .tokenToTokenSwapInput(
          newAmount2,
          minToken,
          minETH,
          deadline,
          optionAddress
        )
        .send({ from: senderAddress })

      toastCall('success', 'Buying option')
    } catch (err) {
      toastCall('error', 'Buying option', err)
    } finally {
      setIsLoading(false)
    }
  }

  const approveUSDC = async () => {
    setIsLoading(true)

    const usdcContract = new web3.eth.Contract(ERC20ABI, usdcAddress)
    const factoryContract = new web3.eth.Contract(FACTORYABI, factoryAddress)
    const exchangeUSDCAddress = await factoryContract.methods.getExchange(usdcAddress).call()

    return usdcContract.methods
      .approve(exchangeUSDCAddress, ALLOW_MAX)
      .send({ from: senderAddress })
      .then(e => {
        setIsUSDCAllowed(true)
        toastCall('success', 'Approved USDC')
      })
      .catch(err => {
        toastCall('error', 'Approved USDC', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // analytics
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.questionBox}>
        <div className={styles.questiontext}>
          How much DAI do you want to <br />
          be able to sell for 1 USDC in the future?
        </div>
        <div className={styles.inputcontainer}>
          <InputTextLock
            placeholder='Enter amount of DAI'
            value={daiAmount}
            isUnlocked={isUSDCAllowed}
            onChange={setDaiAmount}
            onUnlock={approveUSDC}
            tooltipText={isUSDCAllowed ? null : tooltipUSDC}
          />
        </div>
      </div>
      <div className={styles.detailtext}>
        <div>
          For this amount, the price is{' '}
          <span className={styles.variabletext}>
            {optionPrice + ' USDC'}
          </span>
        </div>
      </div>

      <div style={{ margin: '25px 0' }}>
        {isLoading ? (
          <Loading />
        ) : (
          <ConfirmButton onClick={buyOrder} disabled={!isUSDCAllowed} size='large'>
            BUY
          </ConfirmButton>
        )}
      </div>
    </div>
  )
}

export default Buyer
