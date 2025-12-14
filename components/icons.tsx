
import React from 'react';

export const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.479,10.092c.205-.47, .333-.984, .333-1.526, 0-.542-.128-1.056-.333-1.526l2.112-1.652a.5.5,0,0,0,.118-.666l-2-3.464a.5.5,0,0,0-.618-.22l-2.498,1.001c-.604-.457-1.28-.81-2.01-1.043L14.5,0h-5l-.333,2.531c-.73,.233-1.406,.586-2.01,1.043l-2.498-1.001a.5.5,0,0,0-.618,.22l-2,3.464a.5.5,0,0,0,.118,.666l2.112,1.652c-.205,.47-.333,.984-.333,1.526, 0,.542,.128,1.056,.333,1.526l-2.112,1.652a.5.5,0,0,0-.118,.666l2,3.464a.5.5,0,0,0,.618,.22l2.498-1.001c.604,.457,1.28,.81,2.01,1.043L9.5,24h5l.333-2.531c.73-.233,1.406,.586,2.01-1.043l2.498,1.001a.5.5,0,0,0,.618,.22l2-3.464a.5.5,0,0,0-.118,.666Z M12,15.5a3.5,3.5,0,1,1,3.5-3.5,3.5,3.5,0,0,1-3.5,3.5Z" />
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
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stone Frame (Archway) */}
        <path d="M5 115 V 45 C 5 15, 15 5, 50 5 C 85 5, 95 15, 95 45 V 115 H 85 V 45 C 85 25, 80 15, 50 15 C 20 15, 15 25, 15 45 V 115 H 5 Z" fill="#4A5568" />
        <path d="M5 115 V 45 C 5 15, 15 5, 50 5 C 85 5, 95 15, 95 45 V 115 H 85 V 45 C 85 25, 80 15, 50 15 C 20 15, 15 25, 15 45 V 115 H 5 Z" stroke="#2D3748" strokeWidth="2" strokeOpacity="0.5" />
        
        {/* Door Outline with dark background */}
        <path d="M15 115 V 45 C 15 25, 20 15, 50 15 C 80 15, 85 25, 85 45 V 115 H 15 Z" fill="#2D3748" />

        {/* Wood Panels */}
        <path d="M18 115 V 45 C 18 30, 22 20, 50 20 C 78 20, 82 30, 82 45 V 115 H 18 Z" fill="#5D4037" />
        <path d="M30 20 V 115" stroke="#3E2723" strokeWidth="1" />
        <path d="M40 20 V 115" stroke="#3E2723" strokeWidth="1" />
        <path d="M50 20 V 115" stroke="#3E2723" strokeWidth="1" />
        <path d="M60 20 V 115" stroke="#3E2723" strokeWidth="1" />
        <path d="M70 20 V 115" stroke="#3E2723" strokeWidth="1" />

        {/* Inner Shadow for Depth Effect */}
        <path d="M18 115 V 45 C 18 30, 22 20, 50 20 C 78 20, 82 30, 82 45 V 115" fill="none" stroke="black" strokeWidth="4" strokeOpacity="0.2" />

        {/* Iron Bands */}
        <rect x="16" y="35" width="68" height="8" rx="1" fill="#1A202C" />
        <rect x="16" y="85" width="68" height="8" rx="1" fill="#1A202C" />
        <circle cx="22" cy="39" r="1.5" fill="#718096"/>
        <circle cx="78" cy="39" r="1.5" fill="#718096"/>
        <circle cx="22" cy="89" r="1.5" fill="#718096"/>
        <circle cx="78" cy="89" r="1.5" fill="#718096"/>

        {/* Handle Ring */}
        <circle cx="72" cy="65" r="5" stroke="#D69E2E" strokeWidth="2" fill="none" />
        <path d="M72 60 V 62" stroke="#D69E2E" strokeWidth="2" />
        <circle cx="72" cy="60" r="1.5" fill="#B7791F" />
    </svg>
);


export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

export const CrossIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9 5H5v6l-2 3v2h20v-2l-2-3V5h-4z"></path>
        <path d="M12 18v4"></path><path d="M8 22h8"></path>
    </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
);

export const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
    </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

export const MedalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.25 2.25a.75.75 0 01.75.75v2.25h12V3a.75.75 0 011.5 0v2.25a3 3 0 01-3 3v9.868l-3.75-2.813-3.75 2.813V8.25a3 3 0 01-3-3V3a.75.75 0 01.75-.75zM6 5.25v1.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5v-1.5H6z" clipRule="evenodd" />
    </svg>
);

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);

export const LightningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
);

export const ScrollIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
    </svg>
);
