import { List, Avatar, Typography, Badge } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import useListUserHook from './useListUserHook'
import { Status } from '@/shared/types/auth.type'

const { Text } = Typography

const ListUser = () => {
  const { listUser, selectedUserId, handleSelectUser } = useListUserHook()

  return (
    <List
      className='h-full p-2'
      dataSource={listUser}
      renderItem={(user) => (
        <List.Item
          key={user.id}
          className={`flex cursor-pointer items-center rounded-lg p-2 transition duration-150 ${
            selectedUserId === user.id ? 'bg-blue-50' : 'hover:bg-gray-200'
          }`}
          onClick={() => handleSelectUser(user)}
        >
          <List.Item.Meta
            avatar={
              <Badge dot status={user.status === Status.ONLINE ? 'success' : 'default'} offset={[-5, 35]}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              </Badge>
            }
            title={
              <div className='flex items-center justify-between'>
                <Text strong className='truncate'>
                  {user.username}
                </Text>
                <span
                  className={`h-2 w-2 rounded-full ${user.status === Status.ONLINE ? 'bg-green-500' : 'bg-gray-400'}`}
                  title={user.status === Status.ONLINE ? 'Online' : 'Offline'}
                />
              </div>
            }
          />
        </List.Item>
      )}
    />
  )
}

export default ListUser
