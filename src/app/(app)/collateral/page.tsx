"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Sparkles, Trash2, Download, Copy, Check } from "lucide-react";

interface SourceDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  content?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function CollateralBuilderPage() {
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newSources: SourceDocument[] = [];

    for (const file of Array.from(files)) {
      let content = "";
      
      if (file.type === "text/plain" || file.type === "text/markdown") {
        content = await file.text();
      } else {
        content = "[File uploaded - content will be processed]";
      }

      newSources.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        content,
      });
    }

    setSources([...sources, ...newSources]);

    // Add assistant message
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `I've indexed ${files.length} document${files.length > 1 ? 's' : ''}. I'm ready to create sales collateral based on your materials.\n\nYou can ask me to create:\n• One-pagers for quick prospect overviews\n• Pitch decks for presentations\n• Battle cards for competitive situations\n• Case studies showcasing customer success\n• FAQ sheets for common questions\n\nWhat would you like me to create?`,
        timestamp: new Date(),
      }]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Remove a source document
  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  // Clear all sources
  const clearAllSources = () => {
    setSources([]);
    setMessages([]);
  };

  // Handle chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    const userInput = input;
    setInput("");
    setIsGenerating(true);

    try {
      const sourceContent = sources
        .map((doc) => `${doc.name}:\n${doc.content || ""}`)
        .join("\n\n");

      const response = await fetch("/api/collateral/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: detectType(userInput),
          prompt: userInput,
          sourceContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.content,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I encountered an issue generating that content. Please try rephrasing your request or check that your source documents contain relevant information.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm unable to generate content right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    }

    setIsGenerating(false);
  };

  // Detect collateral type from user input
  const detectType = (input: string): string => {
    const lower = input.toLowerCase();
    if (lower.includes("one-pager") || lower.includes("one pager")) return "one-pager";
    if (lower.includes("pitch") || lower.includes("deck")) return "pitch-deck";
    if (lower.includes("battle")) return "battle-card";
    if (lower.includes("case")) return "case-study";
    if (lower.includes("faq")) return "faq";
    return "general";
  };

  // Copy message content to clipboard
  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download message as markdown file
  const downloadContent = (content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collateral-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Source Library */}
      <aside className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Source Library</h2>
            {sources.length > 0 && (
              <button
                onClick={clearAllSources}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative ${isDragging ? 'ring-2 ring-brand-500' : ''}`}
          >
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-brand-500 bg-brand-500/5' 
                  : 'border-border hover:border-brand-500/50 hover:bg-muted/30'
              }`}
            >
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-foreground font-medium">
                {isDragging ? 'Drop files here' : 'Upload documents'}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                or drag and drop
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                TXT, MD, PDF supported
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              accept=".txt,.md,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Source Documents List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Documents ({sources.length})
              </h3>
            </div>
            
            {sources.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No documents uploaded yet
                </p>
              </div>
            ) : (
              sources.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-brand-500/30 hover:bg-muted/30 transition-colors group"
                >
                  <FileText className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm text-foreground">
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeSource(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    aria-label="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="p-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Quick Start
          </h3>
          <div className="space-y-2">
            {[
              { label: "One-pager", prompt: "Create a one-pager" },
              { label: "Pitch deck", prompt: "Build a 12-slide pitch deck" },
              { label: "Battle card", prompt: "Generate a battle card" },
              { label: "Case study", prompt: "Create a customer case study" },
              { label: "FAQ sheet", prompt: "Build an FAQ sheet" },
            ].map((template) => (
              <button
                key={template.label}
                onClick={() => setInput(template.prompt)}
                disabled={sources.length === 0}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                </div>
                Sales Collateral Builder
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Generate professional sales materials from your product documentation
              </p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && sources.length === 0 ? (
            // Empty State
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-brand-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Ready to create sales collateral
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Upload your product documents, pitch decks, or FAQ sheets to get started. 
                  I&apos;ll help you generate customized sales materials tailored to your prospects.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-lg border border-border text-left">
                    <div className="font-medium text-foreground mb-1">One-Pagers</div>
                    <div className="text-muted-foreground">Executive summaries</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-left">
                    <div className="font-medium text-foreground mb-1">Pitch Decks</div>
                    <div className="text-muted-foreground">Sales presentations</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-left">
                    <div className="font-medium text-foreground mb-1">Battle Cards</div>
                    <div className="text-muted-foreground">Competitive guides</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-left">
                    <div className="font-medium text-foreground mb-1">Case Studies</div>
                    <div className="text-muted-foreground">Success stories</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, idx) => {
                const messageId = `msg-${idx}`;
                return (
                  <div
                    key={idx}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-4 max-w-[85%] ${
                        message.role === "user"
                          ? "bg-brand-500 text-white"
                          : "bg-card border border-border"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      
                      {message.role === "assistant" && message.content.length > 200 && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <button
                            onClick={() => copyToClipboard(message.content, messageId)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === messageId ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => downloadContent(message.content)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                  </div>
                  <div className="rounded-lg p-4 bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Generating content...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-6 bg-card">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  sources.length === 0
                    ? "Upload documents to get started..."
                    : "Describe what you'd like to create..."
                }
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                disabled={isGenerating || sources.length === 0}
              />
              <button
                type="submit"
                disabled={isGenerating || !input.trim() || sources.length === 0}
                className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
            {sources.length === 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Upload source documents to begin generating sales collateral
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}