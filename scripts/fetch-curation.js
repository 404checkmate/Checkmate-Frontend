import 'dotenv/config'
import { Client } from '@notionhq/client'
import { writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../src/data/curation')
const ICONS_DIR = join(__dirname, '../public/curation-icons')

/* ── Notion 서명 URL 감지 (업로드 파일은 ~1시간 후 만료) ── */
function isNotionHostedUrl(url) {
  return (
    url.includes('secure.notion-static.com') ||
    url.includes('prod-files-secure.s3') ||
    url.includes('s3.us-west-2.amazonaws.com')
  )
}

/* ── Notion 파일 URL을 public/curation-icons/ 에 저장하고 로컬 경로 반환 ── */
async function saveIconLocally(url, name) {
  mkdirSync(ICONS_DIR, { recursive: true })
  const slug = name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-')
  const ext = extname(url.split('?')[0]) || '.png'
  const filename = `${slug}${ext}`
  const dest = join(ICONS_DIR, filename)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = await res.arrayBuffer()
    writeFileSync(dest, Buffer.from(buf))
    console.log(`   🖼  Saved icon → public/curation-icons/${filename}`)
    return `/curation-icons/${filename}`
  } catch (err) {
    console.warn(`   ⚠️  아이콘 다운로드 실패 (${name}): ${err.message} — 원본 URL 유지`)
    return url
  }
}

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const DB = {
  articles:  process.env.NOTION_ARTICLES_DB_ID,
  sections:  process.env.NOTION_SECTIONS_DB_ID,
  apps:      process.env.NOTION_APPS_DB_ID,
  checklist: process.env.NOTION_CHECKLIST_DB_ID,
}

/* ── property helpers ── */
function getText(prop) {
  if (!prop) return ''
  if (prop.type === 'title')      return prop.title.map((r) => r.plain_text).join('')
  if (prop.type === 'rich_text')  return prop.rich_text.map((r) => r.plain_text).join('')
  return ''
}

function richTextToHtml(richTextArr) {
  if (!richTextArr?.length) return ''
  return richTextArr.map(block => {
    let text = block.plain_text
    if (!text) return ''
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    text = text.replace(/\n/g, '<br/>')
    const a = block.annotations
    if (a?.bold)          text = `<strong>${text}</strong>`
    if (a?.italic)        text = `<em>${text}</em>`
    if (a?.strikethrough) text = `<del>${text}</del>`
    if (a?.underline)     text = `<u>${text}</u>`
    if (a?.code)          text = `<code>${text}</code>`
    if (a?.color && a.color !== 'default') {
      text = `<span class="notion-${a.color}">${text}</span>`
    }
    return text
  }).join('')
}

function getUrl(prop) {
  if (!prop) return ''
  if (prop.type === 'url')   return prop.url || ''
  if (prop.type === 'files') return prop.files[0]?.file?.url || prop.files[0]?.external?.url || ''
  return ''
}

function getMultiSelect(prop) {
  if (!prop || prop.type !== 'multi_select') return []
  return prop.multi_select.map((s) => s.name)
}

function getNumber(prop) {
  if (!prop || prop.type !== 'number') return 0
  return prop.number ?? 0
}

function getCheckbox(prop) {
  if (!prop || prop.type !== 'checkbox') return false
  return prop.checkbox
}

function getRelationIds(prop) {
  if (!prop || prop.type !== 'relation') return []
  return prop.relation.map((r) => r.id)
}

