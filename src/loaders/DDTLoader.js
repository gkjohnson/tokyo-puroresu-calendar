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

function capitalizeFirstLetter( val ) {

    return String( val ).charAt( 0 ).toUpperCase() + String( val ).slice( 1 );

}

function jsonToEvent( info, urlBase, prefix ) {
    
    const { entryId, startTime, title, typeData, location } = info;

    const page = `${ urlBase }/${ entryId }`;
    const startDate = new Date( startTime );
    const endDate = new Date( startTime );
    endDate.setHours( startDate.getHours() + 3 );

    const type = capitalizeFirstLetter( info.type );
    const res = new CalendarEvent();
    res.subject = `${ prefix } ${ type }: ${ title }`;
    res.startTime = startDate;
    res.endTime = endDate;
    res.description = page;
    res.location = typeData?.venue || location;
    res.allDay = false;
    
    return res;

}

export class DDTLoader {

    constructor( url = 'https://www.ddtpro.com/schedules', prefix = 'DDT' ) {

        this.url = url;
        this.prefix = prefix;

    }

    async load( pages = 3 ) {

        const browser = await puppeteer.launch( { args: [ '--lang=en-US' ] } );
        const page = await browser.newPage();
        await page.emulateTimezone( 'Asia/Tokyo' );

        const { url, prefix } = this;

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
                page.goto( `${ url }?date=${ y }${ m }`, {
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

            return events.map( e => jsonToEvent( e, url, prefix ) );

        } );

    }

}