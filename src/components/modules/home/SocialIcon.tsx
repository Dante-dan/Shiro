/* eslint-disable react/jsx-key */
import { memo, useMemo } from 'react'
import type { ReactNode } from 'react'

import { BilibiliIcon } from '~/components/icons/platform/BilibiliIcon'
import { BlueskyIcon } from '~/components/icons/platform/BlueskyIcon'
import { NeteaseCloudMusicIcon } from '~/components/icons/platform/NeteaseIcon'
import { XIcon } from '~/components/icons/platform/XIcon'
import { MotionButtonBase } from '~/components/ui/button'
import { FloatPopover } from '~/components/ui/float-popover'
import { toast } from '~/lib/toast'

interface SocialIconProps {
  type: string
  id: string
}

type IconConfig =
  | [string | ((id: string) => string), ReactNode, string, (id: string) => string]
  | [string | ((id: string) => string), ReactNode, string, (id: string) => string, string]
  | [string | ((id: string) => string), ReactNode, string, null, string | undefined, (id: string) => void]

const iconSet: Record<string, IconConfig> = {
  github: [
    '对我的开发感兴趣 Github',
    <i className="icon-[mingcute--github-line]" />,
    '#181717',
    (id) => `https://github.com/${id}`,
  ],
  wechat_oa: [
    (id) => `微信公众号：${id}`,
    <i className="icon-[mingcute--wechat-fill]" />,
    '#07C160',
    null,
    undefined,
    (id) => {
      navigator.clipboard.writeText(id)
      toast.success(`已复制「${id}」，请前往微信搜索关注`)
    },
  ],
  redbook: [
    '小红书🚫已被禁言',
    <i className="icon-[mingcute--github-line]" style={{ "--svg": "url('https://img.dhpie.com/2024.10.22/Xiaohongshu_idt4HnK8Zr_0.svg')", backgroundColor: '#FF0077' } as React.CSSProperties} />,
    'rgba(255, 0, 119, 0)',
    () => `https://www.xiaohongshu.com/user/profile/63dfc38b0000000027028600?xhsshare=CopyLink&appuid=63dfc38b0000000027028600&apptime=1729846120&share_id=6f5733401dad4554a5d35d2ef5982582`,
    'rgba(255, 0, 119, 0.1)',
  ],
  twitter: [
    'Twitter',
    <i className="icon-[mingcute--twitter-line]" />,
    '#1DA1F2',
    (id) => `https://twitter.com/${id}`,
  ],
  x: ['x', <XIcon />, 'rgba(36,46,54,1.00)', (id) => `https://x.com/${id}`],
  telegram: [
    'Telegram',
    <i className="icon-[mingcute--telegram-line]" />,
    '#0088cc',
    (id) => `https://t.me/${id}`,
  ],
  mail: [
    'Email',
    <i className="icon-[mingcute--mail-line]" />,
    '#D44638',
    (id) => `mailto:${id}`,
  ],
  get email() {
    return this.mail
  },
  get feed() {
    return this.rss
  },
  rss: [
    'RSS',
    <i className="icon-[mingcute--rss-line]" />,
    '#FFA500',
    (id) => id,
  ],
  bilibili: [
    '哔哩哔哩',
    <BilibiliIcon />,
    '#00A1D6',
    (id) => `https://space.bilibili.com/${id}`,
  ],
  netease: [
    '网易云音乐',
    <NeteaseCloudMusicIcon />,
    '#C20C0C',
    (id) => `https://music.163.com/#/user/home?id=${id}`,
  ],
  qq: [
    'QQ',
    <i className="icon-[mingcute--qq-fill]" />,
    '#1e6fff',
    (id) => `https://wpa.qq.com/msgrd?v=3&uin=${id}&site=qq&menu=yes`,
  ],
  wechat: [
    '微信',
    <i className="icon-[mingcute--wechat-fill]" />,
    '#2DC100',
    (id) => id,
  ],
  weibo: [
    '微博',
    <i className="icon-[mingcute--weibo-line]" />,
    '#E6162D',
    (id) => `https://weibo.com/${id}`,
  ],
  discord: [
    '自由聊天 Discord',
    <i className="icon-[mingcute--discord-fill]" />,
    '#7289DA',
    (id) => `https://discord.gg/${id}`,
  ],
  bluesky: [
    'Bluesky',
    <BlueskyIcon />,
    '#0085FF',
    (id) => `https://bsky.app/profile/${id}`,
  ],
}
const icons = Object.keys(iconSet)

export const isSupportIcon = (icon: string) => icons.includes(icon)
export const SocialIcon = memo((props: SocialIconProps) => {
  const { id, type } = props

  const [name, Icon, iconBg, hrefFn, borderColor, onClickFn] = useMemo(() => {
    const config = (iconSet as any)[type as any] || []
    return [config[0], config[1], config[2], config[3], config[4], config[5]]
  }, [type])

  if (!name) return null
  const label = typeof name === 'function' ? name(id) : name

  const inner = onClickFn ? (
    <button
      type="button"
      className="flex center"
      onClick={() => onClickFn(id)}
    >
      {Icon}
    </button>
  ) : (
    <a
      target="_blank"
      href={hrefFn(id)}
      className="flex center"
      rel="noreferrer"
    >
      {Icon}
    </a>
  )

  return (
    <FloatPopover
      type="tooltip"
      triggerElement={
        <MotionButtonBase
          className="flex aspect-square size-10 rounded-full text-2xl text-white center"
          style={{
            background: iconBg,
            border: borderColor ? `dashed 0.5px ${borderColor}` : 'none',
          }}
        >
          {inner}
        </MotionButtonBase>
      }
    >
      {label}
    </FloatPopover>
  )
})
SocialIcon.displayName = 'SocialIcon'
