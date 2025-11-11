'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare, Send, Search, Paperclip,
  MoreVertical, User, Clock, Archive,
  Trash2, Star, CheckCheck, Check,
  Plus, Filter, Users, ArrowLeft, PanelLeftClose, PanelLeft
} from 'lucide-react'

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Messages' }
]

interface Message {
  id: string
  content: string
  timestamp: string
  sender: 'user' | 'recipient'
  read?: boolean
  status?: 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  recipient: {
    name: string
    role: string
    avatar?: string
    status?: 'online' | 'offline' | 'away'
  }
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

// Mock data generator
const generateMockData = (): Conversation[] => [
  {
    id: '1',
    recipient: {
      name: 'Prof. Turing',
      role: 'CS350 - AI Instructor',
      status: 'online'
    },
    lastMessage: 'Thank you for your question about neural networks...',
    lastMessageTime: '10:30 AM',
    unreadCount: 0,
    messages: [
      {
        id: '1',
        content: 'Hello Professor, I have a question about the neural network assignment.',
        timestamp: '10:15 AM',
        sender: 'user',
        status: 'read'
      },
      {
        id: '2',
        content: 'Of course! What specific part are you having trouble with?',
        timestamp: '10:20 AM',
        sender: 'recipient',
        read: true
      },
      {
        id: '3',
        content: 'I\'m confused about the backpropagation algorithm implementation. The gradient calculations don\'t seem to be working correctly.',
        timestamp: '10:25 AM',
        sender: 'user',
        status: 'read'
      },
      {
        id: '4',
        content: 'Thank you for your question about neural networks. The backpropagation algorithm can be tricky. Make sure you\'re calculating the partial derivatives correctly. I\'ve posted some additional resources on the course page that might help.',
        timestamp: '10:30 AM',
        sender: 'recipient',
        read: true
      }
    ]
  },
  {
    id: '2',
    recipient: {
      name: 'Sarah Johnson',
      role: 'Academic Advisor',
      status: 'away'
    },
    lastMessage: 'Your course selection looks good for next semester',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: '1',
        content: 'Hi Sarah, I wanted to discuss my course selection for next semester.',
        timestamp: 'Yesterday 2:00 PM',
        sender: 'user',
        status: 'read'
      },
      {
        id: '2',
        content: 'Your course selection looks good for next semester. You\'re on track to meet your graduation requirements.',
        timestamp: 'Yesterday 3:45 PM',
        sender: 'recipient',
        read: true
      }
    ]
  },
  {
    id: '3',
    recipient: {
      name: 'IT Support',
      role: 'Technical Support',
      status: 'online'
    },
    lastMessage: 'Your password has been reset successfully',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    messages: [
      {
        id: '1',
        content: 'I need help resetting my campus WiFi password.',
        timestamp: '2 days ago',
        sender: 'user',
        status: 'read'
      },
      {
        id: '2',
        content: 'Your password has been reset successfully. Please check your email for the new credentials.',
        timestamp: '2 days ago',
        sender: 'recipient',
        read: true
      }
    ]
  },
  {
    id: '4',
    recipient: {
      name: 'Dr. Smith',
      role: 'Department Chair',
      status: 'offline'
    },
    lastMessage: 'We can discuss this during office hours',
    lastMessageTime: '1 week ago',
    unreadCount: 1,
    messages: [
      {
        id: '1',
        content: 'Dr. Smith, I would like to discuss research opportunities in the department.',
        timestamp: '1 week ago',
        sender: 'user',
        status: 'read'
      },
      {
        id: '2',
        content: 'I\'d be happy to discuss research opportunities with you. We can discuss this during office hours on Tuesday.',
        timestamp: '1 week ago',
        sender: 'recipient',
        read: false
      }
    ]
  }
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [showConversations, setShowConversations] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockData = generateMockData()
      setConversations(mockData)
      setSelectedConversation(mockData[0])
      setLoading(false)
    }, 500)
  }, [])

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      status: 'sent'
    }

    // Update conversation
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: messageInput,
              lastMessageTime: 'Just now',
              messages: [...conv.messages, newMessage]
            }
          : conv
      )
    )

    // Update selected conversation
    setSelectedConversation(prev =>
      prev ? {
        ...prev,
        lastMessage: messageInput,
        lastMessageTime: 'Just now',
        messages: [...prev.messages, newMessage]
      } : null
    )

    setMessageInput('')

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thank you for your message. I\'ll get back to you soon.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sender: 'recipient',
        read: false
      }

      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: replyMessage.content,
                lastMessageTime: 'Just now',
                messages: [...conv.messages, replyMessage]
              }
            : conv
        )
      )

      if (selectedConversation) {
        setSelectedConversation(prev =>
          prev ? {
            ...prev,
            messages: [...prev.messages, replyMessage]
          } : null
        )
      }
    }, 2000)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="h-[calc(100vh-4rem)] animate-pulse">
          <div className="h-12 bg-muted rounded mb-4" />
          <div className="grid grid-cols-3 gap-4 h-[calc(100%-4rem)]">
            <div className="bg-muted rounded" />
            <div className="col-span-2 bg-muted rounded" />
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
          <Button size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Interface - Fixed height, no scroll */}
        <div className="flex gap-0 flex-1 min-h-0 border rounded-lg overflow-hidden">
          {/* Conversations List */}
          {showConversations && (
          <div className={`flex flex-col border-r bg-card w-full lg:w-80 ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
            <CardHeader className="px-3 py-2 lg:p-4 flex-shrink-0 space-y-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-col">
                  {filteredConversations.map((conversation) => (
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
                            <AvatarImage src={conversation.recipient.avatar} />
                            <AvatarFallback className="text-xs">
                              {conversation.recipient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(conversation.recipient.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <p className="font-medium text-sm truncate flex-1">
                              {conversation.recipient.name}
                            </p>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {conversation.lastMessageTime}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate leading-tight">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs flex-shrink-0">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
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
                          <AvatarImage src={selectedConversation.recipient.avatar} />
                          <AvatarFallback className="text-xs">
                            {selectedConversation.recipient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(selectedConversation.recipient.status)}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">{selectedConversation.recipient.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{selectedConversation.recipient.role}</p>
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
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.sender === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-1 px-1">
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp}
                              </span>
                              {message.sender === 'user' && (
                                <span className="text-xs text-muted-foreground">
                                  {message.status === 'read' ? (
                                    <CheckCheck className="h-3 w-3 inline" />
                                  ) : message.status === 'delivered' ? (
                                    <CheckCheck className="h-3 w-3 inline opacity-60" />
                                  ) : (
                                    <Check className="h-3 w-3 inline" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        />
                        <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                          <Send className="h-4 w-4" />
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
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}