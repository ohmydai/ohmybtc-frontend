import React, { useCallback, useContext, useEffect, useState } from 'react'
import Web3 from 'web3'
import BigNumber from 'bn.js'
import { DAIABI, ERC20ABI, FACTORYABI, OPTIONABI } from '../abi'
import { humanDateByBlock, toastCall } from '../utils/utils'

import getContractAddresses from '../constants/addresses.js'

export const toBigNumber = value => new BigNumber(value)

export const ALLOW_MAX = toBigNumber(2)
  .pow(toBigNumber(256))
  .sub(toBigNumber(1))
  .toString()

export const Web3Context = React.createContext(undefined)

export function useWeb3Provider () {
  const [web3, setWeb3] = useState()

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const { ethereum } = window
        await ethereum.enable()

        const _web3 = new Web3(ethereum)
        setWeb3(_web3)
      }
    }

    initializeWeb3()
  }, [])

  return { web3 }
}

export function useWeb3 () {
  return useContext(Web3Context)
}

// export function formatEthBalance(web3: any, value: any) {
//   return web3 && value && web3.utils.fromWei(value)
// }

export function useDefaultAccount () {
  const web3 = useWeb3()
  const [account, setAccount] = useState()

  useEffect(() => {
    if (web3) {
      web3.eth.getAccounts().then(accounts => setAccount(accounts[0]))

      window.ethereum.on('accountsChanged', accounts =>
        setAccount(accounts[0])
      )
    }
  }, [web3])

  return account
}

export function useNetworkVersion () {
  const web3 = useWeb3()
  const currentNetwork = getNetworkVersion()
  const [networkVersion, setNetworkVersion] = useState(currentNetwork)

  useEffect(() => {
    if (web3 && currentNetwork) {
      setNetworkVersion(currentNetwork)

      window.ethereum.on('networkChanged', network => {
        return setNetworkVersion(network)
      })
    }
  }, [web3, currentNetwork])

  return networkVersion
}

export function useUSDCIsAllowed () {
  const web3 = useWeb3()
  const myAddress = useDefaultAccount()
  const currentNetwork = useNetworkVersion()
  const { usdcAddress, optionAddress } = useContractAddresses()
  const [isAllow, setIsAllow] = useState(null)

  useEffect(() => {
    if (web3 && myAddress && currentNetwork) {
      const usdcContract = new web3.eth.Contract(ERC20ABI, usdcAddress)
      usdcContract.methods
        .allowance(myAddress, optionAddress)
        .call()
        .then(allowValue => {
          const isNotEqualToZero = !toBigNumber(allowValue).eq(toBigNumber(0))
          setIsAllow(isNotEqualToZero)
        })
        .catch(err => toastCall('error', 'USDC Allow check', err))
    }
  }, [web3, myAddress, currentNetwork, optionAddress, usdcAddress])

  return isAllow
}

export function useUSDCIsAllowedUniswap () {
  const web3 = useWeb3()
  const myAddress = useDefaultAccount()
  const currentNetwork = useNetworkVersion()
  const { usdcAddress, factoryAddress } = useContractAddresses()
  const [isAllow, setIsAllow] = useState(null)

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
          .allowance(myAddress, exchangeAddressUSDC)
          .call()
        console.log('allowValue uniswap', allowValue)
        const isNotEqualToZero = !toBigNumber(allowValue).eq(toBigNumber(0))
        setIsAllow(isNotEqualToZero)
      } catch (err) {
        toastCall('error', 'USDC Allow check', err)
      }
    }
    if (web3 && myAddress && currentNetwork) {
      checkAllowanceUniswap()
    }
  }, [web3, myAddress, currentNetwork, factoryAddress, usdcAddress])

  return [isAllow, setIsAllow]
}

export function useDAIisAllowed () {
  const web3 = useWeb3()
  const myAddress = useDefaultAccount()
  const currentNetwork = useNetworkVersion()
  const { daiAddress, optionAddress } = useContractAddresses()
  const [isAllow, setIsAllow] = useState(null)

  useEffect(() => {
    if (web3 && myAddress && currentNetwork) {
      const daiContract = new web3.eth.Contract(DAIABI, daiAddress)

      daiContract.methods
        .allowance(myAddress, optionAddress)
        .call()
        .then(allowValue => {
          const isNotEqualToZero = !toBigNumber(allowValue).eq(toBigNumber(0))
          setIsAllow(isNotEqualToZero)
        })
        .catch(err => toastCall('error', 'DAI Allow check', err))
    }
  }, [web3, myAddress, currentNetwork, optionAddress, daiAddress])

  return isAllow
}

export function getNetworkVersion () {
  if (window.ethereum) {
    return window.ethereum.networkVersion
  }
}

export function useContractAddresses () {
  const web3 = useWeb3()
  const currentNetwork = useNetworkVersion()
  const [addresses, setAddresses] = useState({})

  useEffect(() => {
    if (web3 && currentNetwork) {
      setAddresses(getContractAddresses(currentNetwork))
    }
  }, [web3, currentNetwork])

  return addresses
}

