import { parseDate } from './dateutils.js'

describe('Date Utils', () => {

  it('should parse', () => {
    expect(parseDate('2019-01-07 18:00').toISOString()).toBe('2019-01-07T17:00:00.000Z')
    expect(parseDate('2019-01-07').toISOString()).toBe('2019-01-07T11:00:00.000Z')
    expect(parseDate('fsdafd 2019-01-07 afdsfd').toISOString()).toBe('2019-01-07T11:00:00.000Z')
    expect(parseDate('7.1.2020')).toBe(null)
  })

})
