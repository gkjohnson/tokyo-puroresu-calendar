import { CalendarEvent } from '../core/CalendarEvent.js'

function jsonToEvent( info ) {
    
    const { article_id, team_id, timestamp, title } = info;

    const page = `https://www.ddtpro.com/schedules/${ article_id }`;
    const startDate = new Date( timestamp * 1e3 );
    const endDate = new Date( timestamp * 1e3 );
    endDate.setHours( startDate.getHours() + 3 );

    const res = new CalendarEvent();
    res.subject = `${ team_id.toUpperCase() }: ${ title }`;
    res.startTime = startDate;
    res.endTime = endDate;
    res.description = page;
    res.allDay = false;
    
    return res;

}

export class DDTLoader {

    async load() {

        const now = new Date();
        let events = [];
        for ( let i = - 2; i < 4; i ++ ) {

            const date = new Date();
            date.setMonth( now.getMonth() + i );
    
            const year = date.getFullYear().toString();
            const month = ( date.getMonth() + 1 ).toString().padStart( 2, '0' );
            const request = await fetch( `https://api.ddtpro.com/schedules?yyyymm=${ year }${ month }` );
            const json = await request.json();
            events.push( ...json.list );

        }

        return events
            .filter( e => e.category.type === 'schedules' )
            .map( e => jsonToEvent( e ) );

    }

}