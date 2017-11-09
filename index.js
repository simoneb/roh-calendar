const http = require('http')
const request = require('request')
const cheerio = require('cheerio')
const {map} = require('lodash/fp')
const ical = require('ical-generator')

http.createServer(serveCalendar).listen(process.env.PORT || 3000)

function serveCalendar(req, res) {
    const cal = ical({
        domain: 'www.roh.org.uk',
        name: 'Royal Opera House',
        ttl: 60 * 60 /* 1 hour*/
    })

    request('http://www.roh.org.uk/events/calendar', (err, _, body) => {
        if (err) {
            res.statusCode = 500
            return res.end(err)
        }

        const $ = cheerio.load(body)

        const events = map(li => {
            const time = $('time', li).attr('datetime')
            const a = $('a', li)
            const url = a.attr('href')
            const description = a.text()

            return {
                start: new Date(time),
                end: new Date(time),
                summary: description,
                description: description,
                //location: event.luogo,
                url,
                allDay: true
            }
        })($('table tbody tr td ul li'))

        cal.events(events)
        cal.serve(res)
    })
}