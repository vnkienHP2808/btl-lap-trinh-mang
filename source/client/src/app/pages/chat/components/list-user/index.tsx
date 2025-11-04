import React from 'react'
import { List, Avatar, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { mockUsers } from '../../dummy'

const { Text } = Typography

const ListUser: React.FC = () => {
  return (
    <List
      className='h-full p-2'
      dataSource={mockUsers}
      renderItem={(user) => (
        <List.Item
          key={user.id}
          className='flex cursor-pointer items-center rounded-lg p-2 transition duration-150 hover:bg-gray-200'
        >
          <List.Item.Meta
            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
            title={
              <div className='flex items-center space-x-2'>
                <Text strong className='truncate'>
                  {user.username}
                </Text>
                <span
                  className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                  title={user.isOnline ? 'Online' : 'Offline'}
                ></span>
              </div>
            }
          />
        </List.Item>
      )}
    />
  )
}

export default ListUser