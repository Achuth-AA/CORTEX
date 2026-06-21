// Thin accessor over ChatContext for message state + actions.
import { useChat } from '../context/ChatContext'

export function useMessages() {
  const {
    messages,
    loadingMessages,
    loadOlder,
    sendMessage,
    editMessage,
    deleteMessage,
    reactMessage,
  } = useChat()
  return { messages, loadingMessages, loadOlder, sendMessage, editMessage, deleteMessage, reactMessage }
}

export default useMessages
