import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { 
  Send, 
  Upload, 
  User, 
  Bot as BotIcon,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Mail,
  Globe,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import logo from "../assests/valian-tek-logo.jpg";


const Bot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🤖🎉 Welcome to Job Bot Assistance! I'm here to help you find the perfect up-to-date active job opportunities. You can ask me about Software Skills, Roles, Contract / Fulltime jobs, Location based job recommendations. [Note] - Must mention the job role while searching with date or location.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  // Floating chat state
const [isOpen, setIsOpen] = useState(false);  // open/close bot
const [dragPos, setDragPos] = useState({ x: 20, y: 20 }); // default bottom-right offset
const [dragging, setDragging] = useState(false);
const dragRef = useRef(null);

// Handle drag start
const onMouseDown = (e) => {
  setDragging(true);
  dragRef.current = { startX: e.clientX, startY: e.clientY, ...dragPos };
};

// Handle dragging
const onMouseMove = (e) => {
  if (!dragging) return;
  const dx = e.clientX - dragRef.current.startX;
  const dy = e.clientY - dragRef.current.startY;
  setDragPos({
    x: Math.max(0, dragRef.current.x + dx),
    y: Math.max(0, dragRef.current.y + dy),
  });
};

// Stop drag
const onMouseUp = () => setDragging(false);

useEffect(() => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}, [dragging]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setUploadedFile(file);
      // Add confirmation message
      const newMessage = {
        id: Date.now(),
        text: `📄 Resume uploaded successfully: ${file.name}`,
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    } else {
      alert('Please upload a PDF or document file for your resume.');
    }
  };

  const sendMessageToLLM = async (message, file = null) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    return [{ text: data.reply || "No response from bot." }];
  } catch (error) {
    console.error("Error sending message to LLM:", error);
    return [{
      text: "❌ Sorry, I can't connect to the job assistant server.",
      sender: "bot"
    }];
  }
};
const fetchJobs = async (query) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/jobs/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Format ALL jobs into a single response
      const jobText = 
` 🚀 **Showing Related matches** 🔎🔥
━━━━━━━━━━━━━━━━━━━━━━

${data.results.map((job) => `
🌟 **${job.title}**   
➡️ **Company:** ${job.company}  
➡️ **Location:** ${job.location}  
➡️ **Job Type:** ${job.job_type}  
➡️ **Salary:** ${job.salary}  
➡️ **Posted On:** ${job.posted}  
➡️ **Skills Required:** ${job.skills_required || "Not Provided"}  
➡️ **Experience Required:** ${job.experience_required || "Not Provided"}  
➡️ **Company Website:** ${job.company_website ? `[Visit Website](${job.company_website})` : "Not Available"}  
➡️ **Apply Link:** ${job.apply_link ? `[Apply Here](${job.apply_link})` : "Not Available"}  
➡️ **HR Email:** ${job.hr_email}  
➡️ **HR Contact:** ${job.hr_contact}  
`).join("\n\n──────────────────────────\n\n")}
`;

      return [{
        id: Date.now(),
        text: jobText,
        sender: "bot",
        timestamp: new Date()
      }];
    } else {
      return [{
        id: Date.now(),
        text: "⚠️ No jobs found for your query.",
        sender: "bot",
        timestamp: new Date()
      }];
    }
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return [{
      id: Date.now(),
      text: "❌ Failed to fetch jobs. Please try again.",
      sender: "bot",
      timestamp: new Date()
    }];
  }
};

