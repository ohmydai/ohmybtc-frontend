import React, { useEffect, useState } from 'react'
import Modal from '../Modal'
import {
  getNetworkVersion,
  toBigNumber,
  useDefaultAccount,
  useWeb3,
  ALLOW_MAX
} from '../../hooks/web3'
import { ERC20ABI, OPTIONABI, FACTORYABI, EXCHANGEABI } from '../../abi'
import getAddresObject from '../../constants/addresses'
import StepItem from '../Stepper/StepItem'
import Stepper from '../Stepper/Stepper'
import Web3 from 'web3'
import BigNumber from 'bn.js'

const STATE = {
  INIT: 0,
  CHECK_USDC_ALLOWANCE: 1,
  APPROVE_USDC: 2,
  BUY_OHTOKENS: 3,
  BURN_OHTOKENS: 4,
  COMPLETED: 5
}

const UndoStepper = ({ amount, owned, onClose }) => {
  let { currentStep, failed } = useUndoStepper(amount, owned)

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
        <StepItem step={STATE.BUY_OHTOKENS}>Buying required oTokens</StepItem>
        <StepItem step={STATE.BURN_OHTOKENS}>Exchanging for {Web3.utils.fromWei(amount)} USDC</StepItem>
        <StepItem step={STATE.COMPLETED}>Completed</StepItem>
      </Stepper>
    </Modal>
  )
}

export default UndoStepper

function useUndoStepper (amount, owned) {
  const web3 = useWeb3()
  const myAddress = useDefaultAccount()
  const [hasToBuy] = useState(amount.gt(owned))
  const [currentStep, setCurrentStep] = useState(hasToBuy ? STATE.INIT : STATE.BURN_OHTOKENS)
  const [failed, setFailed] = useState(null)
  const [isAllowedUSDC, setIsAllowedUSDC] = useState(null)

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

    const approveBuy = async (fromAddress) => {
      const exchangeAddress = await uniswapFactoryContract.methods.getExchange(usdcAddress).call()
      return usdcContract.methods.approve(exchangeAddress, ALLOW_MAX).send({ from: fromAddress })
    }

    const buyOptions = async () => {
      const usdcExchangeAddress = await uniswapFactoryContract.methods.getExchange(usdcAddress).call()
      const usdcExchangeContract = new web3.eth.Contract(EXCHANGEABI, usdcExchangeAddress)
      const buyAmount = amount.sub(owned)

      const DEADLINE_FROM_NOW = 60 * 15
      const deadline = Math.ceil(Date.now() / 1000) + DEADLINE_FROM_NOW
      const maxEthSold = 1e18
      const maxTokensSold = 1e6 // slippage

      return usdcExchangeContract.methods
        .tokenToTokenSwapOutput(
          buyAmount.toString(),
          maxTokensSold.toString(),
          maxEthSold.toString(),
          deadline,
          optionAddress
        )
        .send({ from: myAddress })
    }

    const burnOTokens = () => {
      return optionContract.methods
        .burn(amount.div(new BigNumber((1e18).toString())).toString())
        .send({ from: myAddress })
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
            approveBuy(myAddress)
              .then(() => setCurrentStep(STATE.BUY_OHTOKENS))
              .catch(() => setFailed(STATE.APPROVE_USDC))
          } else {
            setCurrentStep(STATE.BUY_OHTOKENS)
          }
          break
        case STATE.BUY_OHTOKENS:
          buyOptions()
            .then(() => setCurrentStep(STATE.BURN_OHTOKENS))
            .catch(() => setFailed(STATE.BUY_OHTOKENS))
          break
        case STATE.BURN_OHTOKENS:
          burnOTokens()
            .then(() => setCurrentStep(STATE.COMPLETED))
          break
        default: break
      }
    }

    run()
    // eslint-disable-next-line
  }, [web3, myAddress, amount, owned, currentStep])

  return { currentStep, failed }
}
