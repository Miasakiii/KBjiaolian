'use client';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // 解析 Markdown 为美观的 JSX
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={`list-${elements.length}`} className={`my-2 space-y-1 ${listType === 'ul' ? 'pl-5' : 'pl-5'}`}>
            {currentList.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    const renderInline = (text: string) => {
      // 处理粗体、斜体、行内代码
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-primary-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // 空行
      if (trimmed === '') {
        flushList();
        return;
      }

      // 标题
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${i}`} className="font-semibold text-primary-800 mt-4 mb-2 text-sm">
            {renderInline(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="font-semibold text-primary-800 mt-4 mb-2">
            {renderInline(trimmed.slice(3))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="font-bold text-primary-900 mt-4 mb-2 text-lg">
            {renderInline(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // 无序列表
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(trimmed.slice(2));
        return;
      }

      // 有序列表
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (orderedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(orderedMatch[2]);
        return;
      }

      // 分隔线
      if (trimmed === '---' || trimmed === '***') {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-3 border-primary-200" />);
        return;
      }

      // 普通段落
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed my-1">
          {renderInline(trimmed)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl ${
          isUser
            ? 'bg-primary-500 text-white rounded-br-md px-4 py-3'
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs">🤖</span>
            </div>
            <span className="text-xs font-medium text-primary-600">KB教练</span>
          </div>
        )}
        <div className={`${isUser ? '' : 'px-4 pb-3'}`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="space-y-0">{renderContent(message.content)}</div>
          )}
        </div>
        <div
          className={`text-[10px] px-4 pb-2 ${isUser ? 'text-primary-100' : 'text-gray-400'}`}
        >
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