const handleSendMessage = async () => {
  if (!inputText.trim() && !uploadedFile) return;

  const userMessage = {
    id: Date.now(),
    text: inputText,
    sender: 'user',
    timestamp: new Date(),
    hasFile: !!uploadedFile
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setIsTyping(true);

  let responses = [];

  // 🔥 Keywords for job search
  const jobKeywords = [
    "job", "jobs", "developer", "engineer", "analyst", "designer", "manager",
    "intern", "hiring", "vacancy", "opening",
    "python", "java", "react", "node", "aws", "ml", "ai", "data", "sql", "cloud", "devops","job", "jobs", "developer", "engineer", "analyst", "designer", "manager",
  "intern", "hiring", "vacancy", "opening", "company", "posted", "date"
  ];

  // If query matches job keywords → fetch jobs
  if (jobKeywords.some(word => inputText.toLowerCase().includes(word))) {
    responses = await fetchJobs(inputText);
  } else {
    // Otherwise → talk to bot
    responses = await sendMessageToLLM(inputText, uploadedFile);
  }

  // Add bot responses with typing delay
  setTimeout(() => {
    responses.forEach((response, index) => {
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + index,
          text: response.text || "I received your message!",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, index * 500);
    });
    setIsTyping(false);
  }, 1000);

  // Reset file upload input
  setUploadedFile(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};



  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageWithIcons = (text) => {
    // Replace emojis with corresponding Lucide icons
   const iconMap = {
  '🏢': React.createElement(Building, { className: "inline w-4 h-4 text-red-600" }),
  '📍': React.createElement(MapPin, { className: "inline w-4 h-4 text-maroon" }),
  '💼': React.createElement(Briefcase, { className: "inline w-4 h-4 text-blue-600" }), // ✅ Job Type
  '💲': React.createElement(DollarSign, { className: "inline w-4 h-4 text-red-600" }),
  '📅': React.createElement(Calendar, { className: "inline w-4 h-4 text-dark-gray" }),
  '🔗': React.createElement(Globe, { className: "inline w-4 h-4 text-red-600" }),
  '📩': React.createElement(Mail, { className: "inline w-4 h-4 text-maroon" }),
  '⭐': React.createElement(Star, { className: "inline w-4 h-4 text-red-600" }),
  '✅': React.createElement(CheckCircle, { className: "inline w-4 h-4 text-green-600" }),
  '❌': React.createElement(AlertCircle, { className: "inline w-4 h-4 text-red-600" }),
  '🔍': React.createElement(Briefcase, { className: "inline w-4 h-4 text-maroon" })
};


    let formattedText = text;
    Object.entries(iconMap).forEach(([emoji, icon]) => {
      const parts = formattedText.split(emoji);
      if (parts.length > 1) {
        formattedText = parts.map((part, index) => {
          if (index < parts.length - 1) {
            return part + ' ';
          }
          return part;
        }).join('');
      }
    });

    return formattedText;
  };
  
  // Floating circular button (bottom-right)
if (!isOpen) {
  return React.createElement('button', {
    onClick: () => setIsOpen(true),
    onMouseDown: onMouseDown,
    style: {
      position: 'fixed',
      bottom: dragPos.y,
      right: dragPos.x,
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #215bea, #366bec)',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement(BotIcon, { size: 28, color: '#fff' }));
}




 // Floating button if chat is closed
if (!isOpen) {
  return React.createElement('button', {
    onClick: () => setIsOpen(true),
    style: {
      position: 'fixed',
      bottom: dragPos.y,
      right: dragPos.x,
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #215bea, #366bec)',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement(BotIcon, { size: 28, color: '#fff' }));
}

// Chat window when open
return React.createElement('div', {
  style: {
    position: 'fixed',
    bottom: dragPos.y,   // sits above floating button
    right: dragPos.x,
    width: '420px',
    height: '600px',
    zIndex: 1000,
    cursor: dragging ? 'grabbing' : 'default'
  },
  onMouseDown: onMouseDown
}, [
  React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #FCFCFC 0%, #E0DDD5 100%)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, [
    // 🔹 Header
    React.createElement('div', {
      key: 'header',
      style: {
        background: 'linear-gradient(135deg, #215bea 0%, #366bec 100%)',
        color: '#FCFCFC',
        padding: '12px 16px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(130, 13, 13, 0.3)'
      }
    }, [
      React.createElement('div', {
        key: 'header-content',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '4px'
        }
      }, [

        // Close button (top-left)
  React.createElement('button', {
    key: 'close-btn',
    onClick: () => setIsOpen(false),
    style: {
      position: 'absolute',
      right: '10px',
      top: '8px',
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer'
    }
  }, '×'),

        React.createElement('img', {
          key: 'logo',
          src: logo,
          alt: 'Valian Tek Logo',
          style: { width: '20px', height: '20px', animation: 'pulse 2s infinite' }
        }),
        React.createElement('h1', {
          key: 'title',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }
        }, 'Job Assistant Bot')
      ]),
      React.createElement('p', {
        key: 'subtitle',
        style: { margin: 0, opacity: 0.9, fontSize: '12px' }
      }, 'Your AI career companion')
    ]),

    // 🔹 Messages Area
    React.createElement('div', {
      key: 'messages',
      style: {
        flex: 1,
        backgroundColor: '#FCFCFC',
        padding: '12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }
    }, [
      ...messages.map((message) =>
        React.createElement('div', {
          key: message.id,
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '12px',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
          }
        }, [
          // Avatar
          message.sender !== 'user' && React.createElement('div', {
            key: 'avatar',
            style: {
              backgroundColor: message.sender === 'bot' ? '#007AFF' : '#898580',
              borderRadius: '50%',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              minHeight: '24px'
            }
          }, React.createElement(message.sender === 'bot' ? BotIcon : AlertCircle, {
            size: 14, color: '#FCFCFC'
          })),

          // Message Bubble
          React.createElement('div', {
            key: 'message-content',
            style: {
              maxWidth: '75%',
              backgroundColor: message.sender === 'user' ? '#007aff' :
                               message.sender === 'bot' ? '#E0DDD5' : '#898580',
              color: message.sender === 'user' ? '#FCFCFC' : '#656565',
              padding: '8px 12px',
              borderRadius: message.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              animation: 'slideIn 0.3s ease-out',
              fontSize: '13px',
              lineHeight: '1.4'
            }
          }, [
            React.createElement(ReactMarkdown, {
              key: 'text',
              children: formatMessageWithIcons(message.text),
              components: {
                strong: ({node, ...props}) => React.createElement('span', { style: { fontWeight: 'bold', color: 'gray' } }, props.children),
                a: ({node, ...props}) => React.createElement('a', { ...props, style: { color: '#007AFF', wordBreak: "break-word" }, target: "_blank", rel: "noopener noreferrer" })
              }
            }),
            message.hasFile && React.createElement('div', {
              key: 'file-indicator',
              style: { marginTop: '4px', fontSize: '10px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '2px' }
            }, [React.createElement(Upload, { key: 'upload-icon', size: 10 }), 'Resume attached']),
            React.createElement('div', {
              key: 'timestamp',
              style: { fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }
            }, message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          ]),

          // User Avatar
          message.sender === 'user' && React.createElement('div', {
            key: 'user-avatar',
            style: {
              backgroundColor: '#1d5bdfff',
              borderRadius: '50%',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              minHeight: '24px'
            }
          }, React.createElement(User, { size: 14, color: '#FCFCFC' }))
        ])
      ),
      React.createElement('div', { key: 'messages-end', ref: messagesEndRef })
    ]),

    // 🔹 Input Area (kept same)
    React.createElement('div', {
      key: 'input-area',
      style: { backgroundColor: '#FCFCFC', borderTop: '1px solid #E0DDD5', padding: '9px' }
    }, [
      React.createElement('div', {
        key: 'input-row',
        style: { display: 'flex', gap: '8px', alignItems: 'center' }
      }, [
        React.createElement('textarea', {
          value: inputText,
          onChange: (e) => setInputText(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: 'Type your message here',
          style: {
            width: '100%',
            height: '28px',
            padding: '8px 8px',
            border: '1px solid #E0DDD5',
            borderRadius: '8px',
            fontSize: '13px',
            resize: 'none',
            outline: 'none',
            backgroundColor: '#FCFCFC',
            color: '#656565'
          }
        }),
        React.createElement('button', {
          key: 'send-button',
          onClick: handleSendMessage,
          disabled: !inputText.trim(),
          style: {
            background: 'linear-gradient(135deg, #007AFF 0%, #00A3FF 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: !inputText.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            height: '36px',
            opacity: !inputText.trim() ? 0.5 : 1
          }
        }, React.createElement(Send, { size: 16, color: '#FCFCFC' }))
      ])
    ])
  ])
]);

};

export default Bot;
