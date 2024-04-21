import * as ics from 'ics';

function timeToArray( date, includeTime ) {

    const res = [ date.getFullYear(), date.getMonth() + 1, date.getDate() ];
    if ( includeTime ) {

        res.push( date.getHours(), date.getMinutes() );

    }

    return res;

}

export class ICSGenerator {

    generate( events ) {

        const icsEvents = events.map( e => {

            const info = {

                title: e.subject,
                description: e.description,
                location: e.location,

            };

            if ( info.allDay ) {

                info.start = timeToArray( e.startTime );

            } else {

                info.start = timeToArray( e.startTime, true );
                info.end = timeToArray( e.endTime, true );

            }

            return info;

        } );

        return new Promise( ( resolve, reject) => {
            
            ics.createEvents( icsEvents, ( err, value ) => {

                if ( err ) {

                    reject( err );

                } else {

                    resolve( value );

                }

            } );

        } );

    }

}