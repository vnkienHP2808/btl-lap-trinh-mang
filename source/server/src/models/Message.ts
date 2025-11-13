import mongoose from 'mongoose'
const { Schema } = mongoose
const MediaSchema = new Schema(
  {
    url: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: false
    }
  },
  { _id: false }
)

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation', // Tham chiếu đến Conversation Model
      required: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến User Model
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file'],
      default: 'text'
    },
    content: {
      type: String,
      trim: true
    },
    media: [MediaSchema]
  },
  {
    timestamps: true
  }
)

const Message = mongoose.model('Message', MessageSchema)
export default Message
