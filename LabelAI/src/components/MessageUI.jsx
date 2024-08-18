import React, { useState, useRef, useEffect } from 'react';
import '../styles/MessageUI.css';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';

const MessageUI = ({ selectedImage }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (selectedImage) {
            handleSendMessage(null, selectedImage);
        }
    }, [selectedImage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = async (textInput = null, imageFile = null) => {
        const messageText = textInput || input;
        if (messageText.trim() || imageFile) {
            if (!imageFile) {
                setMessages(prev => [...prev, { text: messageText, isUser: true }]);
            }
            setInput('');
            setIsLoading(true);

            const formData = new FormData();
            if (imageFile) {
                formData.append('file', imageFile);
            }
            if (messageText.trim()) {
                formData.append('message', messageText);
            }

            try {
                const response = await fetch('http://localhost:8080/chat', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                let botResponse = data.response || "Server under maintenance";

                setMessages(prev => [...prev, { text: botResponse, isUser: false, typing: true }]);
                setIsTyping(true);
            } catch (error) {
                setMessages(prev => [...prev, { text: "Unable to reach the server.", isUser: false }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTypingComplete = () => {
        setMessages(prevMessages =>
            prevMessages.map((msg, index) =>
                index === prevMessages.length - 1 ? { ...msg, typing: false } : msg
            )
        );
        setIsTyping(false);
    };

    return (
        <div className="message-ui-container">
            <div className="messages-container">
                {messages.length === 0 && !isLoading && (
                    <div className="empty-state-message">
                        <p style={{ fontSize: '25px', color: 'rgba(155, 155, 155)', textAlign: 'center' }}>Chat with LabelAi </p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}
                    >
                        {msg.isUser ? (
                            msg.text
                        ) : msg.typing ? (
                            <TypeAnimation
                                sequence={[
                                    msg.text,
                                    () => handleTypingComplete(),
                                ]}
                                wrapper="div"
                                cursor={true}
                                speed={100}
                            />
                        ) : (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="typing-indicator">
                        <div className="typing-bubble"></div>
                        <div className="typing-bubble"></div>
                        <div className="typing-bubble"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="message-input"
                    placeholder="Type a message"
                    rows="1"
                    disabled={isTyping}
                />
                <button onClick={() => handleSendMessage()} className="send-button" aria-label="Send message" disabled={isTyping}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default MessageUI;