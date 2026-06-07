'use client';

import { useModal } from '@/providers/modal.provider';

export default function NewsDetails() {
  const { closeModal } = useModal();
  return <div className="h-[500px] w-[800px] rounded-lg bg-white p-4">This is new details.</div>;
}
