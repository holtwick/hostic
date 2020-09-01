export function parseDate(...dateCandidates) {
  for (let dateCandidate of dateCandidates) {
    if (dateCandidate instanceof Date) {
      return dateCandidate
    }
    if (typeof dateCandidate === 'string') {
      let date = null
      if (dateCandidate.includes(':')) {
        try {
          date = new Date(dateCandidate)
        } catch (err) {
        }
      }
      if (!(date instanceof Date)) {
        let m = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(dateCandidate)
        if (m) {
          date = new Date(+m[1], +m[2] - 1, +m[3], 12, 0)
        }
      }
      if (date instanceof Date) {
        return date
      }
    }
  }
  return null
}

export function stringifyDate(date, { lang }) {
  // https://elijahmanor.com/format-js-numbers
  return date?.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
}
