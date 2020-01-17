import React, { useState, useEffect } from 'react'
import styles from './dashboard.module.scss'
import { Link, useHistory } from 'react-router-dom'

import { useWeb3, useDefaultAccount, useContractAddresses } from '../../hooks/web3'
import { OPTIONABI } from '../../abi'
import { toastCall, humanDateByBlock } from '../../utils/utils'

import { ConfirmButton } from '../../components'
import Loading from '../../assets/loading.gif'
import usePageview from '../../hooks/usePageview'

const Dashboard = () => {
  usePageview()
  const [isLoading, setIsLoading] = useState(false)
  const [usdcLocked, setUSDCLocked] = useState(300)
  const [underlyingAssetAmount, setUnderlyingAssetAmount] = useState()
  const [strikeAssetAmount, setStrikeAssetAmount] = useState(100)
  const [expirationBlock, setExpirationBlock] = useState(100)
  const [expirationBlockHuman, setExpirationBlockHuman] = useState(100)
  const [hasExpired, setHasExpired] = useState(false)
  const senderAddress = useDefaultAccount()
  const { optionAddress } = useContractAddresses()
  const history = useHistory()
  const web3 = useWeb3()

  useEffect(() => {
    if (!web3 || !senderAddress) {
      return
    }
    setIsLoading(true)
    const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)

    async function getInfos () {
      try {
        const _lockedBalance = await optionContract.methods
          .lockedBalance(senderAddress)
          .call()
        // get strike asset Address, and them check assetContract.methods.decimals()
        // const tokenDecimals = await optionContract.methods
        // .decimals()
        // .call()

        setUSDCLocked(_lockedBalance)

        const ohTokenAmount = await optionContract.methods
          .balanceOf(senderAddress)
          .call()

        const strikePrice = await optionContract.methods.strikePrice().call()

        const hasExpired = await optionContract.methods.hasExpired().call()

        const strikeAssetAmount = (
          (ohTokenAmount / 1e18) *
          (strikePrice / 1e6)
        ).toFixed(4)

        const underLyingAmount = (ohTokenAmount / 1e18).toFixed(4)

        console.log('underLyingAmount', underLyingAmount)
        console.log('strikeAssetAmount', strikeAssetAmount)

        setUnderlyingAssetAmount(underLyingAmount)
        setStrikeAssetAmount(strikeAssetAmount)
        setHasExpired(hasExpired)

        const expirationBlock = await optionContract.methods
          .expirationBlockNumber()
          .call()

        const currentBlock = await web3.eth.getBlockNumber()
        const dateInHuman = humanDateByBlock(currentBlock, expirationBlock)

        setExpirationBlock(expirationBlock)
        setExpirationBlockHuman(dateInHuman)
        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
        toastCall('error', 'Requesting Info', err)
      }
    }

    getInfos()
  }, [web3, senderAddress, optionAddress])

  const withdrawToken = () => {
    setIsLoading(true)

    const optionContract = new web3.eth.Contract(OPTIONABI, optionAddress)

    return optionContract.methods
      .withdraw()
      .send({ from: senderAddress })
      .then(tx => {
        toastCall('success', 'Withdraw')
      })
      .catch(err => {
        toastCall('error', 'Withdraw error', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const buttonStyleRedeem = { padding: 0, height: '100%' }
  const buttonStyleWithdraw = { padding: 0, height: '100%' }

  if (hasExpired) {
    buttonStyleRedeem.backgroundColor = 'grey'
    buttonStyleRedeem.cursor = 'not-allowed'
  } else {
    buttonStyleWithdraw.backgroundColor = 'grey'
    buttonStyleWithdraw.cursor = 'not-allowed'
  }

  return (
    <div className={styles.container}>
      {isLoading ? (
        <img className={styles.loading} src={Loading} alt='loading-icon' />
      ) : (
        <>
          <div className={styles.section}>
            <div className={styles.title}>USDC Locked (Seller)</div>
            <div className={styles.row}>
              <div className={styles.property}>Amount</div>
              <div className={styles.value}>
                <span className={styles.variabletext}>
                  {usdcLocked + ' USDC'}
                </span>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.property}>Timeleft</div>
              <div className={styles.value}>
                Block#
                <span className={styles.variabletext}>
                  {' ' + expirationBlock + ' (' + expirationBlockHuman + ')'}
                </span>
              </div>
              <div className={styles.value}>
                <ConfirmButton onClick={hasExpired ? withdrawToken : null} disabled={!hasExpired}>
                  Withdraw
                </ConfirmButton>
                <ConfirmButton onClick={() => history.push('/undo')} style={{ padding: 0, height: '100%', marginLeft: 10 }}>
                  Undo
                </ConfirmButton>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.title}>USDC Available (Buyer)</div>
            <div className={styles.rowspecial}>
              <div className={styles.property}>
                Right now you can buy
                <span className={styles.variabletext}>
                  {' ' + underlyingAssetAmount + ' USDC'}
                </span>{' '}
                for
                <span className={styles.variabletext}>
                  {' ' + strikeAssetAmount + ' DAI'}
                </span>
              </div>
              <div className={styles.value}>
                <Link to='/redeem'>
                  <ConfirmButton style={buttonStyleRedeem}>
                    Execute
                  </ConfirmButton>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
