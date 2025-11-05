import React from 'react'
import { Layout } from 'antd'
import Header from '../header'
const { Content } = Layout

interface BaseLayoutProps {
  children: React.ReactNode
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Layout className='flex h-screen flex-col'>
      <Header title='ChatApp' />
      <Content className='flex flex-grow overflow-hidden'>{children}</Content>
    </Layout>
  )
}

export default BaseLayout