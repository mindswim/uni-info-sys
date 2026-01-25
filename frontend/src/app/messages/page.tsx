'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  MessageSquare, Send, Search, Paperclip,
  MoreVertical, Clock, Archive, Loader2,
  Star, CheckCheck, Check, RefreshCw,
  Plus, ArrowLeft, PanelLeftClose, PanelLeft
} from 'lucide-react'
import { MessageAPI } from '@/lib/api-client'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Messages' }
]

interface Message {
  id: number
  body: string
  type: string
  is_mine: boolean
  is_edited: boolean
  created_at: string
  edited_at: string | null
  sender: {
    id: number
    name: string
  }
  reply_to: {
    id: number
    body: string
    sender_name: string
  } | null
}

interface Participant {
  id: number
  name: string
  is_me: boolean
}

interface Conversation {
  id: number
  subject: string | null
  type: string
  display_name: string
  unread_count: number
  last_message_at: string | null
  latest_message: {
    id: number
    body: string
    sender_name: string
    is_mine: boolean
    created_at: string
  } | null
  participants: Participant[]
  course_section: {
    id: number
    course_code: string
    course_title: string
  } | null
}

interface SearchUser {
  id: number
  name: string
  email: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [showConversations, setShowConversations] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New conversation dialog state
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<SearchUser | null>(null)
  const [newMessageContent, setNewMessageContent] = useState('')
  const [startingConversation, setStartingConversation] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await MessageAPI.getConversations()
      setConversations(response.data || [])
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    try {
      setLoadingMessages(true)
      const response = await MessageAPI.getConversation(conversationId)
      setMessages(response.data?.messages || [])

      // Update the conversation in the list (clear unread)
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ))
    } catch (err: any) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation, fetchMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Search for users to message
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearchingUsers(true)
      const response = await MessageAPI.searchUsers(query)
      setSearchResults(response.data || [])
    } catch (err) {
      console.error('Failed to search users:', err)
      setSearchResults([])
    } finally {
      setSearchingUsers(false)
    }
  }, [])

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery) {
        searchUsers(userSearchQuery)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearchQuery, searchUsers])

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return

    const tempMessage: Message = {
      id: Date.now(),
      body: messageInput,
      type: 'text',
      is_mine: true,
      is_edited: false,
      created_at: new Date().toISOString(),
      edited_at: null,
      sender: { id: 0, name: 'You' },
      reply_to: null,
    }

    // Optimistic update
    setMessages(prev => [...prev, tempMessage])
    setMessageInput('')
    setSendingMessage(true)

    try {
      const response = await MessageAPI.sendMessage(selectedConversation.id, {
        body: tempMessage.body
      })

      // Replace temp message with real one
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? response.data : msg
      ))

      // Update conversation's latest message
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              last_message_at: new Date().toISOString(),
              latest_message: {
                id: response.data.id,
                body: response.data.body,
                sender_name: 'You',
                is_mine: true,
                created_at: response.data.created_at
              }
            }
          : conv
      ))
    } catch (err: any) {
      console.error('Failed to send message:', err)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      setMessageInput(tempMessage.body) // Restore input
    } finally {
      setSendingMessage(false)
    }
  }

  const startNewConversation = async () => {
    if (!selectedRecipient || !newMessageContent.trim() || startingConversation) return

    try {
      setStartingConversation(true)
      const response = await MessageAPI.startConversation({
        recipient_id: selectedRecipient.id,
        message: newMessageContent
      })

      // Add new conversation to list
      const newConv = response.data.conversation
      setConversations(prev => [newConv, ...prev])

      // Select the new conversation
      setSelectedConversation(newConv)
      setShowMobileChat(true)

      // Reset dialog state
      setShowNewConversation(false)
      setSelectedRecipient(null)
      setNewMessageContent('')
      setUserSearchQuery('')
      setSearchResults([])
    } catch (err: any) {
      console.error('Failed to start conversation:', err)
    } finally {
      setStartingConversation(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.latest_message?.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return format(date, 'h:mm a')
      } else if (diffDays < 7) {
        return format(date, 'EEE h:mm a')
      }
      return format(date, 'MMM d, h:mm a')
    } catch {
      return ''
    }
  }

  const formatConversationTime = (timestamp: string | null) => {
    if (!timestamp) return ''
    try {
      const date = parseISO(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchConversations} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Compact Header - Only visible on mobile */}
        <div className="flex items-center justify-between pb-3 lg:hidden">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </h1>
          <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogDescription>
                  Search for a user to start a new conversation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {selectedRecipient ? (
                  <div className="p-3 bg-accent rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{selectedRecipient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{selectedRecipient.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedRecipient.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRecipient(null)}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {searchingUsers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(user => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-accent rounded-lg cursor-pointer flex items-center gap-2"
                          onClick={() => setSelectedRecipient(user)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      ))
                    ) : userSearchQuery.length >= 2 ? (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Enter at least 2 characters to search
                      </p>
                    )}
                  </div>
                )}

                {selectedRecipient && (
                  <>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={startNewConversation}
                      disabled={!newMessageContent.trim() || startingConversation}
                      className="w-full"
                    >
                      {startingConversation ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Message
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages Interface - Fixed height, no scroll */}
        <div className="flex gap-0 flex-1 min-h-0 border rounded-lg overflow-hidden">
          {/* Conversations List */}
          {showConversations && (
          <div className={`flex flex-col border-r bg-card w-full lg:w-80 ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
            <CardHeader className="px-3 py-2 lg:p-4 flex-shrink-0 space-y-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline" className="h-9 w-9 hidden lg:flex">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Conversation</DialogTitle>
                      <DialogDescription>
                        Search for a user to start a new conversation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users by name or email..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>

                      {selectedRecipient ? (
                        <div className="p-3 bg-accent rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{selectedRecipient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{selectedRecipient.name}</p>
                              <p className="text-xs text-muted-foreground">{selectedRecipient.email}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRecipient(null)}>
                            Change
                          </Button>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {searchingUsers ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map(user => (
                              <div
                                key={user.id}
                                className="p-2 hover:bg-accent rounded-lg cursor-pointer flex items-center gap-2"
                                onClick={() => setSelectedRecipient(user)}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            ))
                          ) : userSearchQuery.length >= 2 ? (
                            <p className="text-center text-muted-foreground py-4">No users found</p>
                          ) : (
                            <p className="text-center text-muted-foreground py-4">
                              Enter at least 2 characters to search
                            </p>
                          )}
                        </div>
                      )}

                      {selectedRecipient && (
                        <>
                          <Textarea
                            placeholder="Type your message..."
                            value={newMessageContent}
                            onChange={(e) => setNewMessageContent(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <Button
                            onClick={startNewConversation}
                            disabled={!newMessageContent.trim() || startingConversation}
                            className="w-full"
                          >
                            {startingConversation ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Message
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-col">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors border-b last:border-b-0 ${
                          selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          setShowMobileChat(true)
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-xs">
                                {conversation.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                              <p className="font-medium text-sm truncate flex-1">
                                {conversation.display_name}
                              </p>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                {formatConversationTime(conversation.last_message_at)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate leading-tight">
                              {conversation.latest_message?.is_mine && 'You: '}
                              {conversation.latest_message?.body || 'No messages yet'}
                            </p>
                          </div>
                          {conversation.unread_count > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs flex-shrink-0">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </div>
          )}

          {/* Message Thread */}
          <div className={`flex flex-col bg-card flex-1 ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                <CardHeader className="px-3 py-2 lg:p-3 border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 lg:hidden"
                        onClick={() => setShowMobileChat(false)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hidden lg:flex"
                        onClick={() => setShowConversations(!showConversations)}
                      >
                        {showConversations ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                      </Button>
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {selectedConversation.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">{selectedConversation.display_name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedConversation.course_section
                            ? `${selectedConversation.course_section.course_code} - ${selectedConversation.course_section.course_title}`
                            : `${selectedConversation.participants.length} participants`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.is_mine ? 'order-2' : 'order-1'}`}>
                              {message.reply_to && (
                                <div className="mb-1 px-3 py-1 bg-muted/50 rounded text-xs text-muted-foreground border-l-2 border-muted-foreground/30">
                                  <span className="font-medium">{message.reply_to.sender_name}: </span>
                                  {message.reply_to.body}
                                </div>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.is_mine
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {!message.is_mine && (
                                  <p className="text-xs font-medium mb-1 opacity-70">{message.sender.name}</p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                              </div>
                              <div className="flex items-center space-x-2 mt-1 px-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(message.created_at)}
                                </span>
                                {message.is_edited && (
                                  <span className="text-xs text-muted-foreground">(edited)</span>
                                )}
                                {message.is_mine && (
                                  <span className="text-xs text-muted-foreground">
                                    <CheckCheck className="h-3 w-3 inline" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  <div className="flex-shrink-0">
                    <Separator />
                    <div className="p-4">
                      <div className="flex items-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Textarea
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                          disabled={sendingMessage}
                        />
                        <Button onClick={sendMessage} disabled={!messageInput.trim() || sendingMessage}>
                          {sendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a conversation from the list to start messaging
                  </p>
                  <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Conversation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Conversation</DialogTitle>
                        <DialogDescription>
                          Search for a user to start a new conversation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search users by name or email..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="pl-8"
                          />
                        </div>

                        {selectedRecipient ? (
                          <div className="p-3 bg-accent rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{selectedRecipient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{selectedRecipient.name}</p>
                                <p className="text-xs text-muted-foreground">{selectedRecipient.email}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedRecipient(null)}>
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {searchingUsers ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map(user => (
                                <div
                                  key={user.id}
                                  className="p-2 hover:bg-accent rounded-lg cursor-pointer flex items-center gap-2"
                                  onClick={() => setSelectedRecipient(user)}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              ))
                            ) : userSearchQuery.length >= 2 ? (
                              <p className="text-center text-muted-foreground py-4">No users found</p>
                            ) : (
                              <p className="text-center text-muted-foreground py-4">
                                Enter at least 2 characters to search
                              </p>
                            )}
                          </div>
                        )}

                        {selectedRecipient && (
                          <>
                            <Textarea
                              placeholder="Type your message..."
                              value={newMessageContent}
                              onChange={(e) => setNewMessageContent(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <Button
                              onClick={startNewConversation}
                              disabled={!newMessageContent.trim() || startingConversation}
                              className="w-full"
                            >
                              {startingConversation ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              Send Message
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
