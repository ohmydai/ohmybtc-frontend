import React, { useState, useEffect } from 'react'
import styles from './seller.module.scss'
import ReactGA from 'react-ga'

import {
  useWeb3,
  useDefaultAccount,
  useContractAddresses
} from '../../hooks/web3'

import {
  OPTIONABI,
  ERC20ABI,
  FACTORYABI
} from '../../abi'

import { toUint256, toastCall, humanDateByBlock } from '../../utils/utils'
import { ConfirmButton, InputTextLock, Loading } from '../../components'
import SellStepper from '../../components/SellStepper'

const Seller = () => {
  const [usdcAmount, setUsdcAmount] = useState('')
  const [optionPremium, setOptionPremium] = useState('-')
  const [expirationBlock, setExpirationBlock] = useState()
  const [expirationBlockHuman, setExpirationBlockHuman] = useState()
  const [isStepperOpen, setIsStepperOpen] = useState(null)
  const [, setAmountBN] = useState(null)
  const [isLoading] = useState(false)
  const senderAddress = useDefaultAccount()
  const web3 = useWeb3()
  const { optionAddress, usdcAddress, factoryAddress } = useContractAddresses()

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

        console.log('ohtokenDecimals', ohtokenDecimals)
        console.log('exchangeAddressOHTOKEN', exchangeAddressOHTOKEN)
        console.log('usdcDecimals', usdcDecimals)
        console.log('exchangeAddressUSDC', exchangeAddressUSDC)

        // Need to convert to the same number of decimals
        const diffOfDecimalsUSDC = 18 - usdcDecimals
        const diffOfDecimalsOHTOKEN = 18 - ohtokenDecimals

        // TokenA (OHTOKEN) to ETH conversion
        const inputAmountA = usdcAmount // actually here usdcAmount == ohToken amount minted
        const inputReserve = await optionContract.methods
          .balanceOf(exchangeAddressOHTOKEN)
          .call()

        const inputReserveA = diffOfDecimalsOHTOKEN
          ? inputReserve * Math.pow(10, diffOfDecimalsOHTOKEN)
          : inputReserve // needs to have the same decimals

        const outputReserveA = await web3.eth.getBalance(
          exchangeAddressOHTOKEN
        )
        const numeratorA = inputAmountA * outputReserveA * 997 // remove liquidity pool fee
        const denominatorA = inputReserveA * 1000 + inputAmountA * 997
        const outputAmountA = numeratorA / denominatorA

        // ETH to TokenB (USDC) conversion
        const inputAmountB = outputAmountA
        const inputReserveB = await web3.eth.getBalance(exchangeAddressUSDC)
        const outputReserve = await usdcContract.methods
          .balanceOf(exchangeAddressUSDC)
          .call()

        const outputReserveB = diffOfDecimalsUSDC
          ? outputReserve * Math.pow(10, diffOfDecimalsUSDC)
          : outputReserve // needs to have the same decimals

        const numeratorB = inputAmountB * outputReserveB * 997
        const denominatorB = inputReserveB * 1000 + inputAmountB * 997
        const outputAmountB = numeratorB / denominatorB
        const rate = outputAmountB / inputAmountA

        let editedOutputB = Math.round(outputAmountB * 100) / 100
        editedOutputB = editedOutputB || '-'
        setOptionPremium(editedOutputB)

        console.log('outputAmountB', outputAmountB)
        console.log('rate', rate)
      } catch (err) {
        toastCall('error', 'Checking Uniswap Price', err)
      }
    }

    if (web3 && senderAddress && usdcAddress) {
      checkUniswap()
    }
  }, [web3, senderAddress, usdcAmount, usdcAddress, optionAddress, factoryAddress])

  useEffect(() => {
    if (web3 && optionAddress) {
      const getBlockNumber = async () => {
        const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)

        try {
          const expirationBlock = await optionContract.methods
            .expirationBlockNumber()
            .call()

          const currentBlock = await web3.eth.getBlockNumber()
          const dateInHuman = humanDateByBlock(currentBlock, expirationBlock)

          setExpirationBlock(expirationBlock)
          setExpirationBlockHuman(dateInHuman)
        } catch (err) {
          toastCall('error', 'Expiration Block', err)
        }
      }

      getBlockNumber()
    }
  }, [web3, optionAddress, usdcAmount])

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])
  console.log('newAmount', usdcAmount)
  return (
    <div className={styles.sellercontainer}>
      <div className={styles.questionBox}>
        {isStepperOpen ? (
          <SellStepper amount={usdcAmount} onClose={() => setIsStepperOpen(false)} />
        ) : null}
        <div className={styles.questiontext}>
          What is the total USDC amount you're<br />
          willing to bet in favour of DAI?
        </div>
        <div className={styles.inputcontainer}>
          <InputTextLock
            placeholder='Enter amount of USDC'
            value={usdcAmount}
            onChange={(value) => {
              setUsdcAmount(value)
              setAmountBN(toUint256(value))
            }}
            isUnlocked
            tooltipText={null}
          />
        </div>
        <div className={styles.detailtext}>
          By taking this risk, you would earn a premium of{' '}
          <span className={styles.variabletext}>
            {' ' + optionPremium + ' USDC '}
          </span>
          now
        </div>
        <div className={styles.detailtext}>
          and your collateral will be locked until block#
          <span className={styles.variabletext}>
            {' ' +
            expirationBlock +
            '(~' +
            expirationBlockHuman +
            ')'}
          </span>
        </div>
      </div>
      <div style={{ margin: '25px 0' }}>
        {isLoading ? (
          <Loading />
        ) : (
          <ConfirmButton onClick={() => setIsStepperOpen(true)} disabled={!usdcAmount} size='large'>
            BELIEVE IN DAI
          </ConfirmButton>
        )}
      </div>
    </div>
  )
}

export default Seller
