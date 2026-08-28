import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '秦声 · 听见八百里秦川',
  description: '一个专注秦腔音乐推荐与在线播放的轻量应用。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
