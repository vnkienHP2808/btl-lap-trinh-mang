import mongoose from 'mongoose'
import Conversation from '../models/Conversation'

export async function fixIndex() {
  try {
    const MONGODB_URI = process.env.DB_URL || 'mongodb://localhost:27017/chat-app'

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected!')

    console.log('\n📋 Current conversations:')
    const convs = await Conversation.find({})
    console.log('Total:', convs.length)
    console.log(convs)

    console.log('\n📋 Current indexes:')
    const indexes = await Conversation.collection.getIndexes()
    console.log(indexes)

    console.log('\n🗑️  Dropping all indexes (except _id)...')
    await Conversation.collection.dropIndexes()
    console.log('✅ Indexes dropped!')

    console.log('\n🗑️  Deleting all conversations...')
    await Conversation.deleteMany({})
    console.log('✅ Conversations deleted!')

    console.log('\n📝 Creating new index...')
    await Conversation.collection.createIndex({ participants: 1 }, { unique: true })
    console.log('✅ Index created!')

    console.log('\n📋 New indexes:')
    const newIndexes = await Conversation.collection.getIndexes()
    console.log(newIndexes)

    console.log('\n🎉 All done! Please restart your server.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}
