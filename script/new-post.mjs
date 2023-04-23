import { writeFileSync } from 'fs'
import { argv } from 'node:process';
import { spawn } from 'child_process'

const BLOG_PATH = 'src/content/blog/'
const POST_FIELDS = [
  {
    name: 'title',
    default: '',
  },
  {
    name: 'createDate',
    default: new Date(),
  },
  {
    name: 'pubDate',
    default: new Date(),
  },
  {
    name: 'tags',
    default: '[]',
  },
  {
    name: 'description',
    default: ' ',
  },
  {
    name: 'draft',
    default: true,
  }
]

const [ title, description ] = argv.slice(2);


function genPost(params = {}) {
  const itemList = POST_FIELDS.map(info => {
    return `${info.name}: ${params[info.name] || info.default}`
  })
  return `---\n${itemList.join('\n')}\n---`
}

const postData = genPost({
  title,
  description
})

const newBlogPath = `${BLOG_PATH}${title || 'new-post'}.md`;
writeFileSync(newBlogPath, postData)
spawn('code', [newBlogPath])

