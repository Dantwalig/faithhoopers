import { SessionType } from '@/lib/enums'

const labels: Record<SessionType, string> = {
  TRAINING:   'Training',
  GAME:       'Game',
  BIBLE_STUDY:'Bible Study',
  DEVOTIONAL: 'Devotional',
}

const classes: Record<SessionType, string> = {
  TRAINING:   'pill-training',
  GAME:       'pill-game',
  BIBLE_STUDY:'pill-bible',
  DEVOTIONAL: 'pill-devotional',
}

export function SessionTypeBadge({ type }: { type: SessionType }) {
  return <span className={classes[type]}>{labels[type]}</span>
}
