/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react'
import { usePdf } from '@mikecousins/react-pdf'
import { Button, Spin } from 'antd'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons'

const defaultScale = '1'
const PdfViewer = props => {
  const { fileURL } = props
  const canvasRef = useRef(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(defaultScale)

  const handleZoomIn = () => {
    setScale(scale * 1.1)
  }

  const handleZoomOut = () => {
    setScale(scale * 0.9)
  }

  const handleResett = () => {
    setScale(defaultScale)
  }

  const objUsePDF = usePdf({
    file: fileURL,
    page,
    canvasRef,
    scale,
  })
  const { pdfDocument } = objUsePDF

  return (
    <div className='pdf-wrp'>
      {!pdfDocument && (
        <div className='d-flex align-items-center justify-content-center h-50'>
          <Spin />
        </div>
      )}
      <canvas ref={canvasRef} />
      {Boolean(pdfDocument && pdfDocument.numPages) && (
        <nav className='pdfAction-wrp'>
          <ul className='list-unstyled'>
            <li className='previous'>
              <Button className='cmnBtn' disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
            </li>
            <li className='next'>
              <Button
                className='cmnBtn'
                disabled={page === pdfDocument.numPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </li>
          </ul>
          <div className='d-flex align-items-center'>
            <Button
              type='primary'
              shape='circle'
              icon={<MinusOutlined />}
              onClick={handleZoomOut}
            />
            <Button type='primary' shape='circle' icon={<PlusOutlined />} onClick={handleZoomIn} />
            <Button
              type='primary'
              shape='circle'
              icon={<ReloadOutlined />}
              onClick={handleResett}
            />
          </div>
        </nav>
      )}
    </div>
  )
}
export default PdfViewer
