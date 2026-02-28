"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert
        prose-p:my-1.5 prose-p:leading-relaxed
        prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold
        prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
        prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
        prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-3
        prose-table:text-xs prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1
        prose-strong:font-semibold
        prose-a:text-primary prose-a:underline
        ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
