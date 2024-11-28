import React, { useContext, useState } from 'react'
import { Select, Modal, Button, Form } from 'antd'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { GetCurrentUser, UpdateUser } from '../../../services/user'
import { AuthContext } from '../../../Router/AuthRouteProvider'
import ResponseModal from '../Modals/ResponseModal'

const { Option } = Select

const defaultResponseModal = {
  status: false,
  data: null,
}

function ChangeLanguage(props) {
  const [loading, setLoading] = useState(false)
  const { isModalVisible, closeModal, setModal, modalVisibleData } = props
  const { languageDictionary, currentLanguage, userInfo } =
    useContext(AuthContext)

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [resModal, setResModal] = useState(defaultResponseModal)
  const [selectLanguage, setSelectLanguage] = useState(
    currentLanguage ? currentLanguage : 'Select Language'
  )
  const handleOk = () => {
    closeModal()
  }

  const handleSetLanguage = async e => {
    e.preventDefault()

    if (
      currentLanguage === selectLanguage ||
      'Select Language' === selectLanguage
    )
      return

    setLoading(true)

    const userid = GetCurrentUser().uid
    const { success } = await UpdateUser(userid, {
      hotelId: userInfo.hotelId,
      currentLanguage: selectLanguage,
      previousLanguage: currentLanguage,
    })

    let res = {
      status: true,
      data: {
        status: false,
        title: 'Langauge Not Changed',
      },
    }
    if (success) {
      res.data = { status: true, title: 'Language Changed Successfully.' }
    }

    setLoading(false)
    setResModal(res)
    setModal({ ...modalVisibleData, status: false })
  }

  const handleCancel = () => {
    setSelectLanguage(currentLanguage)
    closeModal()
  }

  const closeResponseModal = () => {
    closeModal()
    setResModal(defaultResponseModal)
  }

  return (
    <>
      <Modal
        title={translateTextI18N('Change Language')}
        visible={isModalVisible}
        centered
        onOk={handleOk}
        onCancel={handleCancel}
        className='cmnModal languageselectModal'
        footer={null}
        maskClosable={false}
      >
        <Form layout='vertical'>
          <div className='row'>
            <div className='col-12 '>
              <div className='form-group cmn-input languageselector'>
                <Form.Item>
                  <Select
                    dropdownClassName='languageselectorpop'
                    value={
                      languageDictionary?.length > 0
                        ? selectLanguage
                        : 'Loading...'
                    }
                    onChange={selectedValue => {
                      setSelectLanguage(selectedValue)
                    }}
                    placeholder={
                      languageDictionary?.length > 0
                        ? 'Select Language'
                        : 'Loading...'
                    }
                  >
                    {languageDictionary?.length &&
                      languageDictionary?.map((item, idx) => (
                        <Option key={idx} value={item.id}>
                          {item.value} - {item.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={handleCancel}
            disabled={loading}
          >
            {translateTextI18N('Cancel')}
          </Button>
          <Button
            className='blueBtn ml-4'
            key='submit'
            onClick={handleSetLanguage}
            disabled={
              currentLanguage === selectLanguage ||
              loading ||
              languageDictionary?.length < 0
            }
            loading={loading}
          >
            {translateTextI18N('Apply')}
          </Button>
        </div>
      </Modal>

      <ResponseModal
        visible={resModal.status}
        title={resModal.data?.title}
        success={resModal.data?.status}
        onCancel={closeResponseModal}
      />
    </>
  )
}

export default ChangeLanguage