export function useBalanceOf (contractAddress, holderAddress) {
  const web3 = useWeb3()
  const [balance, setBalance] = useState(null)

  const fetchBalance = useCallback(() => {
    const usdcContract = new web3.eth.Contract(ERC20ABI, contractAddress)

    usdcContract.methods
      .balanceOf(holderAddress)
      .call()
      .then(value => new BigNumber(value))
      .then(setBalance)
  }, [web3, holderAddress, contractAddress])

  useEffect(() => {
    if (web3 && holderAddress && contractAddress) {
      fetchBalance()
    }
  }, [web3, holderAddress, contractAddress, fetchBalance])

  return [balance, fetchBalance]
}

export function useLockedBalance () {
  const web3 = useWeb3()
  const senderAddress = useDefaultAccount()
  const { optionAddress } = useContractAddresses()
  const [balance, setBalance] = useState(null)

  const fetchBalance = useCallback(() => {
    const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)

    optionContract.methods
      .lockedBalance(senderAddress)
      .call()
      .then(setBalance)
  }, [web3, optionAddress, senderAddress])

  useEffect(() => {
    if (web3 && optionAddress && senderAddress) {
      fetchBalance()
    }
  }, [web3, optionAddress, senderAddress, fetchBalance])

  return [balance, fetchBalance]
}

export function useExpirationBlock () {
  const web3 = useWeb3()
  const { optionAddress } = useContractAddresses()
  const [block, setBlock] = useState([])

  useEffect(() => {
    if (web3 && optionAddress) {
      const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)

      Promise.all([
        optionContract.methods.expirationBlockNumber().call(),
        web3.eth.getBlockNumber()
      ]).then(([expirationBlock, currentBlock]) => {
        const dateInHuman = humanDateByBlock(currentBlock, expirationBlock)
        setBlock([expirationBlock, dateInHuman])
      })
    }
  }, [web3, optionAddress])

  return block
}

export function useOptionPrice (optionAmount) {
  const web3 = useWeb3()
  const senderAddress = useDefaultAccount()
  const { factoryAddress, optionAddress, usdcAddress } = useContractAddresses()
  const [price, setPrice] = useState(null)

  useEffect(() => {
    async function checkUniswap () {
      try {
        const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)
        const usdcContract = new web3.eth.Contract(ERC20ABI, usdcAddress)
        const factoryContract = new web3.eth.Contract(
          FACTORYABI,
          factoryAddress
        )

        const [exchangeAddressUSDC, exchangeAddressOHTOKEN] = await Promise.all([
          factoryContract.methods.getExchange(usdcAddress).call(),
          factoryContract.methods.getExchange(optionAddress).call()
        ])

        const [usdcDecimals, ohtokenDecimals] = await Promise.all([
          usdcContract.methods.decimals().call(),
          optionContract.methods.decimals().call()
        ])

        // Need to convert to the same number of decimals
        const diffOfDecimalsUSDC = 18 - usdcDecimals
        const diffOfDecimalsOHTOKEN = 18 - ohtokenDecimals

        // TokenA (OHTOKEN) to ETH conversion
        const inputAmountA = optionAmount // actually here usdcAmount == ohToken amount minted
        const inputReserve = await optionContract.methods.balanceOf(exchangeAddressOHTOKEN).call()

        const inputReserveA = diffOfDecimalsOHTOKEN
          ? inputReserve * Math.pow(10, diffOfDecimalsOHTOKEN)
          : inputReserve // needs to have the same decimals

        const outputReserveA = await web3.eth.getBalance(exchangeAddressOHTOKEN)
        const numeratorA = inputAmountA * outputReserveA * 997 // remove liquidity pool fee
        const denominatorA = inputReserveA * 1000 + inputAmountA * 997
        const outputAmountA = numeratorA / denominatorA

        // ETH to TokenB (USDC) conversion
        const inputAmountB = outputAmountA
        const inputReserveB = await web3.eth.getBalance(exchangeAddressUSDC)
        const outputReserve = await usdcContract.methods.balanceOf(exchangeAddressUSDC).call()

        const outputReserveB = diffOfDecimalsUSDC
          ? outputReserve * Math.pow(10, diffOfDecimalsUSDC)
          : outputReserve // needs to have the same decimals

        const numeratorB = inputAmountB * outputReserveB * 997 // remove liquidity pool fee
        const denominatorB = inputReserveB * 1000 + inputAmountB * 997
        const outputAmountB = numeratorB / denominatorB

        const rate = outputAmountB / inputAmountA

        let editedOutputB = Math.round(outputAmountB * 100) / 100
        editedOutputB = editedOutputB || '-'
        setPrice(editedOutputB)

        console.log('outputAmountB', outputAmountB)
        console.log('rate', rate)
      } catch (err) {
        toastCall('error', 'Checking Uniswap Price', err)
      }
    }

    if (web3 && senderAddress && usdcAddress && typeof optionAmount === 'number') {
      checkUniswap()
    }
  }, [web3, senderAddress, optionAmount, usdcAddress, optionAddress, factoryAddress])

  return price
}