/* ── Notion query helpers (auto-paginate) ── */
async function queryAll(database_id, filter, sorts) {
  const pages = []
  let cursor = undefined
  do {
    const params = { database_id, filter, start_cursor: cursor, page_size: 100 }
    if (sorts) params.sorts = sorts
    const res = await notion.databases.query(params)
    pages.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return pages
}

/* ── fetch all child rows related to an article (sort by order if available) ── */
async function fetchRelated(db_id, articlePageId) {
  try {
    return await queryAll(
      db_id,
      { property: 'article', relation: { contains: articlePageId } },
      [{ property: 'order', direction: 'ascending' }],
    )
  } catch {
    // `order` 필드 없는 DB는 정렬 없이 재조회
    return queryAll(
      db_id,
      { property: 'article', relation: { contains: articlePageId } },
    )
  }
}

/* ── main ── */
async function main() {
  console.log('🔄  Fetching articles...')

  const articlePages = await queryAll(
    DB.articles,
    { property: 'published', checkbox: { equals: true } },
  )

  console.log(`   Found ${articlePages.length} published article(s)`)

  for (const page of articlePages) {
    const p = page.properties

    const code = getText(p.code)
    if (!code) {
      console.warn(`   ⚠️  Skipping page ${page.id} — no code`)
      continue
    }

    console.log(`\n📄  Building [${code}]...`)

    /* ── sections ── */
    const sectionPages = await fetchRelated(DB.sections, page.id)

    // Notion 페이지 UUID → section id 문자열 매핑 (나라별로 독립 생성)
    const sectionIdMap = {}
    sectionPages.forEach((sp) => {
      const sectionId = getText(sp.properties['id']) || getText(sp.properties['Name'])
      if (sectionId) sectionIdMap[sp.id] = sectionId
    })

    const sections = sectionPages.map((sp) => {
      const s = sp.properties
      const tipIcon = getText(s.tip_icon)
      const tipBody = richTextToHtml(s.tip_body?.rich_text)
      const kicker = getText(s.kicker)
      return {
        id:    getText(s.id) || getText(s.Name),
        kicker: kicker || undefined,
        icon:  getText(s.icon),
        title: getText(s.Name),
        body:  richTextToHtml(s.body?.rich_text),
        photo: getUrl(s.photo),
        tip:   tipBody ? { icon: tipIcon, body: tipBody } : null,
      }
    })

    /* ── apps ── */
    const appPages = await fetchRelated(DB.apps, page.id)
    const apps = await Promise.all(appPages.map(async (ap) => {
      const a = ap.properties
      const name = getText(a.Name)
      let iconUrl = getUrl(a.iconUrl)
      if (iconUrl && isNotionHostedUrl(iconUrl)) {
        iconUrl = await saveIconLocally(iconUrl, name)
      }
      return {
        name,
        iconUrl,
        emoji:    getText(a.emoji),
        desc:     getText(a.desc),
        storeUrl: getUrl(a.storeUrl),
      }
    }))

    /* ── checklist ── */
    const checklistPages = await fetchRelated(DB.checklist, page.id)
    const checklist = checklistPages.map((cp) => {
      const c = cp.properties
      const rawItems = getText(c.items)
      return {
        cat:     getText(c.Name),
        section: getRelationIds(c.section).map((uuid) => sectionIdMap[uuid]).filter(Boolean),
        items:   rawItems.split('\n').map((s) => s.trim()).filter(Boolean),
      }
    })

    /* ── photos.sections = section photos + cta_photo last ── */
    const sectionPhotos = sections.map((s) => s.photo).filter(Boolean)
    const ctaPhoto = getUrl(p.cta_photo)
    const photosArr = ctaPhoto ? [...sectionPhotos, ctaPhoto] : sectionPhotos

    /* ── assemble data object ── */
    const data = {
      code,
      flag:   getText(p.flag),
      name:   p['Name']?.title?.[0]?.plain_text
           ?? p['이름']?.title?.[0]?.plain_text
           ?? '',
      cities: getMultiSelect(p.cities),

      photos: {
        hero:     getUrl(p.hero_photo),
        sections: photosArr,
      },

      hero: {
        title:    getText(p.hero_title),
        subtitle: getText(p.hero_subtitle),
      },

      sections,
      apps,
      checklist,

      footerCta: {
        title:    getText(p.footer_title),
        subtitle: getText(p.footer_subtitle),
      },
    }

    /* ── write file ── */
    mkdirSync(OUT_DIR, { recursive: true })
    const outPath = join(OUT_DIR, `${code}.js`)
    writeFileSync(
      outPath,
      `const ${code} = ${JSON.stringify(data, null, 2)}\n\nexport default ${code}\n`,
      'utf8',
    )
    console.log(`   ✅  Written → src/data/curation/${code}.js`)
  }

  // Notion에서 삭제된 국가 파일 제거
  const generatedCodes = articlePages
    .map((page) => getText(page.properties.code))
    .filter(Boolean)
  const existingFiles = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.js') && f !== 'template.js')

  existingFiles.forEach((file) => {
    const code = file.replace('.js', '')
    if (!generatedCodes.includes(code)) {
      unlinkSync(join(OUT_DIR, file))
      console.log(`🗑️   Deleted → src/data/curation/${file}`)
    }
  })

  console.log('\n🎉  Done.')
}

main().catch((err) => {
  console.error('❌  fetch-curation failed:', err)
  process.exit(1)
})
