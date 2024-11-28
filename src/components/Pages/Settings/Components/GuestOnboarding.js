import React, { useContext, useEffect, useState } from 'react'
import {
  Checkbox,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  Button,
  Switch,
} from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { startCase } from 'lodash'
import { SettingsState } from '../model'

export default function GuestOnboarding() {
  const {
    manageGuestOnboardingSettings,
    guestSettingsSaving,
    editingGuestSettings,
    guestSettingsList,
    guestSettingsLoading,
  } = useContext(SettingsState)
  const originData = [
    {
      key: '0',
      name: 'Guest Name',
      order: 0,
      required: true,
      expression: '',
      status: 'Inactive',
    },
    {
      key: '1',
      name: 'Name',
      order: 1,
      required: true,
      expression: '',
      status: 'active',
    },
    {
      key: '2',
      name: 'Surname',
      order: 2,
      required: true,
      expression: '',
      status: 'active',
    },
    {
      key: '3',
      name: 'Booking Referance',
      order: 3,
      required: true,
      expression: '/[^a-zA-Z0-9 -]/gi',
      status: 'active',
    },
    {
      key: '4',
      name: 'Room Number',
      order: 4,
      required: true,
      expression: '/[^a-zA-Z0-9 -]/gi',
      status: 'active',
    },
    {
      key: '5',
      name: 'Email',
      order: 5,
      required: true,
      expression: '/[^a-zA-Z0-9 -]/gi',
      status: 'Inactive',
    },
    {
      key: '6',
      name: 'Phone',
      order: 6,
      required: true,
      expression: '/[^a-zA-Z0-9 -]/gi',
      status: 'Inactive',
    },
  ]
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [editingKey, setEditingKey] = useState('')

  useEffect(() => {
    if (guestSettingsList.length > 0) {
      setData(guestSettingsList)
    } else {
      setData(originData)
    }
    // eslint-disable-next-line
  }, [editingGuestSettings])

  const isEditing = record => record.key === editingKey

  const edit = record => {
    form.setFieldsValue({
      expression: '',
      key: '',
      name: '',
      order: '',
      required: '',
      status: '',
      ...record,
    })
    setEditingKey(record.key)
  }
  const cancel = () => {
    setEditingKey('')
  }

  const save = async key => {
    try {
      let row = await form.validateFields()
      const newData = [...data]
      const index = newData.findIndex(item => key === item.key)
      if (index > -1) {
        const item = newData[index]
        row.required = item.required
        row.status = item.status
        newData.splice(index, 1, {
          ...item,
          ...row,
        })
        setData(newData)
        setEditingKey('')
      } else {
        newData.push(row)
        setData(newData)
        setEditingKey('')
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const onChangeCheckbox = (e, record, type) => {
    let newData = [...data]
    let newRec = record
    if (type === 'checkbox') {
      newRec = {
        ...newRec,
        required: e.target.checked,
      }
    } else {
      newRec = {
        ...newRec,
        status: e ? 'active' : 'Inactive',
      }
    }
    const index = newData.findIndex(item => item.key === record.key)
    newData[index] = newRec
    setData(newData)
  }

  function getInputNode(inputType, record) {
    switch (inputType) {
      case 'number':
        return <InputNumber />
      case 'text':
        return <Input />
      case 'boolean':
        return (
          <Checkbox
            checked={record?.required}
            onChange={e => {
              onChangeCheckbox(e, record, 'checkbox')
            }}
          />
        )
      case 'string':
        return (
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={record?.status === 'active'}
            onChange={e => {
              onChangeCheckbox(e, record, 'switch')
            }}
          />
        )
      default:
        return <Input />
    }
  }

  function getInputType(input) {
    switch (input) {
      case 'name':
      case 'expression':
        return 'text'
      case 'order':
        return 'number'
      case 'required':
        return 'boolean'
      case 'status':
        return 'string'
      default:
        return 'text'
    }
  }

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = getInputNode(inputType, record)
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    )
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      width: '15%',
      editable: true,
    },
    {
      title: 'Required',
      dataIndex: 'required',
      editable: true,
      render: (_, record) => {
        return <div>{String(startCase(record.required))}</div>
      },
    },
    {
      title: 'Expresion',
      dataIndex: 'expression',
      editable: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      editable: true,
      render: (_, record) => {
        return <div>{String(startCase(record.status))}</div>
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title='Sure to cancel?' onConfirm={cancel}>
              <div style={{ cursor: 'pointer' }}>Cancel</div>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        )
      },
    },
  ]
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: getInputType(col.dataIndex),
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  })

  const submitGuestSettings = () => {
    manageGuestOnboardingSettings(data)
  }

  return (
    <>
      <div className='col-12 col-xl-12'>
        <div className='row'>
          <div className='col-12 col-xl-12'>
            <div className='tablefilter-wrp'>
              <div className='form-row justify-content-end'>
                <div className='col-12'>
                  <h6>Guest Onboarding Settings</h6>
                </div>
              </div>
            </div>
            <div className='tablefilter-wrp'>
              <Form form={form} component={false}>
                <Table
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  bordered
                  dataSource={data}
                  columns={mergedColumns}
                  rowClassName='editable-row'
                  pagination={false}
                  loading={guestSettingsLoading}
                />
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div className='col-4 col-md-auto ml-auto'>
        <Button
          className='cmnBtn'
          onClick={submitGuestSettings}
          loading={guestSettingsSaving}
        >
          {editingGuestSettings ? 'Update Settings' : 'Add'}
        </Button>
      </div>
    </>
  )
}
