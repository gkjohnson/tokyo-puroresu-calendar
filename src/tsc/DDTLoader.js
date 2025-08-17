import puppeteer from 'puppeteer';
import { CalendarEvent } from '../core/CalendarEvent.js';

function createWaitHandle() {

    let resolve, reject;
    const promise = new Promise( ( _resolve, _reject ) => {

        resolve = _resolve;
        reject = _reject;

    } );

    promise.resolve = resolve;
    promise.reject = reject;

    return promise;

}

function jsonToEvent( info ) {
    
    const { entryId, startTime, title } = info;

    const page = `https://www.ddtpro.com/schedules/${ entryId }`;
    const startDate = new Date( startTime );
    const endDate = new Date( startTime );
    endDate.setHours( startDate.getHours() + 3 );

    const res = new CalendarEvent();
    res.subject = title;
    res.startTime = startDate;
    res.endTime = endDate;
    res.description = page;
    res.allDay = false;
    
    return res;

}

export class DDTLoader {

    async load( pages = 3 ) {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const events = [];
        return new Promise( async resolve => {

            let waitHandle = null;
            page.on( 'response', async res => {

                if ( /\/ja$/.test( res.url() ) && res.request().method() === 'POST' ) {

                    const content = JSON.parse( res.request().postData() );
                    if ( content.operationName === 'listEvents' ) {

                        const json = await res.json();
                        events.push( ...json.data.listEvents.data );

                        waitHandle.resolve();

                    }

                }

            } );

            let date = new Date();
            date.setDate( 15 );
            for ( let i = 0; i < pages; i ++ ) {

                const m = date.getMonth().toString().padStart( 2, '0' );
                const y = date.getFullYear();

                waitHandle = createWaitHandle();
                page.goto( `https://www.ddtpro.jp/schedules?date=${ y }${ m }`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 5000
                } );

                await waitHandle;

                date.setTime( date.getTime() + 30 * 24 * 60 * 60 * 1000 );

            }


            resolve();

        } ).then( () => {

            return page.close();

        } ).then( () => {

            return browser.close();

        } ).then( () => {

            return events.map( e => jsonToEvent( e ) );

        } );

    }

}