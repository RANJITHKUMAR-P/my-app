import React, { useState } from 'react'
import { Modal, Button, Form, Tag } from 'antd'
import { getImage, SelectDrops } from '../../../../../config/utils'

const ReassignTask = ({
  visible,
  onCancel,
  task,
  onReassign,
  staffList,
  staffName,
}) => {
  const [selectedStaff, setSelectedStaff] = useState({ id: '', name: '' })
  const [loader, setLoader] = useState(false)

  const handleReassign = async () => {
    setLoader(true)
    await onReassign(task.docId, selectedStaff, task.requestedDate)
    setLoader(false)
    onCancel()
  }

  const modifiedStaffList = staffList.map(staff => ({
    ...staff,
    label: staff.label === staffName ? 'Assign To Myself' : staff.label,
    originalName: staff.label, // preserve original name
  }))

  return (
    <Modal
      className='cmnModal assignModal'
      title='Reassign Task'
      visible={visible}
      footer={null}
      onCancel={onCancel}
    >
      <ul className='list-unstyled'>
        <li>
          <figure>
            <img src={getImage('images/assign-icon2.svg')} alt='' />
          </figure>
          <h4>
            Department <em>{task?.department}</em>
          </h4>
        </li>
        <li>
          <figure>
            <img src={getImage('images/assign-icon1.svg')} alt='' />
          </figure>
          <h4>
            Service <em>{task?.service}</em>
          </h4>
          <Tag color='#059e4d'>{task?.status}</Tag>
        </li>
        <li>
          <figure>
            <img src={getImage('images/roomno.svg')} alt='' />
          </figure>
          <h4>
            Location <em>{task?.location}</em>
          </h4>
        </li>
      </ul>

      <Form layout='vertical' onFinish={handleReassign}>
        <div className='form-group cmn-input'>
          <Form.Item label='Select New Assignee' required>
            <SelectDrops
              list={modifiedStaffList}
              nameKey='label'
              valueKey='value'
              value={selectedStaff.id}
              onChange={(value, option) => {
                // Find the original staff object to get the actual name
                const originalStaff = staffList.find(s => s.value === value)
                console.log(originalStaff)

                setSelectedStaff({
                  id: value,
                  name: originalStaff?.label || option.children,
                })
              }}
              showSearch={true}
            />
          </Form.Item>
        </div>

        <div className='modalFooter mt-4'>
          <Button className='grayBtn' onClick={onCancel} disabled={loader}>
            Cancel
          </Button>
          <Button
            htmlType='submit'
            className='blueBtn ml-3 ml-lg-4'
            disabled={!selectedStaff.id || loader}
          >
            Reassign
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ReassignTask
