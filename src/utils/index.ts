
import { getCollection } from 'astro:content';

export function simpleCalcReadingTime(content: string): string {

  const wordReg = /([\u4E00-\u9FA5])|(\b[a-zA-Z]+\b)|((\b[0-9]+\b))/g
  const picReg = /!\[[^\]]+\]\([^\)]+\)/g
  const codeReg = /```.*\n([\s\S]*?)```/gm
  // 阅读时长 = 总字数 ÷ 平均阅读速度（240 wpm）(4 wps)
  // 图片 per/15s
  // 代码块根据行数 每行 2s
  // 视频 todo
  //：wpm，全称为 Words per minute
  const wordLength = content.match(wordReg)?.length || 0;
  const picLength = content.match(picReg)?.length || 0;
  const codeSec = (content.match(codeReg) || ['']).reduce((sec, cur) => {
    const len = cur.split('\n')
    return len.length * 2 + sec
  }, 0);
  let sec = 0;
  sec += wordLength / 4
  sec += picLength * 15
  sec += codeSec
  return `${Math.ceil(sec / 60)}min`;
}

export async function getBlogUsablePost() {

  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}