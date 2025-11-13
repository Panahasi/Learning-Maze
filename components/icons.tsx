import React from 'react';

export const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.479,10.092c.205-.47, .333-.984, .333-1.526, 0-.542-.128-1.056-.333-1.526l2.112-1.652a.5.5,0,0,0,.118-.666l-2-3.464a.5.5,0,0,0-.618-.22l-2.498,1.001c-.604-.457-1.28-.81-2.01-1.043L14.5,0h-5l-.333,2.531c-.73,.233-1.406,.586-2.01,1.043l-2.498-1.001a.5.5,0,0,0-.618,.22l-2,3.464a.5.5,0,0,0,.118,.666l2.112,1.652c-.205,.47-.333,.984-.333,1.526, 0,.542,.128,1.056,.333,1.526l-2.112,1.652a.5.5,0,0,0-.118,.666l2,3.464a.5.5,0,0,0,.618,.22l2.498-1.001c.604,.457,1.28,.81,2.01,1.043L9.5,24h5l.333-2.531c.73-.233,1.406-.586,2.01-1.043l2.498,1.001a.5.5,0,0,0,.618,.22l2-3.464a.5.5,0,0,0-.118-.666Z M12,15.5a3.5,3.5,0,1,1,3.5-3.5,3.5,3.5,0,0,1-3.5,3.5Z" />
  </svg>
);

export const ArrowIcon: React.FC<{ className?: string, direction: 'up' | 'down' | 'left' | 'right' }> = ({ className, direction }) => {
    const rotations = {
        up: 'rotate-0',
        right: 'rotate-90',
        down: 'rotate-180',
        left: '-rotate-90'
    }
    return (
        <svg className={`${className} ${rotations[direction]} transition-transform`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L0 14h7v8h10v-8h7z" />
        </svg>
    )
};

export const PlayerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 25V22.5C22 19.4624 19.5376 17 16.5 17H15.5C12.4624 17 10 19.4624 10 22.5V25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13C18.2091 13 20 11.2091 20 9C20 6.79086 18.2091 5 16 5C13.7909 5 12 6.79086 12 9C12 11.2091 13.7909 13 16 13Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const DoorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M85 95V15C85 9.47715 80.5228 5 75 5H25C19.4772 5 15 9.47715 15 15V95H5V100H95V95H85Z" fill="#A0522D"/>
        <rect x="20" y="10" width="60" height="85" fill="#D2691E" rx="5"/>
        <circle cx="70" cy="55" r="5" fill="#FFC107"/>
    </svg>
);


export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

export const CrossIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);