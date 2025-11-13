import mongoose from 'mongoose'

const { Schema } = mongoose
const ReadStatusSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastReadMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    }
  },
  { _id: false }
)
const ConversationSchema = new Schema(
  {
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      ],
      required: true,
      validate: [arrayLimit, '{PATH} phải có đúng 2 người dùng.']
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    readStatus: [ReadStatusSchema]
  },
  {
    timestamps: true
  }
)
function arrayLimit(val: Array<number>) {
  return val.length === 2
}

ConversationSchema.index({ 'participants.0': 1, 'participants.1': 1 }, { unique: true })
const Conversation = mongoose.model('Conversation', ConversationSchema)

export default Conversation
