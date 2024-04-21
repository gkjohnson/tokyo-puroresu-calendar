import * as ics from 'ics';

function timeToArray( date ) {

    return [ date.getFullYear(), date.getMonth() + 1, date.getDate() ];

}

export class ICSGenerator {

    generate( events ) {

        const icsEvents = events.map( e => {

            const info = {

                title: e.subject,
                description: e.description,
                location: e.location,
                start: timeToArray( e.startTime ),

            };

            if ( ! info.allDay ) {

                info.end = timeToArray( e.endTime );

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