import puppeteer from 'puppeteer';
import { CalendarEvent } from '../core/CalendarEvent.js';

function jsonToEvent( info, prefix ) {
    
    const { schedule, opening, url, title, venue } = info;

    const startDate = new Date( `${ schedule } ${ opening }` );
    const endDate = new Date( `${ schedule } ${ opening }` );
    endDate.setHours( startDate.getHours() + 3 );

    const res = new CalendarEvent();
    res.subject = `${ prefix } Event: ${ title }`;
    res.startTime = startDate;
    res.endTime = endDate;
    res.description = url;
    res.location = venue;
    res.allDay = false;

    return res;

}

export class NoahLoader {

    constructor() {

        this.url = 'https://www.noah.co.jp/schedule/';
        this.prefix = 'Noah';

    }

    async load() {

        const browser = await puppeteer.launch( { args: [ '--lang=en-US' ] } );
        const page = await browser.newPage();
        await page.emulateTimezone( 'Asia/Tokyo' );

        const { url, prefix } = this;

        let events = [];
        return new Promise( async resolve => {

            await page.goto( url, {
                waitUntil: 'networkidle0',
                timeout: 15000
            } );

            events = await page.evaluate( () => {

                return [ ...document.querySelectorAll( '.schedule-schedule .c-schedule-item' ) ]
                    .map( el => {

                        const title = el.querySelector( '.c-schedule-body .heading' ).textContent;
                        const list = el.querySelectorAll( '.list .term, .list .desc' );
                        const url = new URL( el.querySelector( 'a' ).href, location.href ).toString();

                        const entries = { title, url };
                        for ( let i = 0; i < list.length; i += 2 ) {

                            const term = list[ i ].textContent.toLowerCase();
                            const desc = list[ i + 1 ].textContent;
                            entries[ term ] = desc;

                        }

                        return entries;

                    } );

            } );

            resolve();

        } ).then( () => {

            return page.close();

        } ).then( () => {

            return browser.close();

        } ).then( () => {

            return events.map( e => jsonToEvent( e, prefix ) );

        } );

    }

}