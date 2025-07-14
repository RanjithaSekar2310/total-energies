import React from "react";

export const makeLinksClickable = (text: string): React.ReactNode => {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null) {
      // Format as string if it's a JSON object
      return Object.entries(parsed)
        .map(([key, value]) => {
          if (key.startsWith("[")) {
            return (
              <a
                key={key}
                href={value as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {key}
              </a>
            );
          }
          return `${key}: ${value}`;
        })
        .map((item, index) => <div key={index}>{item}</div>);
    }
  } catch (e) {
    // Not JSON, continue with regular processing
  }

  // Process markdown-style links
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\\)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the clickable link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {match[1]}
      </a>
    );

    lastIndex = markdownLinkRegex.lastIndex;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};
