import React, { useEffect, useState } from 'react'
import Modal from '../Modal'
import { getNetworkVersion, toBigNumber, useDefaultAccount, useWeb3, ALLOW_MAX } from '../../hooks/web3'
import { ERC20ABI, OPTIONABI, FACTORYABI, EXCHANGEABI } from '../../abi'
import getAddresObject from '../../constants/addresses'
import StepItem from '../Stepper/StepItem'
import Stepper from '../Stepper/Stepper'

const STATE = {
  INIT: 0,
  CHECK_USDC_ALLOWANCE: 1,
  APPROVE_USDC: 2,
  MINT_OPTIONS: 3,
  CHECK_OHTOKEN_ALLOWANCE: 4,
  APPROVE_SELL: 5,
  SELL_OPTIONS: 6,
  COMPLETED: 7
}

const SellStepper = ({ amount, onClose }) => {
  let { currentStep, failed } = useSellStepper(amount)

  // this finishes the last step instead of showing it pending
  if (currentStep === STATE.COMPLETED) {
    currentStep++
  }
  return (
    <Modal isOpen onClose={onClose}>
      <Stepper title='Betting on DAI' currentStep={currentStep} failed={failed}>
        <StepItem step={STATE.INIT}>Starting transaction</StepItem>
        <StepItem step={STATE.CHECK_USDC_ALLOWANCE}>Detecting USDC allowance</StepItem>
        <StepItem step={STATE.APPROVE_USDC}>Waiting for USDC approval</StepItem>
        <StepItem step={STATE.MINT_OPTIONS}>Minting ohTokens</StepItem>
        <StepItem step={STATE.CHECK_OHTOKEN_ALLOWANCE}>Detecting ohTokens allowance</StepItem>
        <StepItem step={STATE.APPROVE_SELL}>Waiting for phTokens approval</StepItem>
        <StepItem step={STATE.SELL_OPTIONS}>Selling ohTokens on Uniswap</StepItem>
        <StepItem step={STATE.COMPLETED}>Completed</StepItem>
      </Stepper>
    </Modal>
  )
}

export default SellStepper

function useSellStepper (amount) {
  const web3 = useWeb3()
  const myAddress = useDefaultAccount()
  const [currentStep, setCurrentStep] = useState(STATE.INIT)
  const [failed, setFailed] = useState(null)
  const [isAllowedUSDC, setIsAllowedUSDC] = useState(null)
  const [isAllowedOHTOKEN, setIsAllowedOHTOKEN] = useState(null)

  useEffect(() => {
    if (!web3 || !myAddress) return

    const network = getNetworkVersion()
    const { usdcAddress, optionAddress, factoryAddress } = getAddresObject(network)
    const usdcContract = new web3.eth.Contract(ERC20ABI, usdcAddress)
    const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)
    const uniswapFactoryContract = new web3.eth.Contract(FACTORYABI, factoryAddress)

    const isAllowUSDC = async (amount) => {
      const allowed = await usdcContract.methods.allowance(myAddress, optionAddress).call()
      return toBigNumber(allowed).gte(toBigNumber(amount))
    }

    const isAllowOHTOKEN = async (amount) => {
      const exchangeAddressOHTOKEN = await uniswapFactoryContract.methods.getExchange(optionAddress).call()
      const allowed = await optionContract.methods.allowance(myAddress, exchangeAddressOHTOKEN).call()
      console.log('allowed OHTOKEN', allowed)
      return toBigNumber(allowed).gte(toBigNumber(amount))
    }

    const approveUSDC = (fromAddress) => {
      return usdcContract.methods
        .approve(optionAddress, ALLOW_MAX)
        .send({ from: fromAddress })
    }

    const mintOptions = (amount, fromAddress) => {
      return optionContract.methods.mint(amount.toString()).send({ from: fromAddress })
    }

    const approveSell = async (fromAddress) => {
      const exchangeAddress = await uniswapFactoryContract.methods.getExchange(optionAddress).call()
      return optionContract.methods.approve(exchangeAddress, ALLOW_MAX).send({ from: fromAddress })
    }

    const sellOptions = async (amount, fromAddress) => {
      const exchangeOHTOKENAddress = await uniswapFactoryContract.methods.getExchange(optionAddress).call()
      const exchangeOHTOKENContract = new web3.eth.Contract(EXCHANGEABI, exchangeOHTOKENAddress)

      const DEADLINE_FROM_NOW = 60 * 15
      const deadline = Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW
      const minETH = 1
      const minToken = 1

      const adaptAmount = (amount * 1e18).toString()

      return exchangeOHTOKENContract.methods
        .tokenToTokenSwapInput(
          adaptAmount,
          minToken,
          minETH,
          deadline,
          usdcAddress
        )
        .send({ from: fromAddress })
    }

    const run = () => {
      switch (currentStep) {
        case STATE.INIT:
          setCurrentStep(STATE.CHECK_USDC_ALLOWANCE)
          break
        case STATE.CHECK_USDC_ALLOWANCE:
          isAllowUSDC(amount)
            .then(isAllowed => {
              setIsAllowedUSDC(isAllowed)
              setCurrentStep(STATE.APPROVE_USDC)
            })
          break
        case STATE.APPROVE_USDC:
          if (!isAllowedUSDC) {
            approveUSDC(myAddress)
              .then(() => setCurrentStep(STATE.MINT_OPTIONS))
              .catch(() => setFailed(STATE.APPROVE_USDC))
          } else {
            setCurrentStep(STATE.MINT_OPTIONS)
          }
          break
        case STATE.MINT_OPTIONS:
          mintOptions(amount, myAddress)
            .then(() => setCurrentStep(STATE.APPROVE_SELL))
            .catch(() => setFailed(STATE.MINT_OPTIONS))
          break
        case STATE.CHECK_OHTOKEN_ALLOWANCE:
          isAllowOHTOKEN()
            .then(isAllowed => {
              console.log('isAllowed', isAllowed)
              setIsAllowedOHTOKEN(isAllowed)
              setCurrentStep(STATE.APPROVE_SELL)
            })
          break
        case STATE.APPROVE_SELL:
          if (!isAllowedOHTOKEN) {
            approveSell(myAddress)
              .then(() => setCurrentStep(STATE.SELL_OPTIONS))
              .catch(() => setFailed(STATE.APPROVE_SELL))
          } else {
            setCurrentStep(STATE.SELL_OPTIONS)
          }
          break
        case STATE.SELL_OPTIONS:
          sellOptions(amount, myAddress)
            .then(() => setCurrentStep(STATE.COMPLETED))
            .catch(() => setFailed(STATE.SELL_OPTIONS))
          break
        default: break
      }
    }

    run()
    // eslint-disable-next-line
  }, [web3, myAddress, amount, currentStep])

  return { currentStep, failed }
}
