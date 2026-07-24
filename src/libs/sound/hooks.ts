'use client';

import { useEffect } from 'react';

import { initializeSounds } from './index';

/** 在首次可信用户手势中初始化音效系统。 */
export function useInitializeSounds(): void {
  useEffect(() => {
    const initializeAudio = (event: Event) => {
      if (!event.isTrusted || !initializeSounds()) return;

      window.removeEventListener('click', initializeAudio, true);
      window.removeEventListener('keydown', initializeAudio, true);
    };

    window.addEventListener('click', initializeAudio, true);
    window.addEventListener('keydown', initializeAudio, true);

    return () => {
      window.removeEventListener('click', initializeAudio, true);
      window.removeEventListener('keydown', initializeAudio, true);
    };
  }, []);
}
