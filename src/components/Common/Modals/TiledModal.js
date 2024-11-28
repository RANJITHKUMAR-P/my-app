import { Modal } from 'antd'
export const TileModal = (title, content, callback) => {
  return Modal.warning({
    title: title ? title : '',
    content: content ? content : '',
    onOk() {
      callback()
    },
    wrapClassName: 'change-password-dailogue',
    className: 'cmnModal',
  })
}
