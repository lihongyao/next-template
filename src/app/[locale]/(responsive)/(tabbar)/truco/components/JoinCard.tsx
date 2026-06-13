'use client';
import { CSSProperties, memo, useEffect, useRef, useState } from 'react';

import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { JOIN_TEXT_ENTER_DURATION, JOIN_TEXT_EXIT_DURATION, joinData } from '@/constants/truco';
import { getImageUrl } from '@/libs/cdn-image';
import { cn } from '@/libs/class-helpers';
import { useDevice } from '@/providers/device.provider';

export default memo(function JoinCard() {
  const swiperRef = useRef<SwiperType | null>(null);

  const { isMobile } = useDevice();

  const [currIndex, setCurrIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [textAnimationStatus, setTextAnimationStatus] = useState<'enter' | 'exit'>('enter');

  const loop = !isMobile;
  const effect = 'coverflow';

  useEffect(() => {
    if (currIndex === textIndex) {
      setTextAnimationStatus('enter');
      return;
    }
    setTextAnimationStatus('exit');
    const timer = window.setTimeout(() => {
      setTextIndex(currIndex);
      setTextAnimationStatus('enter');
    }, JOIN_TEXT_EXIT_DURATION);
    return () => window.clearTimeout(timer);
  }, [currIndex, textIndex]);

  const currentJoinItem = joinData[textIndex];
  const slideToJoinIndex = (index: number) => {
    setCurrIndex(index);

    const swiper = swiperRef.current;
    if (!swiper) return;

    if (swiper.params.loop) {
      swiper.slideToLoop(index);
      return;
    }

    swiper.slideTo(index);
  };

  useEffect(() => {
    setCurrIndex(0);
    slideToJoinIndex(0);
  }, [isMobile]);

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-[#1A1A1A] p-[10px]">
      <Swiper
        className="w-full"
        key={`${isMobile}-${effect}-${loop}`}
        data-name="StepSwiper"
        centeredSlides={true}
        loop={loop}
        slidesPerView={isMobile ? 1 : 2.7}
        modules={[EffectCoverflow]}
        effect={effect}
        speed={300}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          scale: 0.9,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        spaceBetween={12}
        onRealIndexChange={(swiper) => setCurrIndex(swiper.realIndex)}
        onSwiper={(swiper: SwiperType) => {
          swiperRef.current = swiper;
        }}
      >
        {joinData.map((item, index) => (
          <SwiperSlide key={index} className="relative w-full overflow-hidden rounded-xl">
            <img
              className="flex aspect-[319/427]"
              src={getImageUrl(item.img, {
                imageOptions: { w: 319, h: 427 },
              })}
              alt="step img"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="h-[71px] sm:h-[79px]">
        <div
          key={textIndex}
          className={cn('flex flex-col items-center justify-start gap-2')}
          style={
            {
              willChange: 'opacity, transform',
              animation: `${textAnimationStatus === 'exit' ? 'fadeOut' : 'fadeInUp'} ${textAnimationStatus === 'exit' ? JOIN_TEXT_EXIT_DURATION : JOIN_TEXT_ENTER_DURATION}ms linear both`,
            } as CSSProperties
          }
        >
          <div className="text-[16px] leading-[19px] font-bold text-white">
            {currentJoinItem.title}
          </div>
          <div className="text-xs leading-[18px] font-medium text-[#B3B8C1]">
            {currentJoinItem.desc}
          </div>
        </div>
      </div>
    </div>
  );
});
