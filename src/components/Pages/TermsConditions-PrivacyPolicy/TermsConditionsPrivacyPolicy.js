import React, { useEffect, useState } from 'react'
import { Input, Modal, Button, Form, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import Header from '../../Common/Header/Header'
import { actions } from '../../../Store'
import SideMenu from '../../Common/Sidemenu/Sidemenu'

import TermsandConditions from '../../Common/TermsandConditions/TermsandConditions'
import PrivacyPolicy from '../../Common/PrivacyPolicy/PrivacyPolicy'
import {
  SavePrivacyPolicy,
  GetPrivacyPolicy,
} from '../../../services/PrivacyPolicy'
import {
  SaveTermsAndConditions,
  GetTermsandConditions,
} from '../../../services/TermsConditions'
import SuccessModal from '../../Common/Modals/SuccessModal'
import { secondsToShowAlert } from '../../../config/constants'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const { TextArea } = Input

const TermsConditionsPrivacyPolicy = () => {
  const { hotelId } = useSelector(state => state)
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [isTandCVisible, setisTandCVisible] = useState(false)
  const [isPrivacyVisible, setisPrivacyVisible] = useState(false)
  const [isPrivacyPolicySelected, setIsPrivacyPolicySelected] = useState(false)
  const [initialPrivacyText, setInitialPrivacyText] = useState('')
  const [initialTandCText, setInitialTandCText] = useState('')
  const [PrivacyText, setPrivacyText] = useState('')
  const [TandCText, setTandCText] = useState('')
  const [Disable, setDisable] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [addContentButtonText, setAddContentButtonText] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successText, setSuccessText] = useState('')

  useEffect(() => {
    const isEdit = !!(isPrivacyPolicySelected
      ? initialPrivacyText
      : initialTandCText)
    setAddContentButtonText(isEdit ? 'Edit Content' : 'Add Content')
  }, [initialPrivacyText, initialTandCText, isPrivacyPolicySelected])

  const showModal = () => {
    isPrivacyPolicySelected
      ? setisPrivacyVisible(true)
      : setisTandCVisible(true)
  }

  const handleOk = () => {
    setShowLoader(true)
    let successMessageText = isPrivacyPolicySelected ? 'Privacy Policy' : 'T&C'
    const edited = isPrivacyPolicySelected
      ? initialPrivacyText
      : initialTandCText
    successMessageText += edited ? ' edited' : ' added'
    successMessageText += ' successfully'
    setSuccessText(successMessageText)

    isPrivacyPolicySelected ? SavePrivacyPolicyData() : SaveTAndCData()
  }

  const handleCancel = () => {
    setisPrivacyVisible(false)
    setisTandCVisible(false)
    setTandCText(initialTandCText)
    setPrivacyText(initialPrivacyText)
  }

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('15'))
    if (hotelId) {
      FetchTermsandConditions()
      FetchPrivacyPolicy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  useEffect(() => {
    if (showSuccessModal)
      setTimeout(() => {
        setShowSuccessModal(false)
      }, secondsToShowAlert)
  }, [showSuccessModal])

  const FetchTermsandConditions = async () => {
    try {
      const fetchedTermsandConditions = await GetTermsandConditions(hotelId)
      if (fetchedTermsandConditions) {
        setTandCText(fetchedTermsandConditions)
        setInitialTandCText(fetchedTermsandConditions)
      }
    } catch (error) {
      message.error('Something went wrong! Please try again!')
    }
  }

  const FetchPrivacyPolicy = async () => {
    try {
      const fetchedPrivacyPolicy = await GetPrivacyPolicy(hotelId)
      if (fetchedPrivacyPolicy) {
        setPrivacyText(fetchedPrivacyPolicy)
        setInitialPrivacyText(fetchedPrivacyPolicy)
      }
    } catch (error) {
      message.error('Something went wrong! Please try again!')
    }
  }

  const SaveTAndCData = async () => {
    try {
      setShowLoader(true)
      const { success, message: tAndCMessage } = await SaveTermsAndConditions(
        hotelId,
        TandCText
      )
      if (success) {
        setShowSuccessModal(true)
        setInitialTandCText(TandCText)
      } else {
        message.error(tAndCMessage)
      }
    } catch (error) {
      message.error('Something went wrong! Please try again!')
    } finally {
      setisTandCVisible(false)
      setShowLoader(false)
    }
  }

  const SavePrivacyPolicyData = async () => {
    try {
      setShowLoader(true)
      const { success, message: privacyPolicyMessage } =
        await SavePrivacyPolicy(hotelId, PrivacyText)
      if (success) {
        setShowSuccessModal(true)
        setInitialPrivacyText(PrivacyText)
      } else {
        message.error(privacyPolicyMessage)
      }
    } catch (error) {
      message.error('Something went wrong! Please try again!')
    } finally {
      setisPrivacyVisible(false)
      setShowLoader(false)
    }
  }

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='T&C and Privacy Policy'
                breadcrumb={['Hotel Admin', 'T&C and Privacy Policy']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row justify-content-between'>
                  <div className='col-auto'>
                    <div className='selectionBtn-grp'>
                      <Button
                        className={
                          isPrivacyPolicySelected
                            ? 'whiteBtn mr-2'
                            : 'whiteBtn active mr-2'
                        }
                        onClick={() => setIsPrivacyPolicySelected(false)}
                      >
                        {translateTextI18N('Terms & Conditions')}
                      </Button>
                      <Button
                        className={
                          !isPrivacyPolicySelected
                            ? 'whiteBtn mr-2'
                            : 'whiteBtn active mr-2'
                        }
                        onClick={() => setIsPrivacyPolicySelected(true)}
                      >
                        {translateTextI18N('Privacy Policy')}
                      </Button>
                    </div>
                  </div>
                  <div className='col-auto'>
                    {
                      <Button onClick={showModal} className='cmnBtn'>
                        {translateTextI18N(addContentButtonText)}
                      </Button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='termsPrivacy-content'>
            {isPrivacyPolicySelected ? (
              <PrivacyPolicy props={PrivacyText}></PrivacyPolicy>
            ) : (
              <TermsandConditions props={TandCText}></TermsandConditions>
            )}
          </div>
        </div>
      </section>

      <Modal
        title={translateTextI18N(
          `${
            isPrivacyPolicySelected && initialPrivacyText ? 'Edit' : 'Add'
          } Privacy Policy`
        )}
        visible={isPrivacyVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        className='termsprivacymodal cmnModal'
        footer={null}
        centered
      >
        <Form layout='vertical'>
          <div className='row'>
            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item name='email'>
                  <TextArea
                    rows={18}
                    onChange={e => {
                      setPrivacyText(e.target.value)
                      setDisable(false)
                    }}
                    placeholder={translateTextI18N(
                      'Enter your Privacy Policy here...'
                    )}
                    value={PrivacyText}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className='modalFooter' id='mdFooter'>
            <Button
              className='grayBtn'
              key='back'
              onClick={handleCancel}
              id='mdFooterCancel'
            >
              {translateTextI18N('Cancel')}
            </Button>

            <Button
              disabled={Disable}
              className='blueBtn ml-3 ml-lg-4'
              htmlType='submit'
              key='submit'
              onClick={handleOk}
              loading={showLoader}
              id='mdFooterSubmit'
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={translateTextI18N(
          `${
            !isPrivacyPolicySelected && initialTandCText ? 'Edit' : 'Add'
          } Terms & Conditions`
        )}
        visible={isTandCVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        className='termsprivacymodal cmnModal'
        footer={null}
        centered
      >
        <Form layout='vertical'>
          <div className='row'>
            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item name='email'>
                  <TextArea
                    rows={18}
                    onChange={e => {
                      setTandCText(e.target.value)
                      setDisable(false)
                    }}
                    placeholder={translateTextI18N(
                      'Enter your Terms & Conditions here...'
                    )}
                    value={TandCText}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className='modalFooter'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
              {translateTextI18N('Cancel')}
            </Button>

            <Button
              disabled={Disable}
              className='blueBtn ml-3 ml-lg-4'
              htmlType='submit'
              key='submit'
              onClick={handleOk}
              loading={showLoader}
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title={successText}></SuccessModal>
      </Modal>
    </>
  )
}

export default TermsConditionsPrivacyPolicy
