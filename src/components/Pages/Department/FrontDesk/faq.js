import React, { useState, useEffect } from 'react'
import { Menu, Button } from 'antd'
import 'firebase/firestore'
import Header from '../../../Common/Header/Header'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import 'react-accessible-accordion/dist/fancy-example.css'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion'
import { db } from '../../../../config/firebase'

const AdminFAQ = () => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [faqData, setFaqData] = useState({})
  const [menuVisible, setMenuVisible] = useState(true)

  useEffect(() => {
    const unsubscribe = db.collection('faqRequests').onSnapshot(snapshot => {
      const faqData = {}
      snapshot.forEach(doc => {
        const data = doc.data()
        const { department } = data
        if (!faqData[department]) {
          faqData[department] = []
        }
        faqData[department].push({ id: doc.id, ...data })
      })
      // Sort faqData based on timestamp
      for (const key in faqData) {
        faqData[key].sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
      }
      setFaqData(faqData)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const items = [
    { label: 'Dashboard', key: 'dashboard' },
    { label: 'Hotel Details', key: 'hoteldetails' },
    { label: 'Departments', key: 'departments' },
    { label: 'Guest Info', key: 'guestinfo' },
    { label: 'Service Requests', key: 'servicerequests' },
    { label: 'Reservations', key: 'reservations' },
    { label: 'Dining', key: 'dining' },
    { label: 'Locations', key: 'locations' },
    { label: 'Title & Permissions', key: 'titles' },
    { label: 'Staff', key: 'staff' },
    { label: 'Reports', key: 'report' },
    { label: 'Promotions', key: 'promotions' },
    { label: 'HouseKeeping', key: 'houseKeeping' },
    { label: 'T&C and Privacy Policy', key: 't&c' },

  ]

  const handleOptionClick = option => {
    setSelectedOption(option)
  }

  const handleMenuVisibility = () => {
    // setMenuVisible(true)
    // setMenuVisible(!menuVisible)
  }

  const handleDepartmentButtonClick = department => {
    setSelectedOption(department)
    // setMenuVisible(false)
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard title='iNPLASS FAQ' breadcrumb={['Admin', 'FAQ']} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              marginRight: '10px',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <Button
              style={{ marginRight: '4px', borderRadius: '4px' }}
              onClick={() => {
                setMenuVisible(true)
              }}
            >
              HOP
            </Button>
            <Button
              style={{ borderRadius: '4px', marginRight: '4px' }}
              onClick={() => {
                handleDepartmentButtonClick('staffapp')
                setMenuVisible(false)
              }}
            >
              Staff APP
            </Button>
            <Button
              style={{ borderRadius: '4px' }}
              onClick={() => {
                handleDepartmentButtonClick('guestapp')
                setMenuVisible(false)
              }}
            >
              Guest APP
            </Button>
          </div>
          <div>
            <div
              className='faq-container'
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              {menuVisible && (
                <Menu
                  style={{
                    width: 200,
                  }}
                  defaultSelectedKeys={['frontdesk']}
                  defaultOpenKeys={['frontdesk']}
                  items={items}
                  onClick={({ key }) => handleDepartmentButtonClick(key)}
                />
              )}
              <div
                className='faq-content'
                style={{
                  flex: 1,
                  padding: '20px',
                  borderLeft: '1px solid #ccc',
                }}
              >
                <Accordion
                  allowMultipleExpanded={true}
                  allowZeroExpanded={true}
                >
                  {selectedOption &&
                    faqData &&
                    faqData[selectedOption] &&
                    faqData[selectedOption].map((faq, index) => (
                      <AccordionItem key={index}>
                        <AccordionItemHeading>
                          <AccordionItemButton>
                            {faq.question}
                          </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                          <p style={{ whiteSpace: 'pre-wrap' }}>{faq.answer}</p>
                          {faq.imageUrl && (
                            <img
                              src={faq.imageUrl}
                              alt='FAQ Image'
                              style={{
                                height: '400px',
                                width: '800px',
                                marginTop: '20px',
                                objectFit: 'contain',
                              }}
                            />
                          )}
                        </AccordionItemPanel>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AdminFAQ
