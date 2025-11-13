import React from 'react'
import { Layout } from 'antd'
import Header from '../header'
import storageService from '@/shared/services/storage.service'
const { Content } = Layout

interface BaseLayoutProps {
  children: React.ReactNode
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const userName = storageService.getUsernameFromLS()
  return (
    <Layout className='flex h-screen flex-col'>
      <Header title={userName ? `Hello ${userName}` : 'ChatApp'} />
      <Content className='flex flex-grow overflow-hidden'>{children}</Content>
    </Layout>
  )
}

export default BaseLayout
