// @see https://swiper.js.cn/swiper-api
'use client';
import { useRef, useState } from 'react';

import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';

import { games } from '@/constants/data';

import Button from '../ui/Button';
import LazyImg from '../ui/LazyImage';

export default function SwiperGameList() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isInit, setIsInit] = useState(false);
  return (
    <div data-name="SwiperGameList">
      <header className="mb-2 flex items-center justify-between">
        <h1 className="text-white">游戏列表</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => swiperRef.current?.slidePrev()}>上一页</Button>
          <Button onClick={() => swiperRef.current?.slideNext()}>下一页</Button>
        </div>
      </header>
      <Swiper
        slidesPerView={3}
        slidesPerGroup={3}
        direction={'horizontal'}
        spaceBetween={12}
        onInit={() => {
          console.log('__onInit__');
          setIsInit(true);
        }}
        onSwiper={(swiper) => {
          console.log('__onSwiper__');
          swiperRef.current = swiper;
        }}
      >
        {games.map((item, index) => {
          if (!isInit) {
            // return null;
            return (
              <div className="grid grid-cols-3 gap-3" key={index}>
                <div className="aspect-[110/162]">3123</div>
              </div>
            );
          }
          return (
            <SwiperSlide key={index} className="aspect-[110/162] overflow-hidden rounded-md">
              <LazyImg
                className="h-full w-full"
                loading="lazy"
                blurSrc={item.blurSrc}
                src={item.src}
                alt=""
              />
              {/* <div className="swiper-lazy-preloader"></div> */}
              {/* <ProgressiveImage src={item.src} blurSrc={item.blurSrc} alt="" /> */}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
