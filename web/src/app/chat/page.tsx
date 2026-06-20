'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import ChatMessage, { Message } from '@/components/ChatMessage';
import { authFetch, isAuthenticated } from '@/lib/auth';
import { cloudChat } from '@/lib/cloudStorage';

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: `你好！我是 KB教练 💪

**我可以帮你：**
- 🏋️ 训练动作和计划
- 🍎 营养和饮食建议
- 🧘 体态改善指导
- ⚠️ 运动安全提醒

有什么想问的？`,
  timestamp: Date.now(),
};

const QUICK_QUESTIONS = [
  '如何改善圆肩？',
  '增肌吃什么？',
  '深蹲膝盖疼？',
  '一周练几次？',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载聊天历史
  useEffect(() => {
    let cancelled = false;
    if (isAuthenticated()) {
      cloudChat.getHistory().then((history) => {
        if (cancelled || history.length === 0) return;
        const loadedMessages: Message[] = history.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp,
        }));
        // 保留用户在加载期间已发送的消息
        setMessages((prev) => {
          const userAdded = prev.filter(m => m !== WELCOME_MESSAGE);
          return [WELCOME_MESSAGE, ...loadedMessages, ...userAdded];
        });
      }).catch((err) => {
        console.warn('加载聊天历史失败:', err);
      });
    }
    return () => { cancelled = true; };
  }, []);

  // 加载动画
  useEffect(() => {
    if (!isLoading) {
      setLoadingText('');
      return;
    }
    const texts = ['思考中...', '分析中...', '生成回答...'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      // 只发送最近6条消息作为上下文
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await authFetch(`${API_BASE}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: trimmedInput,
          history,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('对话错误:', err);

      let errorContent = '抱歉，出现了问题。请稍后重试。';
      if (err instanceof Error && err.name === 'AbortError') {
        errorContent = '响应超时，请检查网络后重试。';
      }

      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    setMessages([WELCOME_MESSAGE]);
    if (isAuthenticated()) {
      try {
        await cloudChat.clearAll();
      } catch (err) {
        console.warn('清空云端聊天历史失败:', err);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              ← 返回
            </Link>
            <div className="h-4 w-px bg-primary-200" />
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span className="font-semibold text-primary-800 text-sm">AI 教练</span>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
          >
            清空
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-primary-500">{loadingText}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 快捷问题 */}
      {messages.length === 1 && (
        <div className="max-w-3xl mx-auto px-3 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1.5 bg-white hover:bg-primary-50 text-primary-600 text-xs rounded-full border border-primary-200 transition-all hover:shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-primary-100 p-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white text-sm font-medium rounded-xl transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </main>
  );
}
