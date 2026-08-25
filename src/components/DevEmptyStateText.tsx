import React, { useState, useEffect } from 'react';
import { getRandomDevMessage } from '../utils/devMessages';

interface DevEmptyStateTextProps {
  className?: string;
}

export function DevEmptyStateText({ className }: DevEmptyStateTextProps) {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setMessage(getRandomDevMessage());
  }, []);

  if (!message) return null;

  return <span className={className}>{message}</span>;
}
